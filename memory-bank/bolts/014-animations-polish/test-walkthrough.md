---
stage: test
bolt: 014-animations-polish
created: 2026-03-03T16:45:00Z
---

# Test Walkthrough: 014-animations-polish

## Test File

`tests/unit/animations-polish-structure.test.ts` — 44 structural tests

## Test Breakdown

### CSS animation foundations (7 tests)
- `globals.css` defines `stagger-item` utility with `animation-delay` and `--stagger` custom property
- `globals.css` has `prefers-reduced-motion: reduce` media query
- `tailwind.config.js` defines `fade-in` and `slide-up` keyframes with correct transforms
- Animation classes have correct durations (`0.4s` and `0.5s`)
- Existing accordion keyframes preserved

### useCountUp hook (6 tests)
- Exports `useCountUp` function
- Uses `requestAnimationFrame` for animation
- Implements ease-out cubic easing
- Respects `prefers-reduced-motion`
- Cleans up with `cancelAnimationFrame`
- Default duration of 800ms

### PageTransition component (3 tests)
- Exports `PageTransition`
- Uses `motion-safe:animate-fade-in`
- Accepts `className` prop

### Button press feedback (2 tests)
- Button includes `active:scale` class
- Uses `motion-safe:` prefix

### 012 — Page-level fade-in transitions (17 tests)
- All 8 pages (dashboard, accounts, charts, data, transactions, transactions/add, valuations, valuations/add) import and use `<PageTransition>`
- InsightChat has `animate-fade-in`

### 013 — Micro-interactions (9 tests)
- Dashboard imports and uses `useCountUp`, passes `rawValue`, has stagger and `--stagger` property
- Accounts page has stagger animation on tiles and hover lift (`hover:-translate-y`)
- Charts page has stagger animation on chart cards
- All stagger animations use `motion-safe:` prefix

## Results

- **44 tests passed**, 0 failed
- **368 total tests passing** across the full suite (1 pre-existing API test failure unrelated to this bolt)
- Biome lint: clean
- TypeScript build: clean
