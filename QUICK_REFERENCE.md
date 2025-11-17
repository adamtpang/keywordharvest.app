# 🚀 Quick Reference - Keyword Harvest Design Stack

## Commands

```bash
npm install           # Install dependencies
npm run dev          # Development mode
npm run build        # Production build
npm run type-check   # TypeScript check
```

## Import Paths

```tsx
// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

// Extension Components
import { CompactButton } from '@/components/extension/compact-button'
import { PopupCard } from '@/components/extension/popup-card'
import { MinimalBadge } from '@/components/extension/minimal-badge'
import { QuickToggle } from '@/components/extension/quick-toggle'

// Utils
import { cn } from '@/lib/utils'
import { storage } from '@/lib/utils'
import { useMotion } from '@/lib/motion-lite'

// Icons
import { Search, Download, Copy } from 'lucide-react'
```

## Component Usage

### CompactButton (400px optimized)
```tsx
<CompactButton
  variant="default" // default | destructive | outline | secondary | ghost
  icon={<Search />}
  onClick={handleClick}
>
  Extract
</CompactButton>
```

### PopupCard
```tsx
<PopupCard
  title="Results"
  description="Found 42 matches"
>
  {children}
</PopupCard>
```

### MinimalBadge (space-efficient)
```tsx
<MinimalBadge count={42} />
<MinimalBadge>NEW</MinimalBadge>
```

### QuickToggle (inline label)
```tsx
<QuickToggle
  id="case-sensitive"
  label="Case sensitive"
  description="Match exact letter casing"
  checked={checked}
  onCheckedChange={setChecked}
/>
```

## Tailwind Utilities

### Extension-Specific
```tsx
<div className="popup-container">    {/* 400px max, 500-600px height */}
<div className="popup-spacing">      {/* p-3 space-y-3 */}
<Button size="compact">              {/* h-7 px-2 text-xs */}
<Badge variant="minimal">            {/* Smallest badge */}
```

### Common Patterns
```tsx
className="flex items-center gap-2"  // Horizontal layout
className="space-y-3"                // Vertical spacing
className="text-sm text-muted-foreground"  // Subtle text
```

## Motion (Use Sparingly!)

```tsx
import { useMotion } from '@/lib/motion-lite'

const { animateElement } = useMotion()
const ref = useRef<HTMLDivElement>(null)

// On success:
animateElement(ref, 'successBounce')  // 300ms

// Available presets:
// 'press'          - 50ms
// 'successBounce'  - 300ms
// 'toggle'         - 150ms
// 'fadeIn'         - 200ms
// 'slideUp'        - 200ms
```

## Chrome Storage

```tsx
import { storage } from '@/lib/utils'

// Save
await storage.set('key', value)

// Load
const value = await storage.get<Type>('key')

// Remove
await storage.remove('key')
```

## Chrome Messaging

### From Popup to Content Script
```tsx
const response = await chrome.tabs.sendMessage(tabId, {
  action: 'extractKeywords',
  keyword: 'example',
  options: { caseSensitive: true }
})
```

### In Content Script
```tsx
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractKeywords') {
    const results = extractKeywords(request.keyword, request.options)
    sendResponse({ success: true, results })
  }
  return true // Keep channel open
})
```

## Color Variables (CSS)

```css
/* In components: */
className="bg-primary text-primary-foreground"
className="bg-secondary text-secondary-foreground"
className="bg-destructive text-destructive-foreground"
className="text-muted-foreground"
className="border-border"

/* HSL Values in src/styles/globals.css */
--primary: 262 83% 58%      /* Purple */
--secondary: 210 40% 96.1%  /* Light gray */
--destructive: 0 84.2% 60.2% /* Red */
```

## Performance Checklist

- [ ] Popup renders <100ms
- [ ] Animations <300ms each
- [ ] Bundle size <2MB
- [ ] No console.logs in production
- [ ] Light/dark mode works
- [ ] 400px width respected

## Build Output Structure

```
dist/
├── popup.html
├── options.html
├── popup.js          # React popup bundle
├── options.js        # React options bundle
├── content.js        # Content script
├── background.js     # Service worker
├── assets/          # CSS + images
├── chunks/          # Code-split chunks
├── icon*.png
└── manifest.json
```

## Common Issues

**Import errors:** Check `@/` alias in tsconfig.json
**Styles not loading:** Verify globals.css import in popup/index.tsx
**Motion not working:** Ensure ref is defined, use sparingly
**Popup doesn't open:** Check manifest.json copied to dist/

## File Size Limits

- Total extension: <2MB (Chrome Web Store)
- Single file: <4MB
- Keep popup JS <150KB (gzipped)

## Testing

```bash
# Build
npm run build

# Load in Chrome
1. chrome://extensions/
2. Enable "Developer mode"
3. "Load unpacked" → select dist/
4. Test on multiple websites
5. Check both light/dark themes
```

---

**Quick tip:** Start with the demo `PopupApp.tsx` and modify it to your needs!
