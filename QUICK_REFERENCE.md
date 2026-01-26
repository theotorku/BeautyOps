# 🚀 BeautyOps AI - Quick Reference Guide

## New Components & Features

### 1. Toast Notifications 🔔

```typescript
import toast from 'react-hot-toast';

// Success message
toast.success('Subscription activated! Welcome to Pro AE.');

// Error message
toast.error('Payment failed. Please check your card details.');

// Loading message
const loadingToast = toast.loading('Processing your subscription...');
// When done:
toast.dismiss(loadingToast);
toast.success('All set!');

// Custom duration
toast('Custom message', { duration: 6000 });
```

---

### 2. Loading Skeletons ⏳

```typescript
import LoadingSkeleton, { CardSkeleton, TableSkeleton } from '@/components/LoadingSkeleton';

// Basic skeleton
<LoadingSkeleton variant="card" height="200px" />

// Multiple skeletons
<LoadingSkeleton variant="text" count={5} />

// Pre-built card skeleton
{loading ? (
  <CardSkeleton count={3} />
) : (
  <div className="grid">{/* Your content */}</div>
)}

// Table skeleton
{loading ? (
  <TableSkeleton rows={10} />
) : (
  <table>{/* Your table */}</table>
)}
```

---

### 3. Empty States 📭

```typescript
import EmptyState, { NoInvoicesState, NoSubscriptionState } from '@/components/EmptyState';

// Pre-built empty states
<NoInvoicesState />
<NoSubscriptionState />

// Custom empty state
<EmptyState
  icon="🎉"
  title="No data yet"
  description="Start using the app to see your data here."
  actionLabel="Get Started"
  actionHref="/dashboard"
/>

// With button action
<EmptyState
  icon="💳"
  title="Set up billing"
  description="Add a payment method to continue."
  actionLabel="Add Payment Method"
  onAction={() => handleAddPayment()}
/>
```

---

### 4. Mobile Menu 📱

**Automatic on mobile!**
- Appears on screens < 768px
- Hamburger icon in top-left
- Slide-in sidebar with overlay
- Auto-closes on navigation
- Body scroll lock when open

No code needed - works automatically!

---

## Responsive Design

### Breakpoints:
```css
/* Small Mobile */
@media (max-width: 480px) { }

/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

### Best Practices:
- Use `.grid` class for responsive grids
- Cards automatically stack on mobile
- Forms are touch-friendly (44px min height)
- Typography scales down on mobile

---

## Accessibility

### Focus States:
All interactive elements have visible focus indicators.

### Keyboard Navigation:
- `Tab` - Move to next element
- `Shift + Tab` - Move to previous
- `Enter` - Activate button/link
- `Space` - Toggle checkboxes
- `Escape` - Close modals/menus

### Skip Navigation:
Press `Tab` on page load to see "Skip to main content" link.

### ARIA Labels:
```tsx
<button aria-label="Close menu">X</button>
<img alt="Company logo" src="..." />
<input aria-describedby="email-error" />
```

---

## Example: Update Billing Page

### Before:
```typescript
const handleSubscribe = async () => {
  try {
    const res = await fetch(...);
    const data = await res.json();
    console.log('Success!');
  } catch (error) {
    console.error(error);
  }
};

return loading ? <p>Loading...</p> : <div>Content</div>;
```

### After:
```typescript
import toast from 'react-hot-toast';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { NoInvoicesState } from '@/components/EmptyState';

const handleSubscribe = async () => {
  try {
    toast.loading('Creating subscription...');
    const res = await fetch(...);
    const data = await res.json();
    toast.dismiss();
    toast.success('Subscription activated! Welcome to Pro AE.');
  } catch (error) {
    toast.dismiss();
    toast.error('Payment failed. Please check your card details.');
  }
};

return loading ? (
  <CardSkeleton count={3} />
) : invoices.length === 0 ? (
  <NoInvoicesState />
) : (
  <div>Content</div>
);
```

---

## Styling Guide

### Using CSS Variables:
```css
background: var(--primary-gradient);
color: var(--foreground);
border: 1px solid var(--glass-border);
```

### Common Patterns:
```tsx
// Card
<div className="card">
  <h3>Title</h3>
  <p>Content</p>
</div>

// Button
<button>Click Me</button>

// Grid
<div className="grid">
  <div className="card">Card 1</div>
  <div className="card">Card 2</div>
</div>
```

---

## Performance Tips

### 1. Lazy Load Images:
```tsx
<img loading="lazy" src="..." alt="..." />
```

### 2. Code Split Routes:
Already done with Next.js automatic code splitting!

### 3. Optimize Animations:
```css
.element {
  will-change: transform;
  transform: translateZ(0); /* Hardware acceleration */
}
```

---

## Testing Checklist

### Mobile:
- [ ] Test on iPhone and Android
- [ ] Toggle menu works
- [ ] All buttons tappable (44px)
- [ ] No horizontal scroll
- [ ] Forms are usable

### Accessibility:
- [ ] Tab through page
- [ ] Focus indicators visible
- [ ] Skip link works
- [ ] Screen reader friendly

### Functionality:
- [ ] Toasts appear correctly
- [ ] Loading skeletons show
- [ ] Empty states display
- [ ] Errors are handled

---

## Common Issues & Solutions

### Issue: Mobile menu doesn't appear
**Solution:** Check screen width is < 768px

### Issue: Toasts don't show
**Solution:** Ensure ToastProvider is in root layout

### Issue: Focus indicator not visible
**Solution:** Add `:focus-visible` styles

### Issue: Skeleton doesn't match content
**Solution:** Use appropriate variant and adjust height/width

---

## File Structure

```
frontend/
├── app/
│   ├── layout.tsx (ToastProvider added)
│   ├── mobile.css (responsive styles)
│   └── (app)/
│       └── layout.tsx (MobileMenu added)
├── components/
│   ├── ToastProvider.tsx
│   ├── MobileMenu.tsx
│   ├── LoadingSkeleton.tsx
│   └── EmptyState.tsx
└── lib/
    └── ... (existing)
```

---

## Next Steps

1. **Update Billing Page** - Use new components
2. **Add Form Validation** - Inline error messages
3. **Enhance Animations** - Add micro-interactions
4. **Test Everything** - Mobile, keyboard, screen reader

---

**Quick Links:**
- [Full UI/UX Improvements Doc](UI_UX_IMPROVEMENTS.md)
- [Deployment Status](DEPLOYMENT_STATUS.md)
- [Stripe Setup](STRIPE_SETUP_GUIDE.md)

---

**Questions?** Everything is documented and ready to use!
