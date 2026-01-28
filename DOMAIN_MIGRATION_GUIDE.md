# Domain Migration Guide: beautyop.io

## ✅ Overview

Your app is migrating from `beauty-ops.vercel.app` (Vercel default) to your custom domain `beautyop.io`. This guide covers all required updates.

---

## 🔧 Code Changes (Already Done)

### 1. Backend CORS Configuration ✅
**File:** `backend/main.py`

```python
allowed_origins = [
    "http://localhost:3000",
    "https://beautyop.io",               # ✅ Primary domain
    "https://www.beautyop.io",           # ✅ WWW subdomain
    "https://beauty-ops.vercel.app",     # ✅ Legacy (can remove later)
    frontend_url
]
```

### 2. Email Templates ✅
**File:** `backend/routers/leads.py`

All references to `beauty-ops.vercel.app` updated to `beautyop.io` in:
- SendGrid email HTML template
- SendGrid email plain text template
- CTAs and links

---

## 🌐 DNS Configuration (You Need to Do This)

### Vercel Domain Setup

1. Go to [Vercel Project Settings](https://vercel.com/dashboard)
2. Click your `beauty-ops` project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `beautyop.io`
6. Vercel will provide DNS records

### Add DNS Records to Your Domain Provider

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add these records:

**For root domain (beautyop.io):**
```
Type: A
Name: @
Value: 76.76.21.21  (Vercel's IP - or use CNAME if allowed)
```

**For www subdomain (www.beautyop.io):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Note:** Vercel will show you the exact records to add. Use those!

### Verification

After adding DNS records:
1. Wait 5-10 minutes for propagation
2. Vercel will automatically detect and verify
3. Vercel will provision SSL certificate (takes ~5 minutes)

---

## 🔐 Environment Variables Updates

### Railway (Backend)

Update `FRONTEND_URL` environment variable:

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click your backend service
3. Go to **Variables** tab
4. Update or add:
   ```
   FRONTEND_URL=https://beautyop.io
   ```
5. Railway will automatically redeploy

### Vercel (Frontend)

Update `NEXT_PUBLIC_API_URL`:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   ```
   NEXT_PUBLIC_API_URL=https://beautyops-production.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```
5. Redeploy from **Deployments** tab

---

## 🔑 Supabase Configuration

### Update Site URL and Redirect URLs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/wawipucycyhjwoajjyye)
2. Click **Authentication** → **URL Configuration**

3. **Update Site URL:**
   ```
   https://beautyop.io
   ```

4. **Update Redirect URLs** (add both):
   ```
   https://beautyop.io/**
   https://www.beautyop.io/**
   https://beauty-ops.vercel.app/**  (keep for now, remove after migration)
   ```

5. Click **Save**

**Why this matters:** Supabase auth redirects won't work if the domain isn't whitelisted!

---

## 💳 Stripe Configuration

### Update Customer Portal Domain

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Settings** → **Customer Portal**
3. Under **Business Information**, update:
   - Business Name: BeautyOps AI
   - Website: `https://beautyop.io`

### Webhook Endpoint (If Configured)

If you've already set up webhooks:

1. Go to **Developers** → **Webhooks**
2. Click your webhook endpoint
3. Update endpoint URL to:
   ```
   https://beautyops-production.up.railway.app/api/billing/webhook
   ```
   (This doesn't need to change since it points to Railway, not the frontend)

**Note:** Stripe redirect URLs are dynamic (set via `FRONTEND_URL` env var), so no changes needed in Stripe code!

---

## 📧 SendGrid Configuration (Optional)

### Update Sender Domain

If you set up domain authentication:

1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. **Settings** → **Sender Authentication**
3. Click **Authenticate Your Domain**
4. Enter `beautyop.io`
5. Add the DNS records SendGrid provides
6. Verify

**Benefits:**
- Emails from `hello@beautyop.io` instead of `hello@gmail.com`
- Better deliverability
- More professional

---

## 🧪 Testing After Migration

### 1. Test Basic Access
```bash
# Should return 200 OK
curl -I https://beautyop.io
curl -I https://www.beautyop.io

# Should redirect to login (if not authenticated)
curl -I https://beautyop.io/dashboard
```

### 2. Test Authentication Flow
1. Go to `https://beautyop.io/signup`
2. Create an account (or login)
3. Check that Supabase redirects work
4. Verify you land back on beautyop.io (not vercel domain)

### 3. Test API Calls
1. Open browser DevTools (F12)
2. Go to `https://beautyop.io/billing`
3. Check **Network** tab
4. Verify API calls go to: `beautyops-production.up.railway.app`
5. No CORS errors should appear

### 4. Test Stripe Checkout
1. Go to `https://beautyop.io/billing`
2. Click "Subscribe" on any plan
3. Complete checkout (use test card: `4242 4242 4242 4242`)
4. Verify redirect back to: `https://beautyop.io/billing?success=true`

### 5. Test Lead Capture
1. Go to `https://beautyop.io` (landing page)
2. Scroll to "Get Free Template"
3. Enter email and submit
4. Check email inbox
5. Verify links in email point to `beautyop.io` (not vercel)

---

## 📝 Checklist

### DNS & Hosting
- [ ] Add `beautyop.io` domain to Vercel
- [ ] Add DNS records (A and CNAME) to domain provider
- [ ] Verify domain in Vercel (green checkmark)
- [ ] Wait for SSL certificate provisioning (~5 min)
- [ ] Test both `beautyop.io` and `www.beautyop.io` work

### Environment Variables
- [ ] Update `FRONTEND_URL` in Railway to `https://beautyop.io`
- [ ] Update `NEXT_PUBLIC_API_URL` in Vercel
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` in Vercel
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
- [ ] Redeploy both Railway and Vercel

### Third-Party Services
- [ ] Update Supabase Site URL to `https://beautyop.io`
- [ ] Add `beautyop.io/**` to Supabase redirect URLs
- [ ] Update Stripe Customer Portal website (optional)
- [ ] Set up SendGrid domain authentication (optional)

### Testing
- [ ] Test homepage loads at `beautyop.io`
- [ ] Test signup/login flow works
- [ ] Test dashboard pages load correctly
- [ ] Test billing page loads (no CORS errors)
- [ ] Test Stripe checkout and redirect
- [ ] Test lead capture form and email links
- [ ] Check all API calls go to Railway backend

### Cleanup (After 1 Week)
- [ ] Remove `beauty-ops.vercel.app` from Supabase redirect URLs
- [ ] Remove old domain from CORS in `backend/main.py`
- [ ] Update any documentation with old domain

---

## 🚨 Common Issues

### Issue 1: "This site can't be reached"
**Cause:** DNS not propagated yet
**Solution:** Wait 5-30 minutes, then try again. Check DNS: `nslookup beautyop.io`

### Issue 2: "Invalid redirect URL" (Supabase)
**Cause:** Domain not in Supabase redirect URLs
**Solution:** Add `https://beautyop.io/**` to Supabase → Authentication → URL Configuration

### Issue 3: CORS Errors
**Cause:** Backend doesn't allow requests from beautyop.io
**Solution:** Already fixed in `main.py` - just redeploy Railway

### Issue 4: API calls still go to localhost
**Cause:** `NEXT_PUBLIC_API_URL` not set in Vercel
**Solution:** Add environment variable and redeploy Vercel

### Issue 5: Stripe redirects to wrong URL
**Cause:** `FRONTEND_URL` not updated in Railway
**Solution:** Update to `https://beautyop.io` and redeploy

---

## 🎯 Migration Order (Recommended)

1. **Add domain to Vercel** (5 minutes)
2. **Configure DNS records** (5 minutes, wait 10-30 min for propagation)
3. **Update Supabase URLs** (2 minutes)
4. **Update Railway env vars** (2 minutes, redeploys automatically)
5. **Update Vercel env vars** (2 minutes, manual redeploy)
6. **Test everything** (10 minutes)
7. **Celebrate!** 🎉

**Total time:** ~1 hour (mostly waiting for DNS)

---

## 📞 Need Help?

**Vercel Domain Issues:**
- [Vercel Domains Docs](https://vercel.com/docs/concepts/projects/domains)

**DNS Propagation Check:**
- https://www.whatsmydns.net

**Supabase Auth Issues:**
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/redirect-urls)

---

**Current Status:**
- ✅ Code updated for `beautyop.io`
- ✅ Backend CORS allows new domain
- ✅ Email templates use new domain
- ⏳ Waiting for DNS/hosting configuration
- ⏳ Waiting for environment variable updates

**Next Step:** Configure Vercel domain and update environment variables!
