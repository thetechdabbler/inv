---
stage: plan
bolt: 014-animations-polish
created: 2026-03-03T16:00:00Z
---

## Implementation Plan: Animations & Polish

### Objective

Add page transitions, staggered entry animations, number count-up effects, and hover/press micro-interactions while respecting prefers-reduced-motion.

### Deliverables

1. **CSS animations** in `globals.css` — `fadeIn`, `slideUp`, stagger delay utilities
2. **Tailwind config** — new keyframes and animation classes
3. **`useCountUp` hook** — rAF-based number animation with easing
4. **`PageTransition` component** — wraps page content with fade-in
5. **Stagger classes** — applied to card grids on dashboard, accounts
6. **Hover/press micro-interactions** — card lift/glow, button press scale
7. **`prefers-reduced-motion` support** — all animations gated with `motion-safe:`

### Technical Approach

**CSS @keyframes (globals.css)**
- `fadeIn`: opacity 0→1, translateY 8px→0 over 400ms
- `slideUp`: opacity 0→1, translateY 16px→0 over 500ms
- Stagger CSS custom property: `--stagger: 0` with `calc(var(--stagger) * 60ms)` delay

**Tailwind config additions**
- `animate-fade-in`, `animate-slide-up` classes
- Keep existing accordion keyframes untouched

**useCountUp hook**
- `useCountUp(target, duration=800, enabled=true)` → returns animated number
- Uses `requestAnimationFrame` with ease-out cubic
- Returns target immediately when prefers-reduced-motion is set
- Formats via caller-provided function

**PageTransition component**
- Applies `animate-fade-in` to a wrapper div
- Uses `motion-safe:` prefix so animation is skipped for reduced-motion users
- Used in each page's top-level content component

**Stagger animations**
- Card grid items get `style={{ '--stagger': index }}` + `animate-slide-up` class
- Animation delay computed from CSS variable

**Hover/press micro-interactions**
- Cards: `hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0` (already partially present, enhance)
- Buttons: inherent from shadcn — add `active:scale-[0.98]` to button variants
- All gated with `motion-safe:` prefix

### Files Changed

| File | Change |
|------|--------|
| `src/app/globals.css` | Add @keyframes, stagger utility |
| `tailwind.config.js` | Add animation classes |
| `src/hooks/useCountUp.ts` | New: count-up animation hook |
| `src/components/PageTransition.tsx` | New: fade-in wrapper |
| `src/app/dashboard/page.tsx` | Wrap in PageTransition, add count-up to stats, stagger cards |
| `src/app/accounts/page.tsx` | Wrap in PageTransition, stagger account tiles |
| `src/app/charts/page.tsx` | Wrap in PageTransition, stagger chart cards |
| `src/components/InsightChat.tsx` | Add fade-in to chat area |
| `src/app/data/page.tsx` | Wrap in PageTransition |
| `src/app/transactions/page.tsx` | Wrap in PageTransition |
| `src/app/valuations/page.tsx` | Wrap in PageTransition |
| `src/components/ui/button.tsx` | Add active:scale press feedback |
