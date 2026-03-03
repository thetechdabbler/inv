---
stage: plan
bolt: 013-page-redesign
created: 2026-03-03T15:00:00Z
---

## Implementation Plan: Page Redesign (Secondary Pages)

### Objective

Redesign the 3 secondary pages (charts, AI insights, import/export) to use shadcn/ui components and CSS variable theming, completing the full-app visual redesign.

### Deliverables

- Redesigned `src/app/charts/page.tsx` with shadcn Card frames, Skeleton loading, Button for filters
- Redesigned `src/components/InsightChat.tsx` with themed chat bubbles, shadcn Button for quick actions and send, Input for chat, Alert for warnings
- Redesigned `src/app/data/page.tsx` with shadcn Card, Alert, Button, Lucide icons

### Dependencies

- Bolt 012-page-redesign (complete) — patterns established
- Existing chart components (AllocationPieChart, ContributionsBarChart, PortfolioLineChart) — unchanged
- react-markdown — unchanged

### Technical Approach

**Story 009 — Charts Redesign**
- Replace section wrappers with shadcn Card + CardHeader + CardContent
- Replace loading divs with Skeleton components
- Replace hardcoded colors with semantic tokens
- Add `dark:glow-border` on chart cards in dark mode
- Replace custom buttons with shadcn Button
- Replace empty state with Card + dashed border pattern

**Story 010 — Insights Redesign**
- Quick actions → shadcn Button variant="outline" with rounded-full
- Chat container → Card component
- User bubble → bg-primary text-primary-foreground
- Assistant bubble → bg-muted text-foreground
- Error bubble → destructive styling
- Empty state → Lucide Lightbulb icon + muted text
- Warning alert → shadcn Alert component
- Input → shadcn Input
- Send button → shadcn Button
- Typing indicator → animate-pulse dots

**Story 011 — Data Page Redesign**
- Export/Import sections → shadcn Card with CardHeader/CardContent
- Export buttons → styled Card sub-items with hover
- Warning → shadcn Alert (destructive variant)
- Success → shadcn Alert (default with emerald styling)
- Import button → shadcn Button
- File dropzone → Card with dashed border
- Inline SVGs → Lucide icons (Download, Upload, AlertTriangle, FileJson, FileSpreadsheet, CheckCircle)

### Acceptance Criteria

- [ ] Chart cards use shadcn Card with glow border in dark mode
- [ ] Charts loading uses Skeleton components
- [ ] Filter clear uses shadcn Button
- [ ] Insight chat bubbles are distinctly styled and theme-aware
- [ ] Typing indicator shows animated feedback
- [ ] Quick actions use shadcn Button
- [ ] Insights empty state has Lucide icon
- [ ] Warning alert uses shadcn Alert
- [ ] Export/import sections use shadcn Card
- [ ] Data page buttons use shadcn Button
- [ ] Data page alerts use shadcn Alert
- [ ] Data page uses Lucide icons
- [ ] All 3 pages render correctly in both themes
- [ ] Biome lint passes
- [ ] TypeScript compiles
