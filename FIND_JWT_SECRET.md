# How to Find Supabase JWT Secret

## 📍 Where to Find It

### Step-by-Step:

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/wawipucycyhjwoajjyye

2. **Click on "Settings"** (gear icon in left sidebar)

3. **Click on "API"** in the Settings submenu

4. **Scroll down to "JWT Settings" section**

5. **Look for "JWT Secret"**
   - It's in a code block
   - Usually labeled as "JWT Secret" or "jwt_secret"

6. **Click the "Copy" button** or select and copy the entire string

---

## 🔍 What It Looks Like

The JWT Secret is a **long alphanumeric string**, typically:

**Format:**
- 64+ characters long
- Mix of letters (uppercase and lowercase) and numbers
- NO spaces
- NO special characters (except maybe underscores)

**Example format** (this is NOT a real secret):
```
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789AB
```

**Real example structure:**
```
8d9f7a6b5c4e3d2a1f9e8d7c6b5a4f3e2d1c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5
```

---

## ⚠️ Important Notes

### What It's NOT:

❌ **NOT the Anon Key** (starts with `eyJ...`)
❌ **NOT the Service Role Key** (starts with `eyJ...`)
❌ **NOT the URL** (the Supabase project URL)

### What It IS:

✅ **The JWT Secret** - Used to sign and verify JWT tokens
✅ Found in: Settings → API → JWT Settings
✅ Plain alphanumeric string (no `eyJ` prefix)
✅ Same secret on both client and server side

---

## 📋 Quick Checklist

When you copy it, verify:

- [ ] It's from the "JWT Settings" section
- [ ] It's NOT one of the keys (anon/service role)
- [ ] It's a long string (64+ characters)
- [ ] No spaces or line breaks
- [ ] Alphanumeric only

---

## 🎯 Where to Use It

**Railway Environment Variable:**
```
SUPABASE_JWT_SECRET=your_long_alphanumeric_string_here
```

**Purpose:**
- Backend uses this to verify JWT tokens from frontend
- Ensures authentication tokens are valid
- Required for protected API endpoints

---

## 🔐 Visual Guide

In Supabase Dashboard, it looks like this:

```
Settings → API
├── Project URL
├── Project API keys
│   ├── anon public (eyJ...)     ← NOT this
│   └── service_role (eyJ...)    ← NOT this
└── JWT Settings
    ├── JWT Secret               ← THIS ONE! ✅
    │   └── [long alphanumeric string]
    └── JWT expiry
```

---

## 🆘 Still Not Sure?

If you're looking at the Supabase Settings → API page, you'll see multiple keys:

1. **anon** key - Starts with `eyJh...` (public key for frontend)
2. **service_role** key - Starts with `eyJh...` (private key for backend)
3. **JWT Secret** - Plain string like `a8f7e6d5c4...` (what you need!)

**Copy the one that looks like plain text, NOT the ones starting with `eyJ`**

---

## ✅ After You Copy It

Paste it into Railway:

```
Variable Name: SUPABASE_JWT_SECRET
Value: [paste the long string here]
```

No quotes, no extra characters, just the raw string.

---

**Need help?** If you're still unsure, you can share the first 10 characters of what you copied (e.g., `a8f7e6d5c4...`) and I can confirm if it looks right!
