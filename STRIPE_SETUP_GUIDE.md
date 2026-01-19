# Stripe Billing Integration - Setup Guide

## Overview
This guide walks you through setting up the complete Stripe billing integration for BeautyOps AI.

## Phase 1: Database Setup

### 1. Run the Supabase Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `wawipucycyhjwoajjyye`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `backend/migrations/20260120_stripe_billing.sql`
6. Paste into the SQL editor
7. Click **Run** to execute the migration

This creates:
- `stripe_customers` - Links users to Stripe customer IDs
- `subscriptions` - Subscription details (tier, status, billing period)
- `payment_methods` - Credit card information
- `invoices` - Billing history
- `stripe_webhook_events` - Webhook event tracking
- Row Level Security (RLS) policies for data protection

---

## Phase 2: Stripe Dashboard Configuration

### 2. Create Stripe Products & Prices

1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Switch to **Test Mode** (toggle in top-right)
3. Navigate to **Products** → **Add Product**

#### Solo AE Product:
- **Name**: Solo AE
- **Description**: Essential toolkit for independent representatives
- **Pricing**:
  - Monthly: $49.00 USD recurring
  - Yearly: $470.00 USD recurring (save $118/year)
- **Metadata** (click "Add metadata"):
  - `tier_name`: `solo_ae`
  - `pos_credits_limit`: `10`

After creating, **note the Price IDs**:
- `price_XXXXX` (monthly) → Copy this
- `price_YYYYY` (yearly) → Copy this

#### Pro AE Product:
- **Name**: Pro AE
- **Description**: The standard for high-performing beauty teams
- **Pricing**:
  - Monthly: $149.00 USD recurring
  - Yearly: $1,430.00 USD recurring (save $358/year)
- **Metadata**:
  - `tier_name`: `pro_ae`
  - `pos_credits_limit`: `unlimited`

After creating, **note the Price IDs**:
- `price_ZZZZZ` (monthly) → Copy this
- `price_AAAAA` (yearly) → Copy this

### 3. Update Backend Code with Price IDs

Edit `backend/routers/billing.py` and update the `determine_tier_from_price()` function with your actual price IDs:

```python
def determine_tier_from_price(price_id: str) -> str:
    tier_mapping = {
        # Solo AE (replace with your actual IDs)
        "price_XXXXX": "solo_ae",  # Monthly
        "price_YYYYY": "solo_ae",  # Yearly
        # Pro AE (replace with your actual IDs)
        "price_ZZZZZ": "pro_ae",   # Monthly
        "price_AAAAA": "pro_ae",   # Yearly
    }
    return tier_mapping.get(price_id, "solo_ae")
```

Also update `frontend/app/(app)/billing/page.tsx` with the same price IDs:

```typescript
const tiers = {
    solo: {
        name: 'Solo AE',
        monthly: { price: 49, priceId: 'price_XXXXX' },  // Your monthly price ID
        yearly: { price: 470, priceId: 'price_YYYYY' },  // Your yearly price ID
        // ...
    },
    pro: {
        name: 'Pro AE',
        monthly: { price: 149, priceId: 'price_ZZZZZ' },  // Your monthly price ID
        yearly: { price: 1430, priceId: 'price_AAAAA' },  // Your yearly price ID
        // ...
    }
};
```

---

## Phase 3: Backend Environment Variables

### 4. Get Stripe API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy the **Publishable key** (starts with `pk_test_`)
3. Copy the **Secret key** (starts with `sk_test_`)

### 5. Get Supabase JWT Secret

1. Go to Supabase Dashboard → **Settings** → **API**
2. Scroll down to **JWT Settings**
3. Copy the **JWT Secret** (long alphanumeric string)

### 6. Add Environment Variables to Railway

1. Go to Railway Dashboard: https://railway.app
2. Select your `beautyops-production` project
3. Click on your backend service
4. Go to **Variables** tab
5. Add the following environment variables:

```
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=(leave empty for now - will add after webhook setup)
FRONTEND_URL=https://beauty-ops.vercel.app
SUPABASE_JWT_SECRET=YOUR_JWT_SECRET_FROM_SUPABASE
```

### 7. Install Backend Dependencies

Since you've updated `requirements.txt`, Railway will automatically install the new dependencies (`stripe` and `pyjwt`) on next deployment.

### 8. Deploy Backend

Railway will auto-deploy when you push changes, or manually trigger a deployment:

```bash
cd backend
git add .
git commit -m "feat: Add Stripe billing integration"
git push
```

Wait for deployment to complete and note your backend URL: `https://beautyops-production.up.railway.app`

---

## Phase 4: Stripe Webhook Configuration

### 9. Create Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://beautyops-production.up.railway.app/api/billing/webhook`
4. Click **Select events**
5. Select these events:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Click **Add endpoint**

### 10. Get Webhook Signing Secret

1. After creating the webhook, click on it to view details
2. Scroll down to **Signing secret**
3. Click **Reveal** and copy the secret (starts with `whsec_`)
4. Go back to Railway → Variables
5. Update `STRIPE_WEBHOOK_SECRET` with the secret you just copied
6. Redeploy backend (Railway will auto-redeploy after variable change)

---

## Phase 5: Frontend Setup

### 11. Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install `@stripe/stripe-js@^2.4.0`

### 12. Add Environment Variables to Vercel

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your `beauty-ops` project
3. Go to **Settings** → **Environment Variables**
4. Add the following:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_YOUR_PUBLISHABLE_KEY` |

**Note**: The existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_API_URL` should already be configured.

### 13. Deploy Frontend

```bash
git add .
git commit -m "feat: Add Stripe billing page with subscription management"
git push
```

Vercel will auto-deploy. Visit https://beauty-ops.vercel.app/billing to see your new billing page!

---

## Phase 6: Testing

### 14. Test Subscription Flow

1. **Sign up or log in** to your app: https://beauty-ops.vercel.app
2. Navigate to **Billing** in the sidebar (💳 icon)
3. You should see the pricing cards with Monthly/Yearly toggle
4. Toggle between billing periods to see pricing update
5. Click **Subscribe** on a tier

**Expected behavior:**
- Redirects to Stripe Checkout
- Pre-filled with your email
- Test card number: `4242 4242 4242 4242`
- Any future expiry date (e.g., 12/34)
- Any CVC (e.g., 123)
- Any ZIP (e.g., 12345)

6. Complete the checkout
7. You should be redirected back to `/billing?success=true`
8. Your subscription should now appear

### 15. Test Subscription Management

1. Click **Manage Subscription** button
2. You should be redirected to Stripe Customer Portal
3. Test these features:
   - Update payment method
   - View billing history
   - Cancel subscription
   - Update plan (upgrade/downgrade)

### 16. Verify Database Records

1. Go to Supabase Dashboard → **Table Editor**
2. Check these tables:
   - `stripe_customers` - Should have your user record
   - `subscriptions` - Should show your active subscription
   - `invoices` - Should show your first invoice
   - `stripe_webhook_events` - Should show webhook events processed

### 17. Test Usage Tracking

1. In the billing page, click the **Usage** tab
2. You should see:
   - POS Credits: 0 / 10 (for Solo AE) or 0 / ∞ (for Pro AE)
   - Briefings: 0 / 5 (for Solo AE) or 0 / ∞ (for Pro AE)
3. Progress bars should display correctly

---

## Phase 7: Going Live (When Ready)

### 18. Switch to Live Mode

**Backend (Railway):**
1. Get live Stripe API keys from **Developers** → **API keys** (switch to Live mode)
2. Create live products and prices (repeat Phase 2 in Live mode)
3. Update Railway environment variables:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY=pk_live_...`
4. Create live webhook endpoint with live webhook secret
5. Update `STRIPE_WEBHOOK_SECRET=whsec_...` (live secret)

**Frontend (Vercel):**
1. Update Vercel environment variable:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`

**Code:**
1. Update price IDs in `billing.py` and `billing/page.tsx` with live price IDs
2. Deploy changes

---

## Troubleshooting

### Webhook events not processing
- Check Railway logs for errors: `railway logs`
- Verify webhook secret is correct
- Test webhook in Stripe Dashboard → Webhooks → Send test webhook

### Checkout not redirecting
- Check `FRONTEND_URL` is set correctly in Railway
- Verify Stripe publishable key is correct in Vercel
- Check browser console for errors

### Subscription not appearing after checkout
- Check Supabase `subscriptions` table
- Check Railway logs for webhook processing errors
- Verify `user_id` is included in checkout session metadata

### Authentication errors (401)
- Verify `SUPABASE_JWT_SECRET` is set in Railway
- Check that JWT token is being sent from frontend
- Test token validity in Supabase Dashboard → API → JWT Debugger

---

## Summary of Files Created/Modified

### Backend:
- ✅ `backend/migrations/20260120_stripe_billing.sql` - Database schema
- ✅ `backend/requirements.txt` - Added stripe and pyjwt
- ✅ `backend/services/stripe_service.py` - Stripe API wrapper
- ✅ `backend/middleware/auth.py` - JWT authentication
- ✅ `backend/routers/billing.py` - Billing endpoints and webhooks
- ✅ `backend/main.py` - Added billing router and updated CORS

### Frontend:
- ✅ `frontend/package.json` - Added @stripe/stripe-js
- ✅ `frontend/lib/stripe.ts` - Stripe.js loader
- ✅ `frontend/lib/api.ts` - Authenticated fetch helper
- ✅ `frontend/app/(app)/billing/page.tsx` - Complete billing UI
- ✅ `frontend/app/(app)/layout.tsx` - Added billing nav link

---

## Next Steps

1. ✅ Complete Phase 1-5 above
2. Test thoroughly in test mode
3. Customize email notifications for failed payments
4. Add usage enforcement to protected endpoints (POS analysis, etc.)
5. Monitor Stripe Dashboard for subscription metrics
6. When ready for production, switch to live mode (Phase 7)

---

## Support

If you encounter issues:
- Check Railway logs: `railway logs --service backend`
- Check Vercel logs: Vercel Dashboard → Deployments → Select deployment → Runtime Logs
- Check Stripe Dashboard → Webhooks for failed events
- Check Supabase logs: Supabase Dashboard → Logs

For Stripe-specific issues, refer to: https://stripe.com/docs
