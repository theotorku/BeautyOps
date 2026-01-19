# Quick Update: Stripe Price IDs

## Instructions

Once you have your 4 price IDs from Stripe Dashboard, provide them in this format and I'll update the code:

```
Solo AE Monthly:  price_
Solo AE Yearly:   price_
Pro AE Monthly:   price_
Pro AE Yearly:    price_
```

## Files That Will Be Updated

### 1. backend/routers/billing.py (Line ~206)
Current placeholder:
```python
def determine_tier_from_price(price_id: str) -> str:
    tier_mapping = {
        "price_solo_monthly": "solo_ae",
        "price_solo_yearly": "solo_ae",
        "price_pro_monthly": "pro_ae",
        "price_pro_yearly": "pro_ae",
    }
    return tier_mapping.get(price_id, "solo_ae")
```

Will be updated to:
```python
def determine_tier_from_price(price_id: str) -> str:
    tier_mapping = {
        "price_YOUR_ACTUAL_ID_1": "solo_ae",  # Solo Monthly
        "price_YOUR_ACTUAL_ID_2": "solo_ae",  # Solo Yearly
        "price_YOUR_ACTUAL_ID_3": "pro_ae",   # Pro Monthly
        "price_YOUR_ACTUAL_ID_4": "pro_ae",   # Pro Yearly
    }
    return tier_mapping.get(price_id, "solo_ae")
```

### 2. frontend/app/(app)/billing/page.tsx (Line ~83)
Current placeholder:
```typescript
const tiers = {
    solo: {
        name: 'Solo AE',
        monthly: { price: 49, priceId: 'price_solo_monthly' },
        yearly: { price: 470, priceId: 'price_solo_yearly' },
        // ...
    },
    pro: {
        name: 'Pro AE',
        monthly: { price: 149, priceId: 'price_pro_monthly' },
        yearly: { price: 1430, priceId: 'price_pro_yearly' },
        // ...
    }
};
```

Will be updated to:
```typescript
const tiers = {
    solo: {
        name: 'Solo AE',
        monthly: { price: 49, priceId: 'price_YOUR_ACTUAL_ID_1' },
        yearly: { price: 470, priceId: 'price_YOUR_ACTUAL_ID_2' },
        // ...
    },
    pro: {
        name: 'Pro AE',
        monthly: { price: 149, priceId: 'price_YOUR_ACTUAL_ID_3' },
        yearly: { price: 1430, priceId: 'price_YOUR_ACTUAL_ID_4' },
        // ...
    }
};
```

---

## How to Get Price IDs from Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/products
2. You should see "Solo AE" and "Pro AE" products (or similar names)
3. Click on each product
4. Copy the price IDs for both monthly and yearly prices
5. They look like: `price_1Abc123XyzDefGhi456JklMno789`

---

## Once Updated

After I update the files, you'll need to:

1. **Commit changes:**
   ```bash
   git add backend/routers/billing.py frontend/app/(app)/billing/page.tsx
   git commit -m "feat: Update Stripe price IDs for Railway sandbox"
   git push
   ```

2. **Wait for deployments:**
   - Railway will auto-deploy backend
   - Vercel will auto-deploy frontend

3. **Test the billing flow!**

---

**Ready to proceed?** Share your 4 price IDs and I'll update the code immediately!
