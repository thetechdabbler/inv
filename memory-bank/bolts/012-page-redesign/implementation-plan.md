---
stage: plan
bolt: 012-page-redesign
created: 2026-03-03T14:00:00Z
---

## Implementation Plan: Page Redesign (Core Pages)

### Objective

Redesign the 4 core financial pages (dashboard, accounts, transactions, valuations) to use shadcn/ui components and CSS variable theming from bolt 011-design-system. All pages must render correctly in both light and dark modes.

### Deliverables

- Redesigned `src/app/dashboard/page.tsx` with shadcn Card, Badge, Skeleton
- Redesigned `src/app/accounts/page.tsx` with shadcn Card tiles, Badge for types
- Redesigned `src/app/transactions/page.tsx` with shadcn Card, Tabs, Badge, Table
- Redesigned `src/app/transactions/add/page.tsx` with shadcn Card, Input, Select, Button
- Redesigned `src/app/valuations/page.tsx` with shadcn Card, Tabs, Table
- Redesigned `src/app/valuations/add/page.tsx` with shadcn Card, Input, Button

### Dependencies

- Bolt 011-design-system (complete) — provides shadcn components, CSS variables, theme system
- Existing API hooks (useSWR) and data formatting (formatInr, formatIndian) — unchanged

### Technical Approach

**General pattern for all pages:**
- Replace hardcoded `bg-white`, `border-slate-200`, `text-slate-800` with semantic tokens: `bg-card`, `border`, `text-card-foreground`
- Replace custom skeleton divs with shadcn `Skeleton` component
- Replace custom tab buttons with shadcn `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`
- Replace `<table>` elements with shadcn `Table` / `TableHeader` / `TableRow` / `TableCell`
- Replace inline SVG icons with Lucide icon components
- Use shadcn `Card` / `CardHeader` / `CardContent` for containers
- Use shadcn `Badge` for account type labels and status indicators
- Use shadcn `Button` for actions (add, submit, cancel, back)
- Use shadcn `Input` / `Select` for form fields
- Preserve all business logic, API calls, and data transformations unchanged

**Story 005 — Dashboard Redesign**
- Stat cards → shadcn Card with themed accent bar
- Allocation bar → keep custom but use theme colors
- Top accounts → shadcn Card list items
- Loading → Skeleton components
- Empty state → Card with dashed border + Button CTA

**Story 006 — Accounts Redesign**
- Account tiles → shadcn Card with Badge for type, themed P&L colors
- Grid layout preserved, hover lift effect via CSS
- Add button → shadcn Button with Plus icon

**Story 007 — Transactions Redesign**
- Tab switcher → shadcn Tabs component
- Month groups → shadcn Card with header/footer
- Monthly report table → shadcn Table
- Add form → shadcn Card, Input, Select, Button
- Back button → shadcn Button variant="ghost" with ArrowLeft icon

**Story 008 — Valuations Redesign**
- Mirror transactions pattern with same shadcn components
- Tab switcher → shadcn Tabs
- Month groups → shadcn Card
- Report table → shadcn Table
- Add form → shadcn Input, Button

### Acceptance Criteria

- [ ] Dashboard stat cards use shadcn Card with theme-aware styling
- [ ] Dashboard allocation and top accounts are visually consistent
- [ ] Dashboard loading uses Skeleton component
- [ ] Dashboard empty state has appropriate placeholder
- [ ] Account tiles use shadcn Card component
- [ ] Account type badges use shadcn Badge component
- [ ] Account P&L display is color-coded (positive/negative)
- [ ] Account cards have hover lift effect
- [ ] Transaction month groups use shadcn Card
- [ ] Transaction summary uses shadcn Badge
- [ ] Transaction report uses shadcn Table
- [ ] Transaction tab switcher uses shadcn Tabs
- [ ] Transaction add form uses shadcn Input, Select, Button
- [ ] Valuation month groups use shadcn Card
- [ ] Valuation report uses shadcn Table
- [ ] Valuation add form uses shadcn Input, Button
- [ ] All 6 pages render correctly in light and dark themes
- [ ] All existing functionality preserved (forms, navigation, data display)
- [ ] Biome lint passes
- [ ] TypeScript compiles
