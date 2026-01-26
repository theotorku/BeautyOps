import stripe
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
from db import supabase

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


class StripeService:
    """Handles all Stripe API interactions and database synchronization"""

    async def create_customer(self, user_id: str, email: str) -> Dict[str, Any]:
        """
        Create Stripe customer and save to database
        Returns existing customer if already created
        """
        # Check if customer already exists
        existing = supabase.table("stripe_customers").select("*").eq("user_id", user_id).execute()
        if existing.data:
            return existing.data[0]

        # Create in Stripe
        customer = stripe.Customer.create(
            email=email,
            metadata={"user_id": user_id}
        )

        # Save to database
        result = supabase.table("stripe_customers").insert({
            "user_id": user_id,
            "stripe_customer_id": customer.id,
            "email": email
        }).execute()

        return result.data[0]

    async def create_checkout_session(
        self,
        user_id: str,
        email: str,
        price_id: str,
        success_url: str,
        cancel_url: str
    ) -> str:
        """Create Stripe Checkout session for subscription"""
        customer_data = await self.create_customer(user_id, email)

        session = stripe.checkout.Session.create(
            customer=customer_data["stripe_customer_id"],
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1
            }],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            subscription_data={
                "trial_period_days": 14,  # 14-day free trial
                "metadata": {"user_id": user_id}
            },
            metadata={"user_id": user_id}
        )

        return session.url

    async def create_portal_session(self, user_id: str, return_url: str) -> str:
        """Create Stripe Customer Portal session for subscription management"""
        customer = supabase.table("stripe_customers").select("*").eq("user_id", user_id).execute()

        if not customer.data:
            raise ValueError("Customer not found")

        portal_session = stripe.billing_portal.Session.create(
            customer=customer.data[0]["stripe_customer_id"],
            return_url=return_url
        )

        return portal_session.url

    async def get_subscription(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get current active subscription for user"""
        result = supabase.table("subscriptions").select("*").eq("user_id", user_id).eq("status", "active").execute()
        return result.data[0] if result.data else None

    async def get_invoices(self, user_id: str, limit: int = 12) -> List[Dict[str, Any]]:
        """Get billing history for user"""
        result = supabase.table("invoices").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
        return result.data if result.data else []

    async def get_payment_methods(self, user_id: str) -> List[Dict[str, Any]]:
        """Get payment methods for user"""
        result = supabase.table("payment_methods").select("*").eq("user_id", user_id).execute()
        return result.data if result.data else []


# Singleton instance
stripe_service = StripeService()
