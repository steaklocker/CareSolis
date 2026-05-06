# CareSolis Mobile Design Standards

## Primary Target Device: iPhone 16 Pro Max

All mobile UI development should be optimized primarily for **iPhone 16 Pro Max** specifications:

### Device Specifications
- **Display**: 6.9 inches (diagonal)
- **Resolution**: 2868 × 1320 pixels (460 ppi)
- **Viewport Width**: ~430px (in portrait mode)
- **Aspect Ratio**: 19.5:9
- **Dynamic Island**: Top center notch area
- **Home Indicator**: Bottom safe area (~34px)

---

## Design Principles

### 1. Safe Area Handling
**Always respect iOS safe areas** to avoid content being obscured by the Dynamic Island or home indicator.

```css
/* Use safe area utilities */
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pt-safe { padding-top: env(safe-area-inset-top); }
```

**Implementation:**
- Bottom navigation has automatic safe area padding
- Main content area uses `pb-safe` class
- Viewport meta tag uses `viewport-fit=cover`

### 2. Touch Targets (Apple Human Interface Guidelines)
**Minimum touch target size: 44×44 points**

All interactive elements must meet this standard:
- Buttons
- Links
- Form inputs
- Icon buttons
- Tab bar items

```tsx
// Good - Meets minimum
<button className="min-h-[44px] min-w-[44px] p-2">

// Bad - Too small
<button className="h-8 w-8">
```

### 3. Typography Scale

Optimized for 6.9" display readability:

```css
/* Mobile-optimized sizes */
h1: 1.875rem (30px) - Large Title
h2: 1.5rem (24px)    - Title 1  
h3: 1.25rem (20px)   - Title 2
body: 16px           - Prevents iOS zoom on input focus
```

### 4. Layout & Spacing

**Horizontal Padding:**
- Mobile: `px-3` (12px) - Minimal, comfortable margins
- Desktop: `px-4` or `px-6` - More generous spacing

**Cards & Containers:**
- Full-width on mobile with minimal horizontal margins
- Optional: Use `card-mobile-full` class for edge-to-edge cards
- Vertical spacing: `space-y-4` or `space-y-6`

```tsx
// Responsive container
<div className="w-full md:max-w-5xl md:mx-auto">
  <Card className="px-3 py-4 md:px-6 md:py-6">
</div>
```

### 5. Bottom Navigation

**Industry-Standard iOS Tab Bar Pattern:**
- 5 tabs maximum (thumb-reachable zone)
- Height: 64px (16 tailwind units)
- Icon size: 24×24px (`w-6 h-6`)
- Label size: 10px
- Safe area padding automatically applied
- Active state: Emerald green accent

**Current Implementation:**
- Caregivers: Home, Meds, Messages, Activity, More
- Admins: Summary, Meds, Messages, Analytics, Settings

### 6. Native iOS Feel

**Interactions:**
```css
/* Disable tap highlight */
-webkit-tap-highlight-color: transparent;

/* Momentum scrolling */
-webkit-overflow-scrolling: touch;

/* Active feedback */
button:active {
  opacity: 0.7;
  transform: scale(0.98);
}
```

**Backdrop Blur:**
Use on floating elements for iOS-native glassmorphism:
```tsx
className="bg-white/95 backdrop-blur-xl"
```

---

## Component Standards

### Cards
```tsx
// Mobile-optimized card
<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 shadow-sm">
  {/* Content */}
</div>
```

### Buttons
```tsx
// Primary action
<button className="min-h-[44px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-lg active:scale-95 transition-transform">

// Secondary action  
<button className="min-h-[44px] px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg">
```

### Form Inputs
```tsx
// Prevent iOS zoom with 16px minimum font size
<input 
  className="min-h-[44px] px-4 py-2 text-base border rounded-lg"
  style={{ fontSize: '16px' }} // Critical for iOS
/>
```

### Lists
```tsx
// Scrollable list with proper spacing
<div className="space-y-3 pb-24"> {/* Extra bottom padding for bottom nav */}
  {items.map(item => (
    <div key={item.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl">
  ))}
</div>
```

---

## Page Layout Template

```tsx
export default function Page() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Title</h1>
        <button className="min-h-[44px]">Action</button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4">
        <Card />
      </div>

      {/* Extra bottom padding for bottom nav */}
      <div className="h-6" />
    </div>
  );
}
```

---

## Testing Checklist

When building or modifying mobile UI, verify:

- [ ] Touch targets are minimum 44×44px
- [ ] Text is readable without zooming
- [ ] Content doesn't hide behind Dynamic Island or home indicator
- [ ] Bottom navigation is accessible
- [ ] Cards/containers have appropriate padding
- [ ] Active states provide visual feedback
- [ ] Scrolling is smooth (momentum scrolling)
- [ ] No horizontal overflow
- [ ] Images scale properly
- [ ] Form inputs don't cause zoom (16px minimum font)
- [ ] Dark mode looks good
- [ ] Transitions feel native

---

## Browser Testing

Primary: **Safari on iPhone 16 Pro Max**
- Test in both portrait and landscape
- Test with Dynamic Island scenarios (calls, timers, etc.)
- Verify PWA mode (Add to Home Screen)

Secondary:
- Safari on iPhone 15 Pro
- Chrome on iPhone (uses WebKit)
- iPad (responsive layout should adapt)

---

## Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [iOS Safe Area Guide](https://developer.apple.com/design/human-interface-guidelines/layout#iOS-iPadOS)
- [WebKit Safe Area Insets](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

---

## Version History

**v6.50.0** - iPhone 16 Pro Max optimization standards implemented
- Optimized Root layout for 430px viewport
- Enhanced bottom navigation with safe area support
- Added comprehensive mobile CSS utilities
- Updated typography scale for 6.9" display
