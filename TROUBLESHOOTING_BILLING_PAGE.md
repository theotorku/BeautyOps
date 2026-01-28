# Troubleshooting: Billing Page Not Loading

## 🔍 Diagnosis

The billing page at `/billing` is returning HTTP 200 (page exists) but not loading properly. This is most likely caused by **missing environment variables** in Vercel.

---

## 🚨 Root Cause

### Issue 1: Missing NEXT_PUBLIC_API_URL in Vercel

**What's happening:**
- Frontend code uses: `process.env.NEXT_PUBLIC_API_URL`
- If not set, it defaults to: `http://localhost:8000`
- In production, this tries to call localhost (which doesn't exist)
- All API calls fail silently, page appears broken

**Evidence:**
```typescript
// frontend/lib/config.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

**Impact:**
- Billing page loads but can't fetch subscription data
- All dashboard pages affected (visits, POS, etc.)
- Checkout flow will fail

---

## ✅ Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Project Settings

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `beauty-ops` project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Required Environment Variables

Add these 3 variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://beautyops-production.up.railway.app` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | (Copy from Railway/Supabase) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Copy from Railway/Supabase) | Production, Preview, Development |

**Important:** All `NEXT_PUBLIC_*` variables are exposed to the browser (client-side).

### Step 3: Get the Values

#### NEXT_PUBLIC_API_URL:
```bash
https://beautyops-production.up.railway.app
```

#### NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY:

**Option A: From Railway Environment Variables**
1. Go to Railway project
2. Click backend service
3. Go to **Variables** tab
4. Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY`

**Option B: From Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/wawipucycyhjwoajjyye)
2. Click **Settings** → **API**
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 4: Redeploy

After adding environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **⋯** on the latest deployment
3. Click **Redeploy**
4. Wait ~2 minutes

---

## 🧪 Testing After Fix

### Test 1: Check API Connection
Open browser console on billing page and look for:
- ✅ API calls to `https://beautyops-production.up.railway.app/api/...`
- ❌ Errors about `localhost:8000` or connection refused

### Test 2: Billing Page Loads
1. Navigate to: https://beauty-ops.vercel.app/billing
2. Should see:
   - Tabs: Subscription, Usage, Payment, History
   - Pricing cards if not subscribed
   - Loading skeletons while fetching data

### Test 3: Try Subscribe
1. Click "Subscribe" on any plan
2. Should redirect to Stripe Checkout
3. Verify price is correct (not test mode price)

---

## 🔍 Other Potential Issues

### Issue 2: Authentication Required

**Symptom:** Page redirects to login

**Cause:** `/billing` route requires authentication (inside `(app)` folder)

**Solution:** Make sure you're logged in:
1. Go to https://beauty-ops.vercel.app/login
2. Log in with your account
3. Navigate to `/billing`

### Issue 3: CORS Error

**Symptom:** Console shows: `Access to fetch at ... has been blocked by CORS policy`

**Cause:** Railway backend doesn't allow requests from Vercel domain

**Solution:** Check Railway backend `main.py`:
```python
allowed_origins = [
    "http://localhost:3000",
    "https://beauty-ops.vercel.app",  # ✅ Should be here
    frontend_url
]
```

This is already configured correctly, so shouldn't be an issue.

### Issue 4: Supabase RLS Policy Blocking Requests

**Symptom:** Page loads but shows "No subscription" even though you have one

**Cause:** Row Level Security policies blocking read access

**Solution:** Check Supabase RLS policies:
1. Go to Supabase Dashboard → Authentication → Policies
2. Make sure `user_subscriptions` table allows SELECT for authenticated users
3. Policy should check: `auth.uid() = user_id`

---

## 📊 How to Check Current Environment Variables

### Vercel (Frontend):
```bash
# SSH into Vercel deployment (not recommended, use dashboard instead)
# Or check in Vercel Dashboard → Settings → Environment Variables
```

### Railway (Backend):
1. Go to Railway project
2. Click backend service
3. Go to **Variables** tab
4. Verify these exist:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

---

## 🚀 Quick Fix Checklist

- [ ] Add `NEXT_PUBLIC_API_URL` to Vercel
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` to Vercel
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- [ ] Redeploy Vercel (after adding env vars)
- [ ] Test billing page loads
- [ ] Test subscription checkout flow
- [ ] Check browser console for errors

---

## 🛠️ Developer Mode Debugging

If you want to test locally:

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://beautyops-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://wawipucycyhjwoajjyye.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Then restart Next.js dev server
cd frontend
npm run dev
```

---

## 📞 Still Not Working?

If the page still doesn't load after adding environment variables:

1. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for red errors
   - Share any errors you see

2. **Check Network Tab:**
   - Press F12
   - Go to Network tab
   - Reload page
   - Look for failed requests (red)
   - Check what URL it's calling

3. **Check Railway Logs:**
   - Go to Railway project
   - Click backend service
   - Go to **Deployments** → View Logs
   - Look for errors when billing API is called

4. **Check Vercel Logs:**
   - Go to Vercel project
   - Go to **Deployments** → latest deployment
   - Click **View Function Logs**
   - Look for build or runtime errors

---

## 🎯 Expected Behavior (After Fix)

**When you visit `/billing`:**
1. ✅ Page loads with tabs: Subscription, Usage, Payment, History
2. ✅ Shows loading skeleton for ~1-2 seconds
3. ✅ Shows pricing cards (if not subscribed)
4. ✅ Shows subscription details (if subscribed)
5. ✅ No console errors
6. ✅ All API calls go to `https://beautyops-production.up.railway.app`

**Console should show:**
```
Fetching billing data...
GET https://beautyops-production.up.railway.app/api/billing/subscription/...
GET https://beautyops-production.up.railway.app/api/usage/stats?user_id=...
GET https://beautyops-production.up.railway.app/api/billing/invoices/...
```

---

## 📝 Summary

**Most Likely Issue:** Missing `NEXT_PUBLIC_API_URL` in Vercel
**Fix:** Add environment variables to Vercel and redeploy
**Time to Fix:** 5 minutes
**Impact:** All dashboard pages will work after fix

---

**Last Updated:** January 28, 2026
