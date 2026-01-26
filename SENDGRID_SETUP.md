# SendGrid Setup Guide - Lead Capture & Template Emails

This guide walks you through setting up SendGrid to automatically send the free store visit template to leads who submit the landing page form.

---

## Overview

When users submit the "Get Free Template" form on the landing page:
1. Their email is stored in the `leads` table in Supabase
2. SendGrid automatically sends them a beautifully formatted email with the template
3. The `template_sent` flag is updated in the database

---

## Step 1: Create SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account (allows 100 emails/day - perfect for starting out)
3. Verify your email address
4. Complete the account setup wizard

---

## Step 2: Verify Sender Identity

**Important:** SendGrid requires sender verification before you can send emails.

### Option A: Single Sender Verification (Quickest - Recommended for Testing)

1. In SendGrid dashboard, go to **Settings → Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in the form:
   - **From Name:** BeautyOps AI
   - **From Email Address:** Your email (e.g., `hello@yourdomain.com`)
   - **Reply To:** Same as From Email
   - **Company Address:** Your business address
4. Click **Create**
5. Check your email and click the verification link
6. Once verified, you can send emails from this address

### Option B: Domain Authentication (Production - More Professional)

1. In SendGrid dashboard, go to **Settings → Sender Authentication**
2. Click **Authenticate Your Domain**
3. Select your DNS host (e.g., Cloudflare, GoDaddy, Namecheap)
4. Enter your domain (e.g., `beautyops.ai`)
5. SendGrid will provide DNS records (CNAME records)
6. Add these records to your DNS provider
7. Click **Verify** in SendGrid
8. Wait for DNS propagation (can take up to 48 hours)

**Recommended:** Use Option A for testing, then upgrade to Option B for production.

---

## Step 3: Create API Key

1. In SendGrid dashboard, go to **Settings → API Keys**
2. Click **Create API Key**
3. Name it: `BeautyOps Production` or `BeautyOps Development`
4. Select **Full Access** (or restrict to "Mail Send" only for better security)
5. Click **Create & View**
6. **IMPORTANT:** Copy the API key immediately (you won't be able to see it again!)
   - It looks like: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Step 4: Configure Railway Environment Variables

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to **Variables** tab
4. Add the following environment variables:

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=hello@yourdomain.com
SENDGRID_FROM_NAME=BeautyOps AI
```

**Notes:**
- Replace `SENDGRID_API_KEY` with your actual API key from Step 3
- Replace `SENDGRID_FROM_EMAIL` with the verified email from Step 2
- `SENDGRID_FROM_NAME` is the name recipients will see

5. Click **Save** and Railway will automatically redeploy

---

## Step 5: Run Database Migration

The lead capture system requires a database table to store email leads.

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `backend/migrations/20260126_lead_capture.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Verify the `leads` table was created (should see it in Table Editor)

**What this creates:**
- `leads` table to store email addresses
- Indexes for fast lookups
- Row Level Security (RLS) policies

---

## Step 6: Test the Integration

### Test 1: Backend Endpoint (Railway)

```bash
curl -X POST https://beautyops-production.up.railway.app/api/leads/capture \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Template sent! Check your email in the next few minutes.",
  "already_subscribed": false
}
```

### Test 2: Frontend Form (Vercel)

1. Go to [https://beauty-ops.vercel.app](https://beauty-ops.vercel.app)
2. Scroll to "Get Free Template" section
3. Enter your email address
4. Click "Get Free Template"
5. You should see:
   - Loading toast: "Sending your free template..."
   - Success toast: "Template sent! Check your email inbox..."
6. Check your email inbox (and spam folder!)

### Test 3: Database Verification

1. Go to Supabase Dashboard → Table Editor
2. Open the `leads` table
3. Verify your email was added with:
   - `email`: Your email address
   - `template_sent`: `true`
   - `template_sent_at`: Timestamp
   - `source`: `landing_page_template`

---

## Troubleshooting

### Email Not Received

1. **Check Spam Folder** - SendGrid emails often land in spam initially
2. **Verify Sender** - Make sure you completed Step 2 (Sender Verification)
3. **Check SendGrid Activity Feed:**
   - Go to SendGrid Dashboard → Activity
   - Look for recent email attempts
   - Check for errors (bounces, blocks, etc.)
4. **Check Railway Logs:**
   ```bash
   # In Railway, go to your backend service → Deployments → View Logs
   # Look for errors like:
   # - "SendGrid error: ..."
   # - "SENDGRID_API_KEY not set"
   ```

### "SendGrid API Key Not Set" Error

- Make sure you added `SENDGRID_API_KEY` to Railway environment variables
- Redeploy after adding variables
- API key should start with `SG.`

### "Sender Identity Not Verified" Error

- Complete Step 2 (Sender Verification)
- Wait for verification email and click the link
- Make sure `SENDGRID_FROM_EMAIL` matches the verified email

### Lead Saved But Email Not Sent

- Check Railway logs for SendGrid errors
- Verify API key is correct
- Check SendGrid account status (may be suspended if over free tier limit)
- Email is queued and will be retried - check SendGrid Activity Feed

---

## Email Template Customization

The email content is defined in `backend/routers/leads.py` in the `send_template_email()` function.

**To customize:**
1. Edit the HTML and plain text content
2. Update the store visit template checklist
3. Add your branding, logo, or additional CTAs
4. Commit and push to GitHub
5. Railway will automatically redeploy

**Preview Email Before Sending:**
- Use [Litmus](https://litmus.com) or [Email on Acid](https://www.emailonacid.com) to preview
- Or send a test email to yourself first

---

## Monitoring & Analytics

### SendGrid Dashboard Metrics

Go to SendGrid Dashboard → Statistics to see:
- **Delivered**: Emails successfully delivered
- **Opens**: How many recipients opened the email
- **Clicks**: Link clicks (track CTA performance)
- **Bounces**: Invalid email addresses
- **Spam Reports**: Recipients who marked as spam

### Supabase Leads Dashboard

Query leads in Supabase:

```sql
-- Total leads captured
SELECT COUNT(*) FROM leads;

-- Leads in last 7 days
SELECT * FROM leads
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Template send success rate
SELECT
  COUNT(*) as total_leads,
  SUM(CASE WHEN template_sent THEN 1 ELSE 0 END) as templates_sent,
  ROUND(100.0 * SUM(CASE WHEN template_sent THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM leads;
```

---

## Production Best Practices

### 1. Domain Authentication (Instead of Single Sender)
- More professional (emails from `hello@beautyops.ai` instead of `yourname@gmail.com`)
- Better deliverability (less likely to go to spam)
- Builds sender reputation

### 2. Implement Email Sequence
- Day 1: Send template immediately
- Day 3: Follow-up email with tips
- Day 7: Product demo invitation
- Use marketing automation tools like SendGrid Marketing Campaigns

### 3. Add Unsubscribe Link
- Required by law (CAN-SPAM Act)
- Already included in SendGrid emails by default
- Respect unsubscribe requests

### 4. Monitor Sender Reputation
- Keep spam complaints < 0.1%
- Keep bounce rate < 5%
- Maintain consistent sending volume

### 5. A/B Test Subject Lines
- Test different subject lines
- Track open rates
- Optimize for engagement

---

## Scaling Beyond Free Tier

SendGrid Free Tier: **100 emails/day**

If you exceed this:

### Option 1: Upgrade SendGrid Plan
- **Essentials:** $19.95/mo - 50,000 emails/month
- **Pro:** $89.95/mo - 100,000 emails/month
- [View Pricing](https://sendgrid.com/pricing/)

### Option 2: Alternative Services
- **Mailgun** - Developer-friendly, similar to SendGrid
- **Amazon SES** - Very cheap ($0.10 per 1,000 emails)
- **Postmark** - Transactional email specialist
- **Resend** - Modern alternative with great DX

---

## Next Steps

After setting up SendGrid:

1. ✅ Test the form on your landing page
2. ✅ Check email deliverability (inbox vs spam)
3. ✅ Monitor SendGrid Activity Feed for first week
4. ✅ Set up domain authentication for production
5. ✅ Create follow-up email sequence (optional)
6. ✅ Add email nurture campaign (optional)

---

## Quick Reference

**SendGrid Dashboard:** https://app.sendgrid.com
**Backend Endpoint:** `POST /api/leads/capture`
**Database Table:** `leads` in Supabase
**Email Template Code:** `backend/routers/leads.py`

**Environment Variables:**
```bash
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=hello@beautyops.ai
SENDGRID_FROM_NAME=BeautyOps AI
```

---

**Need Help?** Check SendGrid's [documentation](https://docs.sendgrid.com) or their support team is very responsive!
