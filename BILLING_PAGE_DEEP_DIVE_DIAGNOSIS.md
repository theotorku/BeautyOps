# Billing Page Deep Dive Diagnosis

**Date:** January 28, 2026
**Status:** 🚨 CRITICAL ISSUES FOUND

---

## Executive Summary

After a comprehensive deep dive, I've identified **5 critical issues** preventing the billing page from loading, even with environment variables configured in Vercel.

---

## ✅ What's Working

1. **Database Schema** - All 5 Stripe billing tables exist in Supabase:
   - `stripe_customers`
   - `subscriptions`
   - `payment_methods`
   - `invoices`
   - `stripe_webhook_events`

2. **Backend Code** - Updated with production Stripe price IDs
3. **Frontend Code** - Billing page component complete
4. **CORS Configuration** - Backend allows both `beautyop.io` and `beauty-ops.vercel.app`

---

## 🚨 CRITICAL ISSUES FOUND

### Issue 1: Usage Endpoint Returns MOCK Data (BLOCKING)

**File:** `backend/routers/usage.py`

**Problem:**
```python
MOCK_USAGE = {
    "user_123": {
        "tier": "Solo AE",
        "pos_credits_used": 7,
        "pos_credits_limit": 10,
        "briefings_used": 4,
        "briefings_limit": 5
    }
}

@router.get("/stats", response_model=UsageStats)
async def get_usage_stats(user_id: str = "user_123"):
    if user_id in MOCK_USAGE:
        return MOCK_USAGE[user_id]
    raise HTTPException(status_code=404, detail="User not found")  # ❌ FAILS FOR ALL REAL USERS
```

**Impact:** When the billing page tries to fetch usage data for a real user (e.g., `user_id=abc123`), the endpoint returns **404 Not Found**, causing the entire billing page to fail.

**Frontend Code Affected:**
```typescript
// Line 39-41 in frontend/app/(app)/billing/page.tsx
const usageRes = await fetch(`${API_URL}/api/usage/stats?user_id=${user.id}`);
const usageData = await usageRes.json();
setUsage(usageData);
```

**Solution:** Replace MOCK_USAGE with real database queries.

---

### Issue 2: Domain Migration Not Complete

**Problem:** Your code is updated for `beautyop.io`, but the domain migration steps from `DOMAIN_MIGRATION_GUIDE.md` were **not completed**:

**Not Done Yet:**
- [ ] Add `beautyop.io` domain to Vercel
- [ ] Configure DNS records (A and CNAME)
- [ ] Update `FRONTEND_URL` in Railway to `https://beautyop.io`
- [ ] Update Supabase redirect URLs to include `beautyop.io/**`

**Impact:**
- If your app is still deployed to `beauty-ops.vercel.app`, it will work fine
- If you're trying to access `beautyop.io` before DNS is configured, it won't load at all
- If `FRONTEND_URL` in Railway is still set to the old domain, Stripe redirects will fail

**Current Status:** Need user confirmation on which domain is actually being accessed.

---

### Issue 3: Subscription Data May Be Empty

**Problem:** Even if the billing page loads, if the user has never subscribed, the subscription query will return `null`.

**Backend Code:**
```python
# backend/routers/billing.py:59-66
@router.get("/subscription/{user_id}")
async def get_subscription(user_id: str):
    try:
        subscription = await stripe_service.get_subscription(user_id)
        if not subscription:
            return {"subscription": None, "status": "none"}  # ✅ Correct behavior
        return {"subscription": subscription}
```

**Frontend Code:**
```typescript
// Line 186 in frontend/app/(app)/billing/page.tsx
{subscription ? (
    // Show current plan details
) : (
    // Show pricing cards  ✅ Should show this if no subscription
)}
```

**Impact:** This is actually **working as designed**, but means:
- New users with no subscription will see pricing cards (correct)
- The page should still load, just without subscription data

**Status:** ✅ Not a bug, but confirms the page should load even without a subscription.

---

### Issue 4: Potential Supabase Client Initialization Failure

**Problem:** If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing or incorrect in Vercel, the Supabase client will fail to initialize.

**File:** `frontend/lib/supabase/client.ts`
```typescript
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,  // ⚠️ Will be undefined if env var missing
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // ⚠️ Will be undefined if env var missing
    );
}
```

**Frontend Usage:**
```typescript
// Line 28 in frontend/app/(app)/billing/page.tsx
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;  // ⚠️ Will exit early if auth fails
```

**Impact:** If Supabase auth fails, the billing page will:
1. Get `user = null`
2. Return early without rendering anything
3. User sees blank page or loading state forever

**How to Check:**
Open browser DevTools console and look for:
```
Error: supabaseUrl is required.
Error: supabaseKey is required.
```

---

### Issue 5: API_URL Defaulting to Localhost

**File:** `frontend/lib/config.ts`
```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

**Problem:** If `NEXT_PUBLIC_API_URL` is not set in Vercel, all API calls will go to `http://localhost:8000`, which doesn't exist in production.

**Impact:**
- All 3 API calls in `fetchBillingData()` will fail:
  ```typescript
  await fetch(`${API_URL}/api/billing/subscription/${user.id}`);  // ❌ Fails
  await fetch(`${API_URL}/api/usage/stats?user_id=${user.id}`);   // ❌ Fails
  await fetch(`${API_URL}/api/billing/invoices/${user.id}`);      // ❌ Fails
  ```
- Browser console will show: `net::ERR_CONNECTION_REFUSED` or `Failed to fetch`

**How to Verify:**
Open browser DevTools → Network tab → Check if API calls go to:
- ✅ `https://beautyops-production.up.railway.app` (correct)
- ❌ `http://localhost:8000` (wrong - env var missing)

---

## 🔍 Root Cause Analysis

**Most Likely Cause:** **Issue 1** (Usage endpoint returning 404)

Even if all environment variables are set correctly, the usage endpoint will **always fail** for real users because it's hardcoded to only accept `user_id="user_123"`.

**Secondary Causes:**
- Issue 4: Supabase client not initialized (env vars missing)
- Issue 5: API URL defaulting to localhost (env var missing)

---

## 🛠️ Step-by-Step Debugging Plan

### Step 1: Check Browser Console

Open the billing page and press **F12** to open DevTools. Look for:

**Expected Errors (if Issue 1 is the problem):**
```
GET https://beautyops-production.up.railway.app/api/usage/stats?user_id=abc123 404 (Not Found)
Failed to load billing data. Please refresh the page.
```

**Expected Errors (if Issue 4 is the problem):**
```
Error: supabaseUrl is required.
Error: supabaseKey is required.
```

**Expected Errors (if Issue 5 is the problem):**
```
GET http://localhost:8000/api/billing/subscription/abc123 net::ERR_CONNECTION_REFUSED
Failed to fetch
```

### Step 2: Verify Environment Variables in Vercel

Go to Vercel → Settings → Environment Variables and confirm these exist for **Production, Preview, Development**:

| Variable | Expected Value | Status |
|----------|---------------|--------|
| `NEXT_PUBLIC_API_URL` | `https://beautyops-production.up.railway.app` | ❓ |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wawipucycyhjwoajjyye.supabase.co` | ❓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (JWT token) | ❓ |

### Step 3: Check Railway Environment Variables

Go to Railway → Backend Service → Variables and confirm:

| Variable | Expected Value | Status |
|----------|---------------|--------|
| `FRONTEND_URL` | `https://beautyop.io` or `https://beauty-ops.vercel.app` | ❓ |
| `STRIPE_SECRET_KEY` | `sk_live_...` | ❓ |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ❓ |
| `SUPABASE_URL` | `https://wawipucycyhjwoajjyye.supabase.co` | ❓ |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | ❓ |

### Step 4: Verify Domain Configuration

**Question:** Which domain are you accessing the billing page from?
- A) `https://beauty-ops.vercel.app/billing`
- B) `https://beautyop.io/billing`
- C) Both failing

### Step 5: Test API Endpoints Directly

Open a new browser tab and test:

1. **Health Check:**
   ```
   https://beautyops-production.up.railway.app/health
   ```
   Should return: `{"status": "healthy"}`

2. **Usage Endpoint (will fail for real user):**
   ```
   https://beautyops-production.up.railway.app/api/usage/stats?user_id=test123
   ```
   Expected: `{"detail": "User not found"}` (404)

3. **Subscription Endpoint:**
   ```
   https://beautyops-production.up.railway.app/api/billing/subscription/test123
   ```
   Expected: `{"subscription": null, "status": "none"}` (200)

---

## 🚀 Fixes Required

### Fix 1: Update Usage Endpoint to Query Real Data (CRITICAL)

**File:** `backend/routers/usage.py`

Replace the entire file with real database queries. The usage data should come from:
- `subscriptions` table (to get user's tier)
- `usage_tracking` table (to get credits used)

**Required Changes:**
1. Remove MOCK_USAGE dictionary
2. Query Supabase for user's subscription tier
3. Query usage_tracking table for actual usage
4. Return real-time data based on subscription limits

### Fix 2: Verify Environment Variables

Double-check all 3 frontend environment variables are set in Vercel:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**After adding/updating:** Redeploy Vercel from Deployments tab.

### Fix 3: Complete Domain Migration (if using beautyop.io)

If you want to use `beautyop.io`, complete the steps in `DOMAIN_MIGRATION_GUIDE.md`:
1. Add domain to Vercel
2. Configure DNS
3. Update Railway `FRONTEND_URL`
4. Update Supabase redirect URLs

**Or:** Keep using `beauty-ops.vercel.app` for now (it's already in CORS allowlist).

---

## 📊 Testing After Fixes

### Test 1: Billing Page Loads
1. Navigate to `/billing`
2. Page should show loading skeleton for 1-2 seconds
3. Then show either:
   - Pricing cards (if no subscription)
   - Current subscription details (if subscribed)

### Test 2: No Console Errors
Open DevTools console:
- ✅ No red errors
- ✅ All API calls return 200 OK
- ✅ Supabase auth successful

### Test 3: Usage Tab Works
1. Click "Usage" tab
2. Should show:
   - POS credits: X / Y
   - Briefings: X / Y
   - Progress bars

---

## 📝 Priority Actions

**Priority 1: Fix Usage Endpoint (BLOCKING)**
- Replace MOCK_USAGE with real database queries
- Deploy to Railway

**Priority 2: Verify Environment Variables**
- Check Vercel dashboard
- Redeploy if any are missing

**Priority 3: Debug in Browser**
- Open DevTools console
- Share any error messages

**Priority 4: Test API Endpoints**
- Test health check
- Test subscription endpoint
- Test usage endpoint (will still fail until Fix 1 deployed)

---

## 🎯 Expected Outcome

After fixing the usage endpoint and verifying environment variables:

1. **Billing page loads** in 1-2 seconds
2. **No console errors**
3. **Pricing cards show** (if not subscribed)
4. **All tabs work** (Subscription, Usage, Payment, History)
5. **Subscribe button redirects** to Stripe Checkout
6. **API calls succeed** to Railway backend

---

## 📞 Next Steps

**Please provide:**

1. **Browser console screenshot** when visiting `/billing` page
2. **Vercel environment variables** confirmation (do they exist?)
3. **Which domain** are you accessing? (`beauty-ops.vercel.app` or `beautyop.io`?)
4. **Network tab screenshot** showing failed API requests

This will help me pinpoint the exact issue and provide the correct fix!

---

**Last Updated:** January 28, 2026
**Diagnosis By:** Claude Code Deep Dive Analysis
