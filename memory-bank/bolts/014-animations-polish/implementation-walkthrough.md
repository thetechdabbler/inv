---
stage: implement
bolt: 014-animations-polish
created: 2026-03-03T16:45:00Z
---

# Implementation Walkthrough: 014-animations-polish

## New Files

### `src/hooks/useCountUp.ts`
- rAF-based number animation hook: `useCountUp(target, duration=800, enabled=true)`
- Ease-out cubic easing for natural deceleration feel
- Respects `prefers-reduced-motion` — returns target immediately
- Cleans up with `cancelAnimationFrame` on unmount
- Animates from previous value to new target on updates

### `src/components/PageTransition.tsx`
- Lightweight wrapper applying `motion-safe:animate-fade-in`
- Accepts optional `className` for composability
- Uses Tailwind's `motion-safe:` variant — automatically disabled for reduced motion users

## Modified Files

### `src/app/globals.css`
- Added `.stagger-item` utility — uses CSS custom property `--stagger` to compute `animation-delay: calc(var(--stagger) * 60ms)`
- Added `prefers-reduced-motion: reduce` media query that zeroes out all animation/transition durations

### `tailwind.config.js`
- Added `fade-in` keyframe: `opacity 0→1, translateY 8px→0` over `0.4s ease-out`
- Added `slide-up` keyframe: `opacity 0→1, translateY 16px→0` over `0.5s ease-out`
- Added corresponding `animate-fade-in` and `animate-slide-up` classes
- Preserved existing accordion keyframes

### `src/components/ui/button.tsx`
- Added `motion-safe:active:scale-[0.97]` to base button class for press feedback
- Changed `transition-colors` → `transition-all` to support the scale transform

### `src/app/dashboard/page.tsx`
- Wrapped content in `<PageTransition>`
- `StatCard` now accepts `rawValue` + `index` props
- `StatCard` uses `useCountUp` to animate numbers from 0 to target
- Stat cards have `motion-safe:animate-slide-up stagger-item` with staggered `--stagger` delays
- Top account cards wrapped in stagger animation divs
- Asset allocation card has `motion-safe:animate-fade-in`

### `src/app/accounts/page.tsx`
- Wrapped content in `<PageTransition>`
- Account tiles wrapped in stagger animation divs (`motion-safe:animate-slide-up stagger-item`)
- Account cards enhanced with `motion-safe:hover:-translate-y-0.5 active:translate-y-0` for hover lift

### `src/app/charts/page.tsx`
- Wrapped content in `<PageTransition>`
- Three chart cards have `motion-safe:animate-slide-up stagger-item` with sequential `--stagger` values

### `src/components/InsightChat.tsx`
- Chat container has `motion-safe:animate-fade-in` on the root div

### `src/app/data/page.tsx`
- Wrapped content in `<PageTransition>`

### `src/app/transactions/page.tsx`
- Wrapped content in `<PageTransition>`

### `src/app/transactions/add/page.tsx`
- Wrapped content in `<PageTransition>`

### `src/app/valuations/page.tsx`
- Wrapped content in `<PageTransition>`

### `src/app/valuations/add/page.tsx`
- Wrapped content in `<PageTransition>`

## Key Design Decisions

1. **CSS-first approach**: All animations use CSS @keyframes + Tailwind classes — no animation library needed
2. **`motion-safe:` prefix everywhere**: All animations are automatically disabled for `prefers-reduced-motion` users
3. **Stagger via CSS custom properties**: `--stagger` index set via inline `style`, delay computed in CSS — no JS timers needed
4. **useCountUp hook**: Uses `requestAnimationFrame` for smooth 60fps counting, auto-cleans up
5. **Bundle impact**: ~2KB total new code (hook + component + CSS) — well under 10KB budget
