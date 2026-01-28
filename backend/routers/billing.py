from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel
from typing import Optional
from services.stripe_service import stripe_service
from middleware.auth import get_current_user
from datetime import datetime
import stripe
import os
from db import supabase

router = APIRouter()


# Request/Response Models
class CheckoutRequest(BaseModel):
    price_id: str
    user_id: str
    email: str


class PortalRequest(BaseModel):
    user_id: str


# Endpoints
@router.post("/create-checkout-session")
async def create_checkout_session(request: CheckoutRequest):
    """Create Stripe Checkout session for new subscription"""
    try:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        session_url = await stripe_service.create_checkout_session(
            user_id=request.user_id,
            email=request.email,
            price_id=request.price_id,
            success_url=f"{frontend_url}/billing?success=true",
            cancel_url=f"{frontend_url}/pricing"
        )
        return {"url": session_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-portal-session")
async def create_portal_session(request: PortalRequest):
    """Create Stripe Customer Portal session for subscription management"""
    try:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        portal_url = await stripe_service.create_portal_session(
            user_id=request.user_id,
            return_url=f"{frontend_url}/billing"
        )
        return {"url": portal_url}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subscription/{user_id}")
async def get_subscription(user_id: str):
    """Get current subscription details for user"""
    try:
        subscription = await stripe_service.get_subscription(user_id)
        if not subscription:
            return {"subscription": None, "status": "none"}
        return {"subscription": subscription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/invoices/{user_id}")
async def get_invoices(user_id: str, limit: int = 12):
    """Get billing history for user"""
    try:
        invoices = await stripe_service.get_invoices(user_id, limit)
        return {"invoices": invoices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """Handle Stripe webhook events"""
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Check for duplicate events (idempotency)
    existing = supabase.table("stripe_webhook_events").select("*").eq("stripe_event_id", event.id).execute()
    if existing.data:
        return {"status": "duplicate_event", "event_id": event.id}

    # Log event
    supabase.table("stripe_webhook_events").insert({
        "stripe_event_id": event.id,
        "event_type": event.type,
        "payload": event.data.object
    }).execute()

    # Handle different event types
    try:
        if event.type == "customer.subscription.created":
            await handle_subscription_created(event.data.object)
        elif event.type == "customer.subscription.updated":
            await handle_subscription_updated(event.data.object)
        elif event.type == "customer.subscription.deleted":
            await handle_subscription_deleted(event.data.object)
        elif event.type == "invoice.payment_succeeded":
            await handle_invoice_payment_succeeded(event.data.object)
        elif event.type == "invoice.payment_failed":
            await handle_invoice_payment_failed(event.data.object)

        # Mark as processed
        supabase.table("stripe_webhook_events").update({
            "processed": True,
            "processed_at": datetime.now().isoformat()
        }).eq("stripe_event_id", event.id).execute()

        return {"status": "success", "event_type": event.type}
    except Exception as e:
        # Log error
        supabase.table("stripe_webhook_events").update({
            "error_message": str(e)
        }).eq("stripe_event_id", event.id).execute()
        raise HTTPException(status_code=500, detail=f"Webhook processing error: {str(e)}")


# Webhook Event Handlers
async def handle_subscription_created(subscription):
    """Handle new subscription creation"""
    user_id = subscription.metadata.get("user_id")
    if not user_id:
        print(f"Warning: No user_id in subscription metadata: {subscription.id}")
        return

    # Map price IDs to tiers
    price_id = subscription.items.data[0].price.id
    tier = determine_tier_from_price(price_id)
    interval = subscription.items.data[0].price.recurring.interval

    billing_interval = "monthly" if interval == "month" else "yearly"

    supabase.table("subscriptions").insert({
        "user_id": user_id,
        "stripe_subscription_id": subscription.id,
        "stripe_customer_id": subscription.customer,
        "subscription_tier": tier,
        "status": subscription.status,
        "billing_interval": billing_interval,
        "current_period_start": datetime.fromtimestamp(subscription.current_period_start).isoformat(),
        "current_period_end": datetime.fromtimestamp(subscription.current_period_end).isoformat(),
        "trial_end": datetime.fromtimestamp(subscription.trial_end).isoformat() if subscription.trial_end else None
    }).execute()

    # Sync to user_profiles
    supabase.table("user_profiles").update({
        "subscription_tier": tier,
        "subscription_status": subscription.status,
        "subscription_started_at": datetime.fromtimestamp(subscription.created).isoformat()
    }).eq("user_id", user_id).execute()


async def handle_subscription_updated(subscription):
    """Handle subscription updates (upgrades, downgrades, cancellations)"""
    # Update subscription record
    supabase.table("subscriptions").update({
        "status": subscription.status,
        "current_period_end": datetime.fromtimestamp(subscription.current_period_end).isoformat(),
        "cancel_at_period_end": subscription.cancel_at_period_end,
        "canceled_at": datetime.fromtimestamp(subscription.canceled_at).isoformat() if subscription.canceled_at else None
    }).eq("stripe_subscription_id", subscription.id).execute()

    # Update tier if changed
    price_id = subscription.items.data[0].price.id
    tier = determine_tier_from_price(price_id)

    supabase.table("subscriptions").update({
        "subscription_tier": tier
    }).eq("stripe_subscription_id", subscription.id).execute()

    # Sync to user_profiles
    result = supabase.table("subscriptions").select("user_id").eq("stripe_subscription_id", subscription.id).execute()
    if result.data:
        user_id = result.data[0]["user_id"]
        supabase.table("user_profiles").update({
            "subscription_tier": tier,
            "subscription_status": subscription.status
        }).eq("user_id", user_id).execute()


async def handle_subscription_deleted(subscription):
    """Handle subscription cancellation"""
    supabase.table("subscriptions").update({
        "status": "canceled"
    }).eq("stripe_subscription_id", subscription.id).execute()

    # Sync to user_profiles
    result = supabase.table("subscriptions").select("user_id").eq("stripe_subscription_id", subscription.id).execute()
    if result.data:
        user_id = result.data[0]["user_id"]
        supabase.table("user_profiles").update({
            "subscription_status": "canceled"
        }).eq("user_id", user_id).execute()


async def handle_invoice_payment_succeeded(invoice):
    """Save paid invoice to database"""
    # Find user from customer
    customer = supabase.table("stripe_customers").select("user_id").eq("stripe_customer_id", invoice.customer).execute()
    if not customer.data:
        print(f"Warning: No user found for customer: {invoice.customer}")
        return

    user_id = customer.data[0]["user_id"]

    supabase.table("invoices").insert({
        "user_id": user_id,
        "stripe_invoice_id": invoice.id,
        "stripe_customer_id": invoice.customer,
        "amount_paid": invoice.amount_paid,
        "currency": invoice.currency,
        "status": "paid",
        "invoice_pdf": invoice.invoice_pdf,
        "period_start": datetime.fromtimestamp(invoice.period_start).isoformat(),
        "period_end": datetime.fromtimestamp(invoice.period_end).isoformat(),
        "paid_at": datetime.fromtimestamp(invoice.status_transitions.paid_at).isoformat() if invoice.status_transitions.paid_at else None
    }).execute()


async def handle_invoice_payment_failed(invoice):
    """Handle failed payment"""
    # Log the failure
    print(f"Payment failed for invoice: {invoice.id}, customer: {invoice.customer}")
    # TODO: Send email notification to user
    # TODO: Update subscription status if needed


def determine_tier_from_price(price_id: str) -> str:
    """
    Determine subscription tier from Stripe price ID
    PRODUCTION Price IDs (Live Mode)
    """
    tier_mapping = {
        # Solo AE
        "price_1SrOOH03NjWbp5DbcEqGXxbS": "solo_ae",  # Monthly $49
        "price_1SrOSl03NjWbp5DbC9qZ931h": "solo_ae",  # Yearly $470
        # Pro AE
        "price_1SrMWs03NjWbp5DbTjJcBfS1": "pro_ae",   # Monthly $149
        "price_1SrOTa03NjWbp5Db9workK1L": "pro_ae",   # Yearly $1,430
    }

    return tier_mapping.get(price_id, "solo_ae")
