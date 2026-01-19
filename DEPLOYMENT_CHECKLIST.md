# 🚀 Stripe Billing Deployment Checklist

## ✅ Completed (By Claude)

- [x] Backend code written (billing router, webhooks, auth middleware)
- [x] Frontend code written (billing page with 4 tabs)
- [x] Database migration file created
- [x] Dependencies installed (stripe, pyjwt, @stripe/stripe-js)
- [x] Documentation created (3 comprehensive guides)

---

## 🎯 Your Action Items (30-45 minutes)

### Phase 1: Database (5 minutes)

- [ ] **Run Migration in Supabase**
  - Open: https://supabase.com/dashboard/project/wawipucycyhjwoajjyye/sql
  - Copy contents of: `backend/migrations/20260120_stripe_billing.sql`
  - Paste in SQL Editor → Click Run
  - **Verify:** Check Table Editor for 5 new tables

**✅ Completion Check:** Tables `stripe_customers`, `subscriptions`, `payment_methods`, `invoices`, `stripe_webhook_events` exist

---

### Phase 2: Stripe Configuration (15 minutes)

- [ ] **Create Stripe Products** (Test Mode)

  **Solo AE Product:**
  - [ ] Name: Solo AE
  - [ ] Monthly price: $49
  - [ ] Yearly price: $470
  - [ ] Metadata: `tier_name=solo_ae`, `pos_credits_limit=10`
  - [ ] **📝 Save price IDs:** `price_____` (monthly), `price_____` (yearly)

  **Pro AE Product:**
  - [ ] Name: Pro AE
  - [ ] Monthly price: $149
  - [ ] Yearly price: $1,430
  - [ ] Metadata: `tier_name=pro_ae`, `pos_credits_limit=unlimited`
  - [ ] **📝 Save price IDs:** `price_____` (monthly), `price_____` (yearly)

- [ ] **Get Stripe API Keys**
  - [ ] Go to: https://dashboard.stripe.com/test/apikeys
  - [ ] **📝 Copy Publishable Key:** `pk_test_____________________`
  - [ ] **📝 Copy Secret Key:** `sk_test_____________________`

- [ ] **Get Supabase JWT Secret**
  - [ ] Go to: Supabase Dashboard → Settings → API → JWT Settings
  - [ ] **📝 Copy JWT Secret:** `_____________________________`

**✅ Completion Check:** You have 4 price IDs + 2 Stripe keys + 1 JWT secret

---

### Phase 3: Update Code with Price IDs (5 minutes)

- [ ] **Update backend/routers/billing.py (line ~206)**
  ```python
  tier_mapping = {
      "price_YOUR_SOLO_MONTHLY": "solo_ae",  # Replace
      "price_YOUR_SOLO_YEARLY": "solo_ae",   # Replace
      "price_YOUR_PRO_MONTHLY": "pro_ae",    # Replace
      "price_YOUR_PRO_YEARLY": "pro_ae",     # Replace
  }
  ```

- [ ] **Update frontend/app/(app)/billing/page.tsx (line ~83)**
  ```typescript
  solo: {
      monthly: { price: 49, priceId: 'price_YOUR_SOLO_MONTHLY' },  // Replace
      yearly: { price: 470, priceId: 'price_YOUR_SOLO_YEARLY' },   // Replace
  },
  pro: {
      monthly: { price: 149, priceId: 'price_YOUR_PRO_MONTHLY' },  // Replace
      yearly: { price: 1430, priceId: 'price_YOUR_PRO_YEARLY' },   // Replace
  }
  ```

- [ ] **Commit changes**
  ```bash
  git add backend/routers/billing.py frontend/app/(app)/billing/page.tsx
  git commit -m "feat: Add Stripe price IDs"
  ```

**✅ Completion Check:** Code updated with real price IDs, changes committed

---

### Phase 4: Environment Variables (10 minutes)

**Railway (Backend) - 5 variables:**

- [ ] Go to: Railway Dashboard → beautyops-production → Variables
- [ ] Add: `STRIPE_SECRET_KEY` = `sk_test_your_key`
- [ ] Add: `STRIPE_PUBLISHABLE_KEY` = `pk_test_your_key`
- [ ] Add: `STRIPE_WEBHOOK_SECRET` = (leave empty for now)
- [ ] Add: `FRONTEND_URL` = `https://beauty-ops.vercel.app`
- [ ] Add: `SUPABASE_JWT_SECRET` = `your_jwt_secret`

**Vercel (Frontend) - 1 variable:**

- [ ] Go to: Vercel Dashboard → beauty-ops → Settings → Environment Variables
- [ ] Add: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_your_key`
- [ ] **Important:** Redeploy after adding variables!

**✅ Completion Check:** All 6 environment variables added

---

### Phase 5: Deploy (Auto - 5 minutes)

- [ ] **Push to GitHub**
  ```bash
  git push origin main
  ```

- [ ] **Wait for deployments:**
  - Railway: Auto-deploys backend
  - Vercel: Auto-deploys frontend

- [ ] **Verify deployments successful:**
  - Railway: Check logs for "Application startup complete"
  - Vercel: Check deployment status is "Ready"

**✅ Completion Check:** Both services deployed without errors

---

### Phase 6: Webhook Configuration (5 minutes)

- [ ] **Create Webhook Endpoint in Stripe**
  - Go to: https://dashboard.stripe.com/test/webhooks
  - Click "Add endpoint"
  - URL: `https://beautyops-production.up.railway.app/api/billing/webhook`
  - Events to select:
    - [x] `customer.subscription.created`
    - [x] `customer.subscription.updated`
    - [x] `customer.subscription.deleted`
    - [x] `invoice.payment_succeeded`
    - [x] `invoice.payment_failed`
  - Click "Add endpoint"

- [ ] **Get Webhook Signing Secret**
  - Click on the webhook you just created
  - Click "Reveal" on Signing secret
  - **📝 Copy:** `whsec_____________________`

- [ ] **Add to Railway**
  - Railway → Variables
  - Update: `STRIPE_WEBHOOK_SECRET` = `whsec_your_secret`
  - Wait for auto-redeploy

**✅ Completion Check:** Webhook endpoint created, secret added to Railway

---

### Phase 7: Testing (10 minutes)

- [ ] **Access Billing Page**
  - Go to: https://beauty-ops.vercel.app/billing
  - Should see pricing cards with Monthly/Yearly toggle

- [ ] **Test Billing Toggle**
  - [ ] Toggle between Monthly/Yearly
  - [ ] Verify prices update correctly
  - [ ] Yearly should show "SAVE 20%" badge

- [ ] **Test Subscription Flow**
  - [ ] Click "Subscribe" on Solo AE (monthly)
  - [ ] Should redirect to Stripe Checkout
  - [ ] Use test card: `4242 4242 4242 4242`
  - [ ] Expiry: Any future date (e.g., 12/34)
  - [ ] CVC: Any 3 digits (e.g., 123)
  - [ ] ZIP: Any 5 digits (e.g., 12345)
  - [ ] Complete payment

- [ ] **Verify Subscription Created**
  - [ ] Should redirect back to `/billing?success=true`
  - [ ] Page should show "Current Plan: SOLO AE"
  - [ ] Status should be "active"
  - [ ] Billing interval should be "monthly"

- [ ] **Check Database Records**
  - [ ] Supabase → Table Editor → `stripe_customers` (should have 1 row)
  - [ ] `subscriptions` table (should have 1 row)
  - [ ] `invoices` table (should have 1 row)
  - [ ] `stripe_webhook_events` table (should have 3-5 events)

- [ ] **Test Usage Tab**
  - [ ] Click "Usage" tab
  - [ ] Should show: POS Credits 0/10, Briefings 0/5
  - [ ] Progress bars should display

- [ ] **Test Customer Portal**
  - [ ] Click "Manage Subscription"
  - [ ] Should redirect to Stripe Customer Portal
  - [ ] Verify can view payment methods
  - [ ] Verify can see billing history

**✅ Completion Check:** End-to-end subscription flow works!

---

## 🎉 Success Criteria

All checkboxes above should be ✅

### Critical Validations:

- ✅ Database tables created (5 tables)
- ✅ Stripe products created (2 products, 4 prices)
- ✅ Environment variables configured (6 total)
- ✅ Code deployed (Railway + Vercel)
- ✅ Webhook configured and receiving events
- ✅ Test subscription completed successfully
- ✅ Database shows subscription record
- ✅ Billing page displays subscription correctly

---

## 🐛 Troubleshooting

### Issue: Checkout redirects to error page
**Fix:** Check `STRIPE_PUBLISHABLE_KEY` in Vercel, ensure it's `pk_test_`

### Issue: Webhook events not appearing in database
**Fix:**
1. Check `STRIPE_WEBHOOK_SECRET` in Railway
2. Verify webhook URL in Stripe Dashboard
3. Check Railway logs for errors

### Issue: "No authorization header" error
**Fix:** Check `SUPABASE_JWT_SECRET` in Railway matches Supabase settings

### Issue: Subscription not showing after checkout
**Fix:**
1. Check Stripe Dashboard → Webhooks for failed events
2. Check Railway logs for webhook processing errors
3. Verify `user_id` metadata in Stripe subscription

---

## 📊 Monitoring

After deployment, monitor these:

- **Stripe Dashboard:** https://dashboard.stripe.com/test/subscriptions
- **Supabase Tables:** Check subscriptions table growth
- **Railway Logs:** `railway logs` for errors
- **Vercel Logs:** Check deployment runtime logs

---

## 🚀 Going Live (When Ready)

When ready for production:

1. Create products in Stripe **Live mode**
2. Get Live API keys (pk_live_, sk_live_)
3. Update Railway/Vercel with Live keys
4. Create Live webhook endpoint
5. Update price IDs in code
6. Deploy
7. Test with real card (refund immediately)

---

## 📞 Support

- Stripe Docs: https://stripe.com/docs
- Supabase Docs: https://supabase.com/docs
- BeautyOps Setup Guide: `STRIPE_SETUP_GUIDE.md`
- Quick Commands: `STRIPE_MCP_COMMANDS.md`

---

**Ready to start? Begin with Phase 1! 👆**
