# 🚀 Database Migration - READY TO RUN

## Migration File Location
`backend/migrations/20260120_stripe_billing.sql`

## How to Execute

### Option 1: Supabase Dashboard (Recommended - 2 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/wawipucycyhjwoajjyye

2. **Navigate to SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

3. **Copy & Paste Migration**
   - Open: `backend/migrations/20260120_stripe_billing.sql`
   - Copy the ENTIRE file (167 lines)
   - Paste into SQL Editor

4. **Execute**
   - Click **Run** button (or press Ctrl+Enter)
   - Wait for confirmation message

5. **Verify**
   - Go to **Table Editor**
   - You should see 5 new tables:
     - ✅ `stripe_customers`
     - ✅ `subscriptions`
     - ✅ `payment_methods`
     - ✅ `invoices`
     - ✅ `stripe_webhook_events`

---

### Option 2: Using psql Command Line

If you have PostgreSQL client installed:

```bash
# Get connection string from Supabase Dashboard → Settings → Database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.wawipucycyhjwoajjyye.supabase.co:5432/postgres" \
  -f backend/migrations/20260120_stripe_billing.sql
```

---

### Option 3: Via Supabase MCP (if available)

If your Supabase MCP supports SQL execution, you can run the migration directly.

---

## What This Migration Creates

### Tables (5 new tables)

1. **stripe_customers** - Links user_id to Stripe customer_id
2. **subscriptions** - Active subscription details (tier, status, dates)
3. **payment_methods** - Credit card info (brand, last4, expiry)
4. **invoices** - Billing history
5. **stripe_webhook_events** - Webhook event tracking for idempotency

### Security (RLS Policies)

- Users can only view their own data
- Service role has full access (for backend operations)
- Webhook events table is backend-only (no RLS)

### Updates to Existing Tables

- Adds `cycle_starts_at` and `cycle_ends_at` to `usage_tracking` table

### Triggers

- Auto-updates `updated_at` timestamp on stripe_customers, subscriptions, and payment_methods

---

## Migration is Idempotent

✅ Safe to run multiple times
✅ Uses `IF NOT EXISTS` and `IF EXISTS` checks
✅ Won't duplicate data or cause errors

---

## After Migration

Once migration is complete:

1. ✅ Verify tables in Supabase Table Editor
2. ➡️ Create Stripe products (see STRIPE_MCP_COMMANDS.md)
3. ➡️ Add environment variables to Railway & Vercel
4. ➡️ Deploy and test!

---

## Troubleshooting

### Error: "relation already exists"
- This is OK! It means tables already exist
- Migration will skip creating duplicates

### Error: "permission denied"
- Make sure you're using the **postgres** role
- Check that you're connected to the right project

### Error: "function update_updated_at_column already exists"
- This is OK! Migration will use existing function
- No action needed

---

## Ready?

**👉 Go to Supabase Dashboard and run the migration now!**

https://supabase.com/dashboard/project/wawipucycyhjwoajjyye/sql
