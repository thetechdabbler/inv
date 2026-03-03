---
stage: implement
bolt: 011-design-system
created: 2026-03-03T13:30:00Z
---

## Implementation Walkthrough: Design System

### Summary

Installed shadcn/ui with 11 base components, configured CSS variable theming for light and dark modes, integrated next-themes for FOUC-free theme management, and redesigned the sidebar with Lucide icons, glow effects, and an animated active indicator.

### Structure Overview

The design system is organized around three layers: configuration (tailwind + CSS variables), providers (ThemeProvider wrapping the app), and components (ThemeToggle + redesigned Layout). All shadcn primitives live in `src/components/ui/` as copied source files.

### Completed Work

- [x] `components.json` — shadcn/ui CLI configuration with New York style, CSS variables enabled, path aliases
- [x] `tailwind.config.js` — Extended with CSS variable colors, darkMode "class", border-radius tokens, animation keyframes, tailwindcss-animate plugin
- [x] `src/app/globals.css` — Light and dark theme CSS variables in HSL format using @layer base, plus glow utility classes
- [x] `src/lib/utils.ts` — cn() utility combining clsx + tailwind-merge for conditional class merging
- [x] `src/components/ThemeProvider.tsx` — Client component wrapping next-themes with class attribute, system default, and transition disabling
- [x] `src/components/ThemeToggle.tsx` — Three-mode toggle (light/dark/system) with Sun/Moon/Monitor Lucide icons and hydration-safe mounting
- [x] `src/components/Layout.tsx` — Full sidebar redesign with Lucide nav icons, semantic color tokens, glow border in dark mode, backdrop-blur, animated active left-bar indicator, theme toggle at bottom
- [x] `src/app/layout.tsx` — Wrapped children with ThemeProvider, added suppressHydrationWarning to html element
- [x] `src/components/ui/card.tsx` — shadcn Card component
- [x] `src/components/ui/button.tsx` — shadcn Button component with variants
- [x] `src/components/ui/input.tsx` — shadcn Input component
- [x] `src/components/ui/select.tsx` — shadcn Select component
- [x] `src/components/ui/badge.tsx` — shadcn Badge component
- [x] `src/components/ui/table.tsx` — shadcn Table component
- [x] `src/components/ui/tabs.tsx` — shadcn Tabs component
- [x] `src/components/ui/dialog.tsx` — shadcn Dialog component
- [x] `src/components/ui/tooltip.tsx` — shadcn Tooltip component
- [x] `src/components/ui/alert.tsx` — shadcn Alert component
- [x] `src/components/ui/skeleton.tsx` — shadcn Skeleton component

### Key Decisions

- **next-themes over custom**: Chose next-themes for robust SSR handling, automatic FOUC prevention, and system preference detection — avoids reinventing complex hydration logic
- **HSL format for CSS variables**: Required by shadcn convention; enables opacity modifiers like `bg-primary/10`
- **disableTransitionOnChange**: Prevents flash of transitioning elements during theme switch for instant mode changes
- **Hydration-safe ThemeToggle**: Uses mounted state check to prevent server/client mismatch, renders placeholder skeleton during SSR

### Deviations from Plan

None

### Dependencies Added

- [x] `next-themes` — Theme management with SSR support
- [x] `lucide-react` — Icon components
- [x] `tailwindcss-animate` — Animation utilities for shadcn
- [x] `class-variance-authority` — Variant-based styling for shadcn components
- [x] `clsx` — Conditional class names utility
- [x] `tailwind-merge` — Intelligent Tailwind class merging
- [x] `@radix-ui/*` — Accessibility primitives (installed as shadcn peer dependencies)

### Developer Notes

- The pre-existing TS error in `tests/api/transactions-valuations-performance.test.ts` (TS2554) is unrelated to this bolt
- shadcn components are copied source — they can be customized directly in `src/components/ui/`
- Dark mode uses cyan (`--primary: 199 89% 48%`) and violet (`--accent: 263 70% 58%`) for the futuristic neon aesthetic
- Light mode uses indigo (`--primary: 239 84% 67%`) for a clean, professional look
