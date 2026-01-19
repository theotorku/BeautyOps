# 💳 Stripe Billing Integration - Complete Package

## 🎉 What's Been Built

A **production-ready Stripe billing system** with subscription management, usage tracking, and automated webhook syncing.

### Features Implemented ✅

- ✅ **Monthly & Yearly Billing** - Toggle between billing periods (20% yearly discount)
- ✅ **Two Pricing Tiers** - Solo AE ($49/$470) & Pro AE ($149/$1,430)
- ✅ **Stripe Checkout** - Secure payment processing
- ✅ **Customer Portal** - Self-service subscription management
- ✅ **Usage Tracking** - Real-time credit consumption monitoring
- ✅ **Billing History** - Invoice list with PDF downloads
- ✅ **Webhook Automation** - Real-time subscription syncing
- ✅ **Row-Level Security** - Database protection with RLS policies
- ✅ **JWT Authentication** - Secure API endpoint protection

---

## 📁 Project Structure

### Backend Files (9 files created/modified)

```
backend/
├── migrations/
│   └── 20260120_stripe_billing.sql        # Database schema (5 tables + RLS)
├── services/
│   ├── __init__.py
│   └── stripe_service.py                  # Stripe API wrapper
├── middleware/
│   ├── __init__.py
│   └── auth.py                            # JWT authentication
├── routers/
│   └── billing.py                         # Billing API & webhooks
├── main.py                                # Updated with billing router
└── requirements.txt                       # Added stripe + pyjwt
```

### Frontend Files (5 files created/modified)

```
frontend/
├── lib/
│   ├── stripe.ts                          # Stripe.js loader
│   └── api.ts                             # Authenticated fetch helper
├── app/
│   └── (app)/
│       ├── billing/
│       │   └── page.tsx                   # Billing page (4 tabs)
│       └── layout.tsx                     # Updated sidebar nav
└── package.json                           # Added @stripe/stripe-js
```

### Documentation (6 guides created)

```
docs/
├── QUICK_START.md                         # 3-step quick setup (30 min)
├── STRIPE_SETUP_GUIDE.md                  # Complete reference guide
├── DEPLOYMENT_CHECKLIST.md                # Step-by-step checklist
├── STRIPE_MCP_COMMANDS.md                 # Stripe CLI/MCP commands
├── RUN_MIGRATION.md                       # Database migration guide
└── README_STRIPE.md                       # This file
```

---

## 🚀 Quick Start (Choose Your Path)

### Path 1: Super Quick (30 minutes)
**For:** Getting it working ASAP
**Guide:** [QUICK_START.md](QUICK_START.md)

1. Run database migration (5 min)
2. Create Stripe products & get keys (15 min)
3. Add environment variables & deploy (10 min)

### Path 2: Methodical (45 minutes)
**For:** Understanding every step
**Guide:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

- Complete 7-phase checklist with validation checks
- Includes troubleshooting for each phase
- Best for production deployments

### Path 3: Reference
**For:** Deep dive into setup details
**Guide:** [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md)

- Comprehensive walkthrough
- Screenshots and examples
- Going live instructions

---

## 💡 Key Files You'll Edit

Only **2 files** need your Stripe price IDs:

### 1. Backend Price Mapping
**File:** `backend/routers/billing.py` (line ~206)

```python
def determine_tier_from_price(price_id: str) -> str:
    tier_mapping = {
        "price_YOUR_SOLO_MONTHLY": "solo_ae",
        "price_YOUR_SOLO_YEARLY": "solo_ae",
        "price_YOUR_PRO_MONTHLY": "pro_ae",
        "price_YOUR_PRO_YEARLY": "pro_ae",
    }
    return tier_mapping.get(price_id, "solo_ae")
```

### 2. Frontend Pricing Display
**File:** `frontend/app/(app)/billing/page.tsx` (line ~83)

```typescript
const tiers = {
    solo: {
        monthly: { price: 49, priceId: 'price_YOUR_SOLO_MONTHLY' },
        yearly: { price: 470, priceId: 'price_YOUR_SOLO_YEARLY' },
    },
    pro: {
        monthly: { price: 149, priceId: 'price_YOUR_PRO_MONTHLY' },
        yearly: { price: 1430, priceId: 'price_YOUR_PRO_YEARLY' },
    }
};
```

---

## 🗄️ Database Schema

**5 new tables created:**

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `stripe_customers` | User-to-Stripe mapping | user_id, stripe_customer_id |
| `subscriptions` | Active subscriptions | tier, status, billing_interval |
| `payment_methods` | Credit card info | card_brand, card_last4 |
| `invoices` | Billing history | amount_paid, invoice_pdf |
| `stripe_webhook_events` | Idempotency tracking | stripe_event_id, processed |

**Security:** All tables have RLS policies - users can only access their own data.

---

## 🌐 API Endpoints

### Public Endpoints (Frontend → Backend)

```
POST   /api/billing/create-checkout-session    # Create Stripe Checkout
POST   /api/billing/create-portal-session      # Manage subscription
GET    /api/billing/subscription/{user_id}     # Get subscription details
GET    /api/billing/invoices/{user_id}         # Get billing history
POST   /api/billing/webhook                    # Stripe webhook handler
```

### Webhook Events Handled

- `customer.subscription.created` → Save new subscription
- `customer.subscription.updated` → Update subscription status
- `customer.subscription.deleted` → Mark as canceled
- `invoice.payment_succeeded` → Save invoice
- `invoice.payment_failed` → Log failure

---

## 🎨 UI Components

### Billing Page (`/billing`)

**4 Tabs:**

1. **Subscription**
   - Monthly/Yearly toggle with pricing
   - Subscription status display
   - Manage subscription button

2. **Usage**
   - POS credits (10 for Solo, ∞ for Pro)
   - Briefings count
   - Visual progress bars

3. **Payment**
   - Payment method management via Stripe Portal
   - Card information display

4. **History**
   - Invoice list with dates and amounts
   - PDF download links
   - Payment status indicators

---

## 🔐 Environment Variables Required

### Railway (Backend) - 5 variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://beauty-ops.vercel.app
SUPABASE_JWT_SECRET=your_jwt_secret
```

### Vercel (Frontend) - 1 variable

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🧪 Testing

### Test Card Numbers

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

Any future expiry, any CVC, any ZIP code

### Test Flow

1. Sign up / Log in
2. Navigate to `/billing`
3. Toggle Monthly/Yearly
4. Click "Subscribe"
5. Complete Stripe Checkout with test card
6. Verify subscription appears
7. Check database for records
8. Test Customer Portal access

---

## 📊 Pricing Tiers

| Tier | Monthly | Yearly | Savings | POS Credits | Features |
|------|---------|--------|---------|-------------|----------|
| **Solo AE** | $49 | $470 | $118/yr | 10/month | Basic features |
| **Pro AE** | $149 | $1,430 | $358/yr | Unlimited | All features + team |
| **Enterprise** | Custom | Custom | - | Unlimited | White-glove service |

---

## 🐛 Common Issues & Fixes

### "No authorization header"
**Cause:** Missing or incorrect JWT secret
**Fix:** Verify `SUPABASE_JWT_SECRET` in Railway

### Checkout redirects to error
**Cause:** Wrong Stripe publishable key
**Fix:** Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel

### Webhooks not processing
**Cause:** Missing or wrong webhook secret
**Fix:** Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

### Database migration fails
**Cause:** Permission issues or duplicate run
**Fix:** Migration is idempotent - safe to re-run

---

## 📈 Going Live Checklist

When ready for production:

- [ ] Create products in Stripe **Live mode**
- [ ] Get **Live API keys** (pk_live_, sk_live_)
- [ ] Create **Live webhook** endpoint
- [ ] Update **Railway environment variables** with live keys
- [ ] Update **Vercel environment variables** with live keys
- [ ] Update **price IDs** in code (2 files)
- [ ] Test with **real card** (refund immediately)
- [ ] Monitor Stripe Dashboard for real transactions
- [ ] Enable production monitoring/alerting

---

## 📞 Support & Resources

### Documentation
- **Stripe Docs:** https://stripe.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

### Your Guides
- Quick setup: [QUICK_START.md](QUICK_START.md)
- Full walkthrough: [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md)
- Deployment checklist: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- Stripe commands: [STRIPE_MCP_COMMANDS.md](STRIPE_MCP_COMMANDS.md)
- Migration guide: [RUN_MIGRATION.md](RUN_MIGRATION.md)

### Monitoring
- Stripe Dashboard: Check subscriptions, events, payments
- Supabase: Monitor database tables and usage
- Railway Logs: Backend errors and webhook processing
- Vercel Logs: Frontend errors and API calls

---

## 🎯 Success Metrics

After setup, you should see:

- ✅ Billing page accessible at `/billing`
- ✅ Monthly/Yearly toggle working
- ✅ Stripe Checkout flow completing
- ✅ Subscriptions appearing in database
- ✅ Webhooks processing automatically
- ✅ Usage tracking displaying correctly
- ✅ Customer Portal accessible

---

## 🚀 Next Steps

1. **Choose your guide** (Quick Start recommended)
2. **Run database migration** (5 minutes)
3. **Configure Stripe** (15 minutes)
4. **Deploy & test** (10 minutes)
5. **Monitor & iterate**

**Start here:** [QUICK_START.md](QUICK_START.md)

---

Built with ❤️ for BeautyOps AI
