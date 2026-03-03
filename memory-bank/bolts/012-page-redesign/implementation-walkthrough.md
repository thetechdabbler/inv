---
stage: implement
bolt: 012-page-redesign
created: 2026-03-03T14:30:00Z
---

## Implementation Walkthrough: Page Redesign (Core Pages)

### Summary

Redesigned all 6 core financial pages (dashboard, accounts, transactions listing + add, valuations listing + add) to use shadcn/ui components and CSS variable theming. All hardcoded slate/white colors replaced with semantic tokens for proper light/dark mode support.

### Structure Overview

Each page follows the same conversion pattern: replace raw HTML elements with shadcn primitives (Card, Badge, Button, Table, Tabs, Input, Skeleton), replace inline SVGs with Lucide icons, and swap hardcoded color classes with semantic tokens (text-foreground, bg-card, border, text-muted-foreground, etc.). All business logic, API calls, and data transformations remain unchanged.

### Completed Work

- [x] `src/app/dashboard/page.tsx` — Stat cards use shadcn Card with accent bars, Skeleton loading, Badge for P&L indicators, Lucide icons, Button for CTAs
- [x] `src/app/accounts/page.tsx` — Account tiles use shadcn Card with hover lift, Badge for type labels and P&L, Button for add action, Skeleton loading
- [x] `src/app/transactions/page.tsx` — shadcn Tabs for view switching, Card for month groups, Table with TableHeader/Body/Footer for report, Badge for net summaries, Skeleton loading
- [x] `src/app/transactions/add/page.tsx` — shadcn Card for layout, Input for form fields, Button (primary + ghost) for actions, Skeleton loading
- [x] `src/app/valuations/page.tsx` — Mirrors transactions pattern with shadcn Tabs, Card, Table for report, Badge for portfolio summaries
- [x] `src/app/valuations/add/page.tsx` — shadcn Card, Input, Button matching transactions add form pattern

### Key Decisions

- **Semantic color tokens throughout**: All `text-slate-*`, `bg-white`, `border-slate-*` replaced with `text-foreground`, `bg-card`, `border`, `text-muted-foreground` etc. to ensure proper theming
- **Dark mode color overrides for financial indicators**: Used explicit `dark:text-emerald-400` and `dark:text-red-400` for P&L colors since these need to be visible in both modes while the base emerald/red colors are optimized for light mode contrast
- **shadcn Tabs over custom tab buttons**: Replaced the custom tab switcher with shadcn Tabs (Radix-based) for accessibility (keyboard navigation, ARIA attributes)
- **Button asChild for Link elements**: Used Button's `asChild` prop with `<Link>` to get button styling on navigation elements without duplicating anchor/button elements

### Deviations from Plan

- Select fields on transaction add form still use native `<select>` with shadcn-compatible styling rather than the Radix Select, because react-hook-form's `register` works directly with native select elements

### Dependencies Added

None — all dependencies were installed in bolt 011-design-system

### Developer Notes

- The `TYPE_COLORS` record is duplicated across pages — a future refactor could extract it to a shared module
- Financial indicator colors (emerald/red) are explicit rather than using theme tokens, since positive/negative have universal color associations
