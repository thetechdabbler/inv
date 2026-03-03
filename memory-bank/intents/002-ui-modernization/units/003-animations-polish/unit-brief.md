---
unit: 003-animations-polish
intent: 002-ui-modernization
phase: inception
status: complete
created: 2026-03-03T12:00:00Z
updated: 2026-03-03T12:00:00Z
---

# Unit Brief: Animations & Polish

## Purpose

Add page transitions, staggered entry animations, number count-up effects, hover/press micro-interactions, and final visual polish across the entire application. This is the finishing layer that makes the UI feel alive and futuristic.

## Scope

### In Scope

- Page-level fade-in transitions on navigation
- Staggered card/list-item entry animations
- Number count-up animation for stat values
- Button press feedback (scale down)
- Hover lift/glow effects on interactive cards
- Skeleton-to-content smooth transitions
- prefers-reduced-motion support

### Out of Scope

- Design system or theming changes (001-design-system)
- Page layout restructuring (002-page-redesign)
- Backend or API changes
- Complex animation library (Framer Motion) — prefer CSS + lightweight JS

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-10 | Page Transitions & Micro-Interactions | Must |

---

## Domain Concepts

### Key Entities

| Entity | Description | Attributes |
|--------|-------------|------------|
| Transition | Page entry animation | type (fade, slide), duration, delay |
| MicroInteraction | Element-level feedback | trigger (hover, press, appear), effect |
| CountUpValue | Animated number display | target value, duration, format function |

### Key Operations

| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| fadeIn | Page content entry | delay, duration | CSS animation |
| staggerIn | Sequential element entry | items, stagger delay | Sequenced animations |
| countUp | Animate number from 0 | target, duration, formatter | Rendered animated value |
| pressEffect | Button feedback | element | Scale transform on active |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 2 |
| Must Have | 2 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 012-page-transitions | Add page-level fade-in transitions | Must | Planned |
| 013-micro-interactions | Add hover, press, count-up, stagger animations | Must | Planned |

---

## Dependencies

### Depends On

| Unit | Reason |
|------|--------|
| 002-page-redesign | Needs all pages redesigned before adding animations |

### Depended By

| Unit | Reason |
|------|--------|
| None | Final unit in the chain |

### External Dependencies

| System | Purpose | Risk |
|--------|---------|------|
| None | Pure CSS + vanilla JS animations | — |

---

## Technical Context

### Suggested Technology

- CSS @keyframes and transitions for most animations
- Intersection Observer API for scroll-triggered entry (if needed)
- Custom React hook `useCountUp` for number animations
- Tailwind `motion-safe:` and `motion-reduce:` variants

### Integration Points

| Integration | Type | Protocol |
|-------------|------|----------|
| All page components | React | CSS classes + hooks |
| globals.css | CSS | @keyframes definitions |

### Data Storage

| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| None | — | — | — |

---

## Constraints

- Animations must be < 300ms for interactive feedback, < 500ms for page transitions
- Must respect prefers-reduced-motion (disable all animations)
- No heavy animation libraries — keep bundle impact minimal
- 60fps target on desktop

---

## Success Criteria

### Functional

- Page content fades in on every navigation
- Card grids stagger-in on load
- Stat numbers count up on dashboard
- Buttons show press feedback
- All animations disabled when prefers-reduced-motion is set

### Non-Functional

- 60fps animation performance
- < 10KB additional bundle size
- No layout shift during animations

### Quality

- Biome lint passes
- TypeScript compiles with no errors
- Animations feel smooth and intentional, not distracting

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 014-animations-polish | simple-construction-bolt | 012-013 | Page transitions and micro-interactions |

---

## Notes

- Consider a shared `animation.css` file with reusable @keyframes
- `useCountUp` hook: animate from 0 to target over ~800ms with easing
- Stagger delay: ~50-80ms between items for a natural cascade feel
- Keep glow effects subtle — thin 1px borders with box-shadow, not thick neon
