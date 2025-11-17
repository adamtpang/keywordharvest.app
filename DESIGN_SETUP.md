# 🎨 Keyword Harvest - Modern Design Stack Setup

## ✅ Setup Complete!

Your Chrome extension is now configured with a modern, lightweight design stack optimized for Chrome's 400px popup constraints.

## 🎯 What's Installed

### Core Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Motion** - Micro-animations (used sparingly!)

### UI Components (Lightweight)
Minimal shadcn/ui components - only what you need:
- ✅ Button (with `compact` size variant)
- ✅ Input
- ✅ Badge (with `minimal` variant)
- ✅ Switch

### Extension-Specific Components
Custom components optimized for 400px width:
- **CompactButton** - Smaller buttons with optional icons
- **PopupCard** - Responsive card with compact padding
- **MinimalBadge** - Space-efficient badges (count display)
- **QuickToggle** - Toggle with label in compact layout

### Motion Lite Utilities (`@/lib/motion-lite.ts`)
Carefully selected micro-interactions (<300ms each):
- `press` - Button press feedback (50ms)
- `successBounce` - Checkmark bounce (300ms)
- `toggle` - Switch slide animation (150ms)
- `fadeIn` - Results fade-in (200ms)
- `slideUp` - Notification slide-up (200ms)

**⚠️ Performance Guidelines:**
- Use animations ONLY for critical feedback
- Avoid animating on popup open (slows down UX)
- Max 5 items for stagger animations
- Total render time target: <100ms

## 📁 Project Structure

```
keywordharvest.app/
├── src/
│   ├── popup/              # Popup UI (React)
│   │   ├── index.tsx       # Entry point
│   │   └── PopupApp.tsx    # Main popup component
│   ├── options/            # Options page (future)
│   ├── background/         # Service worker
│   │   └── index.ts
│   ├── content/            # Content script
│   │   └── index.ts
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   └── switch.tsx
│   │   └── extension/      # Extension-specific
│   │       ├── compact-button.tsx
│   │       ├── popup-card.tsx
│   │       ├── minimal-badge.tsx
│   │       └── quick-toggle.tsx
│   ├── lib/
│   │   ├── utils.ts        # cn() + Chrome storage utils
│   │   └── motion-lite.ts  # Minimal animation presets
│   └── styles/
│       └── globals.css     # Tailwind + theme CSS vars
├── popup-new.html          # Popup HTML
├── options.html            # Options HTML
├── manifest-new.json       # Manifest V3 with CSP
├── vite.config.ts          # Build configuration
├── tailwind.config.js      # Tailwind + extension presets
└── package.json
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
```bash
npm run dev
```
Then load `dist/` folder as unpacked extension in Chrome.

### 3. Production Build
```bash
npm run build
```
Output in `dist/` folder, ready to zip and upload.

## 🎨 Design System

### Colors (CSS Variables)
Using shadcn/ui's color system with HSL values:
- `--primary` - Main brand color (purple: 262 83% 58%)
- `--secondary` - Secondary actions
- `--destructive` - Delete/danger actions
- `--muted` - Subtle backgrounds
- `--accent` - Highlights

**Light/Dark Mode:** Automatically switches based on Chrome's theme.

### Spacing
- `popup` spacing utility: `0.75rem` (12px)
- `.popup-container` - Optimized popup dimensions
- `.popup-spacing` - Consistent padding/gaps

### Typography
- Base: 14px (text-sm)
- Headings: text-lg (18px)
- Compact: text-xs (12px)
- Minimal badges: text-[10px]

## 🔧 Tailwind Utilities

### Extension-Specific
```tsx
<div className="popup-container popup-spacing">
  {/* 400px max width + consistent spacing */}
</div>

<Button size="compact">
  {/* Smaller button (h-7 px-2 py-1 text-xs) */}
</Button>

<Badge variant="minimal">
  {/* Space-efficient badge */}
</Badge>
```

### Animations (Use Sparingly!)
```tsx
import { useMotion } from '@/lib/motion-lite'

const { animateElement, presets } = useMotion()

// On success:
animateElement(ref, 'successBounce')
```

## 📦 Bundle Size Optimization

### Current Setup:
- **Vite**: Tree-shaking + minification
- **Target**: Chrome 114+ (modern syntax, smaller bundles)
- **CSS**: Single file (no code-splitting)
- **Console logs**: Stripped in production

### Bundle Size Targets:
- Popup JS: <150KB (gzipped)
- Popup CSS: <20KB (gzipped)
- Content script: <50KB (gzipped)
- Total: <2MB (Chrome Web Store limit)

## 🎯 Performance Checklist

- [ ] Popup renders in <100ms
- [ ] Animations are <300ms each
- [ ] No layout shifts on load
- [ ] Dark mode works correctly
- [ ] 400px width constraint respected
- [ ] Bundle size <2MB

## 🔐 Content Security Policy

Manifest V3 CSP configured for:
- ✅ No inline scripts (Vite handles this)
- ✅ No eval() or Function()
- ✅ `script-src 'self'` only
- ✅ External resources blocked (use bundled assets)

## 📝 Next Steps

1. **Add Your Coolors Palette:**
   - Update CSS variables in `src/styles/globals.css`
   - Or replace HSL values in `tailwind.config.js`

2. **Implement Keyword Logic:**
   - Connect popup to content script
   - Port existing extraction logic to TypeScript
   - Use Chrome messaging API

3. **Add More Components (if needed):**
   ```bash
   # Only add what you'll use!
   # - card (for options page)
   # - tabs (for multi-section UI)
   # - select (for dropdown options)
   ```

4. **Test Build:**
   ```bash
   npm run build
   cd dist
   # Load in Chrome: chrome://extensions/
   ```

## 🎨 Applying Your Coolors Palette

Update `src/styles/globals.css`:

```css
:root {
  --primary: [H] [S]% [L]%;
  --secondary: [H] [S]% [L]%;
  /* ...etc */
}
```

Or use Tailwind config for direct color values:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        50: '#...',
        100: '#...',
        // ... your palette
      }
    }
  }
}
```

## 📚 Resources

- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Motion Docs](https://motion.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)

## 🐛 Troubleshooting

**Issue:** Popup doesn't open
- Check `manifest-new.json` is copied to `manifest.json` in dist
- Verify Vite build completed without errors

**Issue:** Styles not loading
- Check `globals.css` is imported in `popup/index.tsx`
- Verify Tailwind directives are present

**Issue:** Motion not working
- Ensure using motion utilities sparingly
- Check if element ref is defined

---

**Your extension is now set up with a modern, performant design stack! 🚀**

Ready to build → `npm run build`
