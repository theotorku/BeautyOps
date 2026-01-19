# Stripe Billing - Quick Start Guide

## ✅ What's Been Completed

1. ✅ **All code written** - Backend API, frontend UI, database schema
2. ✅ **Dependencies installed** - Stripe SDK, PyJWT, @stripe/stripe-js
3. ✅ **Billing page created** - Full-featured with 4 tabs (subscription, usage, payment, history)
4. ✅ **Webhook handlers** - Complete subscription lifecycle management

## 🚀 Quick Start (3 Steps)

### Step 1: Run Database Migration (5 minutes)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor** → **New Query**
3. Copy/paste contents of: `backend/migrations/20260120_stripe_billing.sql`
4. Click **Run**

✅ This creates 5 tables: `stripe_customers`, `subscriptions`, `payment_methods`, `invoices`, `stripe_webhook_events`

---

### Step 2: Configure Stripe (10 minutes)

#### A. Create Stripe Products (Test Mode)

1. Go to https://dashboard.stripe.com (switch to **Test mode**)
2. **Products** → **Add product**

**Solo AE:**
- Name: `Solo AE`
- Price: `$49` monthly + `$470` yearly
- Metadata: `tier_name=solo_ae`, `pos_credits_limit=10`

**Pro AE:**
- Name: `Pro AE`
- Price: `$149` monthly + `$1,430` yearly
- Metadata: `tier_name=pro_ae`, `pos_credits_limit=unlimited`

**📝 Copy all 4 price IDs** (e.g., `price_1ABC...`, `price_2XYZ...`)

#### B. Update Code with Price IDs

Edit these 2 files with your actual Stripe price IDs:

**File 1:** `backend/routers/billing.py` (line ~206)
```python
tier_mapping = {
    "price_YOUR_SOLO_MONTHLY": "solo_ae",
    "price_YOUR_SOLO_YEARLY": "solo_ae",
    "price_YOUR_PRO_MONTHLY": "pro_ae",
    "price_YOUR_PRO_YEARLY": "pro_ae",
}
```

**File 2:** `frontend/app/(app)/billing/page.tsx` (line ~83)
```typescript
solo: {
    monthly: { price: 49, priceId: 'price_YOUR_SOLO_MONTHLY' },
    yearly: { price: 470, priceId: 'price_YOUR_SOLO_YEARLY' },
},
pro: {
    monthly: { price: 149, priceId: 'price_YOUR_PRO_MONTHLY' },
    yearly: { price: 1430, priceId: 'price_YOUR_PRO_YEARLY' },
}
```

#### C. Get API Keys

1. **Stripe Dashboard** → **Developers** → **API keys**
   - Copy **Publishable key** (pk_test_...)
   - Copy **Secret key** (sk_test_...)

2. **Supabase Dashboard** → **Settings** → **API**
   - Scroll to **JWT Settings**
   - Copy **JWT Secret**

---

### Step 3: Add Environment Variables

#### Railway (Backend)

Go to Railway → Your project → Backend service → **Variables**

Add these 5 variables:
```
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=(leave empty for now)
FRONTEND_URL=https://beauty-ops.vercel.app
SUPABASE_JWT_SECRET=YOUR_JWT_SECRET
```

#### Vercel (Frontend)

Go to Vercel → Your project → **Settings** → **Environment Variables**

Add this 1 variable:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

---

## 🧪 Test It!

1. **Deploy both services** (Railway auto-deploys, push to trigger Vercel)
2. Visit: https://beauty-ops.vercel.app/billing
3. Toggle Monthly/Yearly pricing
4. Click "Subscribe" on a tier
5. Use test card: `4242 4242 4242 4242` (any expiry/CVC)
6. Complete checkout → You should see your subscription!

---

## 🔗 Webhook Setup (After Testing)

1. **Stripe Dashboard** → **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://beautyops-production.up.railway.app/api/billing/webhook`
3. Events: Select these 5:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
4. Copy **Signing secret** (whsec_...)
5. Add to Railway: `STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET`
6. Redeploy backend

---

## 📚 Full Documentation

- **Complete Guide:** `STRIPE_SETUP_GUIDE.md` (detailed walkthrough)
- **Migration Status:** `MIGRATION_STATUS.md` (what's done)

---

## 🎯 Features Implemented

✅ Monthly/Yearly billing toggle (20% yearly discount)
✅ Stripe Checkout integration
✅ Subscription management via Customer Portal
✅ Usage tracking dashboard (AI credits, briefings)
✅ Billing history with invoice downloads
✅ Payment method management
✅ Webhook-based subscription syncing
✅ Row-level security for data protection
✅ Complete authentication flow

---

## ⚠️ Important Notes

- All code is in **test mode** - no real charges
- Switch to live keys when ready for production
- Database migration is **idempotent** (safe to re-run)
- Webhook secret needed for production (not local dev)

---

## 🆘 Need Help?

Check `STRIPE_SETUP_GUIDE.md` for:
- Detailed screenshots
- Troubleshooting section
- Going live checklist
- Common errors & fixes

**Ready to go live?** Follow Phase 7 in the setup guide!
