# Stripe Products Setup - Railway Sandbox

## Products to Create/Verify

Since you've started creating products in Stripe's Railway sandbox, here's what we need:

### Product 1: Solo AE
**Product Details:**
- Name: `Solo AE`
- Description: `Essential toolkit for independent representatives`

**Prices:**
1. **Monthly**: $49.00 USD
   - Recurring: Every 1 month
   - Metadata: `tier_name=solo_ae`, `pos_credits_limit=10`

2. **Yearly**: $470.00 USD
   - Recurring: Every 1 year
   - Metadata: `tier_name=solo_ae`, `pos_credits_limit=10`

### Product 2: Pro AE
**Product Details:**
- Name: `Pro AE`
- Description: `The standard for high-performing beauty teams`

**Prices:**
1. **Monthly**: $149.00 USD
   - Recurring: Every 1 month
   - Metadata: `tier_name=pro_ae`, `pos_credits_limit=unlimited`

2. **Yearly**: $1,430.00 USD
   - Recurring: Every 1 year
   - Metadata: `tier_name=pro_ae`, `pos_credits_limit=unlimited`

---

## Next Steps

1. **Check Stripe Dashboard** to see what products/prices you already created
2. **Copy the 4 price IDs** (they look like `price_1ABC...`)
3. **Paste them below** so I can update the code files:

```
SOLO_MONTHLY_PRICE_ID: price_____________________________
SOLO_YEARLY_PRICE_ID:  price_____________________________
PRO_MONTHLY_PRICE_ID:  price_____________________________
PRO_YEARLY_PRICE_ID:   price_____________________________
```

4. I'll automatically update:
   - `backend/routers/billing.py`
   - `frontend/app/(app)/billing/page.tsx`

---

## Quick Stripe Dashboard Links

- **Products**: https://dashboard.stripe.com/test/products
- **Prices**: Click on each product to see its prices
- **Webhooks**: https://dashboard.stripe.com/test/webhooks (we'll create this next)

---

## Webhook Endpoint to Create

After we update the code:

**URL:** `https://beautyops-production.up.railway.app/api/billing/webhook`

**Events:**
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed

---

**Ready?** Check your Stripe Dashboard and share the 4 price IDs!
