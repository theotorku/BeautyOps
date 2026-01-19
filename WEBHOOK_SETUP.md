# Stripe Webhook Setup - Final Step

## ✅ Price IDs Updated!

Both code files have been updated with your Railway sandbox Stripe price IDs:

- Solo AE Monthly: `price_1SrOcs00JoLiYcMMIsqjZ1J4` ($49)
- Solo AE Yearly: `price_1SrOc800JoLiYcMMnzQFRXXq` ($470)
- Pro AE Monthly: `price_1SrOdQ00JoLiYcMMzbeQJIUQ` ($149)
- Pro AE Yearly: `price_1SrOeA00JoLiYcMMA200uwXC` ($1,430)

---

## 🚀 Next: Create Webhook Endpoint in Stripe

### Step 1: Go to Stripe Webhooks

https://dashboard.stripe.com/test/webhooks

### Step 2: Click "Add endpoint"

**Endpoint URL:**
```
https://beautyops-production.up.railway.app/api/billing/webhook
```

**Description:** (optional)
```
BeautyOps AI - Subscription & Invoice Events
```

### Step 3: Select Events to Listen

Click "Select events" and choose these 5 events:

- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**Quick way:** Use the search box and type each event name to find them faster.

### Step 4: Click "Add endpoint"

### Step 5: Get Webhook Signing Secret

After creating the endpoint:

1. Click on the webhook endpoint you just created
2. Scroll down to **Signing secret**
3. Click **Reveal**
4. Copy the secret (starts with `whsec_`)

**Example:** `whsec_1234567890abcdefghijklmnopqrstuvwxyz...`

---

## 🔧 Add Webhook Secret to Railway

### Step 6: Update Railway Environment Variable

1. Go to Railway Dashboard → Your Project → Backend Service
2. Click **Variables** tab
3. Find `STRIPE_WEBHOOK_SECRET` (should already exist but empty)
4. Paste your webhook signing secret: `whsec_your_secret_here`
5. Railway will auto-redeploy

---

## 📝 Complete Railway Environment Variables

Make sure all these are set in Railway:

```
✅ STRIPE_SECRET_KEY=sk_test_...
✅ STRIPE_PUBLISHABLE_KEY=pk_test_...
✅ STRIPE_WEBHOOK_SECRET=whsec_...
✅ FRONTEND_URL=https://beauty-ops.vercel.app
✅ SUPABASE_JWT_SECRET=your_jwt_secret_here
```

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] All 5 events selected (subscription + invoice events)
- [ ] Webhook signing secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` added to Railway
- [ ] Backend redeployed on Railway
- [ ] Frontend has `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel

---

## 🧪 Test Your Setup

### Test 1: Access Billing Page

1. Go to: https://beauty-ops.vercel.app/billing
2. Should see pricing cards with Monthly/Yearly toggle
3. Toggle between billing periods to verify prices update

### Test 2: Complete a Test Subscription

1. Click "Subscribe" on Solo AE (Monthly - $49)
2. Should redirect to Stripe Checkout
3. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
4. Complete payment
5. Should redirect back to `/billing?success=true`
6. Your subscription should now appear!

### Test 3: Verify Database Records

Go to Supabase Dashboard → Table Editor:

- [ ] `stripe_customers` - Should have 1 row with your user
- [ ] `subscriptions` - Should have 1 row (status: active)
- [ ] `invoices` - Should have 1 row (first payment)
- [ ] `stripe_webhook_events` - Should have 3-5 events

### Test 4: Check Stripe Dashboard

Go to Stripe Dashboard → Customers:

- Should see a new customer with your email
- Should see active subscription
- Should see successful payment

### Test 5: Webhook Events

Go to Stripe Dashboard → Webhooks → Click your endpoint:

- Should see event logs
- All events should have status: "Success"
- If any failed, check Railway logs for errors

---

## 🐛 Troubleshooting

### Webhook events show "Failed" status

**Check Railway Logs:**
```bash
railway logs --service backend
```

Look for errors related to webhook processing.

**Common causes:**
- Missing `STRIPE_WEBHOOK_SECRET` in Railway
- Incorrect webhook secret
- Database permission issues

### "No authorization header" error

**Fix:** Verify `SUPABASE_JWT_SECRET` in Railway matches Supabase Dashboard → Settings → API → JWT Secret

### Checkout redirects to error page

**Fix:** Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel environment variables

---

## 📊 Monitor Your Webhooks

After deployment, monitor:

- **Stripe Dashboard → Webhooks:** Check event delivery status
- **Railway Logs:** Watch for webhook processing
- **Supabase Tables:** Verify data is being saved

---

## 🎉 Success Indicators

You'll know everything works when:

- ✅ Can access billing page
- ✅ Can toggle between Monthly/Yearly pricing
- ✅ Checkout flow completes successfully
- ✅ Subscription appears after payment
- ✅ Database has all records (customer, subscription, invoice)
- ✅ Webhook events show "Success" in Stripe Dashboard
- ✅ Can access Customer Portal via "Manage Subscription"

---

## 🚀 You're Ready!

Once webhook is configured and Railway has all environment variables:

1. Commit and push the price ID changes
2. Wait for deployments
3. Test the complete flow
4. Celebrate! 🎉

---

**Next file to check:** Make sure you've run the database migration in Supabase! See [RUN_MIGRATION.md](RUN_MIGRATION.md) if you haven't yet.
