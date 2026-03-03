---
stage: plan
bolt: 011-design-system
created: 2026-03-03T13:00:00Z
---

## Implementation Plan: Design System

### Objective

Establish the complete design system infrastructure for UI modernization — install shadcn/ui, define light/dark CSS variable themes, build a theme toggle with persistence, and redesign the sidebar with a minimal futuristic aesthetic.

### Deliverables

- shadcn/ui initialized (`components.json`, utility functions)
- Base shadcn components in `src/components/ui/` (Card, Button, Input, Select, Badge, Table, Tabs, Dialog, Tooltip, Alert, Skeleton)
- Updated `tailwind.config.js` → `tailwind.config.ts` with CSS variable mode and `darkMode: "class"`
- `globals.css` rewritten with light/dark CSS variables in HSL format (`:root` and `.dark`)
- `cn()` utility in `src/lib/utils.ts` (clsx + tailwind-merge)
- ThemeProvider wrapper using `next-themes` in root layout
- `ThemeToggle` component (light/dark/system) in sidebar
- FOUC prevention via `next-themes` `attribute="class"` + `suppressHydrationWarning`
- Redesigned `Layout.tsx` with Lucide icons, glow border, backdrop-blur, animated active indicator

### Dependencies

- `next-themes` — SSR-compatible theme management, FOUC prevention, system preference detection
- `lucide-react` — Icon components to replace inline SVG path strings
- `tailwindcss-animate` — Animation utilities (shadcn peer dependency)
- `class-variance-authority` — Variant-based component styling (shadcn utility)
- `clsx` + `tailwind-merge` — Class name merging (shadcn `cn()` utility)

### Technical Approach

**Story 001 — shadcn/ui Setup**
1. Run `npx shadcn@latest init` to scaffold `components.json` and utility files
2. Generate all base components: `npx shadcn@latest add card button input select badge table tabs dialog tooltip alert skeleton`
3. Verify generated components in `src/components/ui/`
4. Ensure `tailwind.config` is updated for CSS variable mode

**Story 002 — Theme Tokens**
1. Rewrite `globals.css` with `@layer base` defining CSS variables in HSL format
2. `:root` (light): white/slate palette with indigo accents, clean and readable
3. `.dark`: slate-900/950 base with cyan/violet neon accents, soft glow borders
4. Variables follow shadcn naming: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--sidebar-*`
5. Ensure WCAG 2.1 AA contrast ratios in both modes

**Story 003 — Theme Toggle**
1. Install and configure `next-themes` with `ThemeProvider` wrapping the app
2. Set `attribute="class"`, `defaultTheme="system"`, `enableSystem` on ThemeProvider
3. Add `suppressHydrationWarning` to `<html>` element to prevent FOUC
4. Build `ThemeToggle` component with Sun/Moon/Monitor icons from Lucide
5. Three modes: light, dark, system — cycle on click, show current state
6. Persistence handled automatically by `next-themes` via localStorage

**Story 004 — Sidebar Redesign**
1. Replace all inline SVG path strings in `NAV_LINKS` with Lucide icon components
2. Desktop sidebar: backdrop-blur-xl, semi-transparent dark background, subtle glow border on the right edge
3. Dark mode: neon glow on active link, subtle gradient background
4. Light mode: clean whites with indigo accent
5. Active link indicator: left-bar (3px rounded) with accent color + subtle glow
6. Theme toggle positioned at sidebar bottom above logout
7. Mobile drawer: smooth transition, same aesthetic as desktop sidebar
8. Logo: Lucide `TrendingUp` icon with app name

### Acceptance Criteria

- [ ] shadcn CLI initialized and `components.json` present
- [ ] All 11 base components generated in `src/components/ui/`
- [ ] `tailwind.config` uses CSS variable mode with `darkMode: "class"`
- [ ] CSS variables defined in `:root` and `.dark` with HSL values
- [ ] Light palette passes WCAG AA contrast
- [ ] Dark palette has soft glow borders and neon accents
- [ ] All shadcn components inherit theme colors
- [ ] `next-themes` ThemeProvider wraps the application
- [ ] Theme toggle switches between light/dark/system
- [ ] Preference persisted in localStorage (via next-themes)
- [ ] System preference detected and applied
- [ ] No FOUC on page reload
- [ ] `html` element gets correct `dark` class
- [ ] Sidebar uses backdrop-blur in dark mode
- [ ] All nav icons are Lucide components
- [ ] Active link has animated left-bar indicator
- [ ] Theme toggle positioned at sidebar bottom
- [ ] Mobile drawer transitions smoothly
- [ ] Biome lint passes
- [ ] TypeScript compiles with no errors
- [ ] Existing pages still render correctly
