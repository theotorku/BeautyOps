# Stripe MCP Setup Commands

Since you have Stripe MCP access, here are the commands to create products and configure everything:

## Step 1: Create Solo AE Product & Prices

### Create Product
```
Product Name: Solo AE
Description: Essential toolkit for independent representatives
```

### Create Monthly Price
```
Amount: $49.00 USD
Interval: month
Product: Solo AE
Metadata:
  - tier_name: solo_ae
  - pos_credits_limit: 10
```

### Create Yearly Price
```
Amount: $470.00 USD
Interval: year
Product: Solo AE
Metadata:
  - tier_name: solo_ae
  - pos_credits_limit: 10
```

## Step 2: Create Pro AE Product & Prices

### Create Product
```
Product Name: Pro AE
Description: The standard for high-performing beauty teams
```

### Create Monthly Price
```
Amount: $149.00 USD
Interval: month
Product: Pro AE
Metadata:
  - tier_name: pro_ae
  - pos_credits_limit: unlimited
```

### Create Yearly Price
```
Amount: $1,430.00 USD
Interval: year
Product: Pro AE
Metadata:
  - tier_name: pro_ae
  - pos_credits_limit: unlimited
```

## Step 3: Create Webhook Endpoint

```
Endpoint URL: https://beautyops-production.up.railway.app/api/billing/webhook
Events to listen:
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_succeeded
  - invoice.payment_failed
```

## Step 4: Record Price IDs

After creating the products and prices above, you'll receive price IDs like:
- `price_1ABC123...` (Solo Monthly)
- `price_2DEF456...` (Solo Yearly)
- `price_3GHI789...` (Pro Monthly)
- `price_4JKL012...` (Pro Yearly)

**Save these IDs!** You'll need to update:
1. `backend/routers/billing.py` (line ~206)
2. `frontend/app/(app)/billing/page.tsx` (line ~83)

## Step 5: Get Webhook Signing Secret

After creating the webhook endpoint, copy the **Signing Secret** (starts with `whsec_`)

Add to Railway environment variables as: `STRIPE_WEBHOOK_SECRET`

---

## Quick Commands (if using Stripe CLI)

Alternatively, you can use Stripe CLI:

```bash
# Create Solo AE Product
stripe products create \
  --name "Solo AE" \
  --description "Essential toolkit for independent representatives"

# Create Solo AE Monthly Price
stripe prices create \
  --product <SOLO_PRODUCT_ID> \
  --unit-amount 4900 \
  --currency usd \
  --recurring[interval]=month \
  --metadata[tier_name]=solo_ae \
  --metadata[pos_credits_limit]=10

# Create Solo AE Yearly Price
stripe prices create \
  --product <SOLO_PRODUCT_ID> \
  --unit-amount 47000 \
  --currency usd \
  --recurring[interval]=year \
  --metadata[tier_name]=solo_ae \
  --metadata[pos_credits_limit]=10

# Create Pro AE Product
stripe products create \
  --name "Pro AE" \
  --description "The standard for high-performing beauty teams"

# Create Pro AE Monthly Price
stripe prices create \
  --product <PRO_PRODUCT_ID> \
  --unit-amount 14900 \
  --currency usd \
  --recurring[interval]=month \
  --metadata[tier_name]=pro_ae \
  --metadata[pos_credits_limit]=unlimited

# Create Pro AE Yearly Price
stripe prices create \
  --product <PRO_PRODUCT_ID> \
  --unit-amount 143000 \
  --currency usd \
  --recurring[interval]=year \
  --metadata[tier_name]=pro_ae \
  --metadata[pos_credits_limit]=unlimited

# Create Webhook
stripe webhook_endpoints create \
  --url "https://beautyops-production.up.railway.app/api/billing/webhook" \
  --enabled-events customer.subscription.created \
  --enabled-events customer.subscription.updated \
  --enabled-events customer.subscription.deleted \
  --enabled-events invoice.payment_succeeded \
  --enabled-events invoice.payment_failed
```

---

## After Setup

Once you have the price IDs, update these files:

### File 1: backend/routers/billing.py

Find the `determine_tier_from_price()` function and update:

```python
def determine_tier_from_price(price_id: str) -> str:
    tier_mapping = {
        # Solo AE (replace with actual IDs)
        "price_YOUR_SOLO_MONTHLY_ID": "solo_ae",
        "price_YOUR_SOLO_YEARLY_ID": "solo_ae",
        # Pro AE (replace with actual IDs)
        "price_YOUR_PRO_MONTHLY_ID": "pro_ae",
        "price_YOUR_PRO_YEARLY_ID": "pro_ae",
    }
    return tier_mapping.get(price_id, "solo_ae")
```

### File 2: frontend/app/(app)/billing/page.tsx

Find the `tiers` object and update:

```typescript
const tiers = {
    solo: {
        name: 'Solo AE',
        monthly: { price: 49, priceId: 'price_YOUR_SOLO_MONTHLY_ID' },
        yearly: { price: 470, priceId: 'price_YOUR_SOLO_YEARLY_ID' },
        // ...
    },
    pro: {
        name: 'Pro AE',
        monthly: { price: 149, priceId: 'price_YOUR_PRO_MONTHLY_ID' },
        yearly: { price: 1430, priceId: 'price_YOUR_PRO_YEARLY_ID' },
        // ...
    }
};
```

Then commit and deploy!
