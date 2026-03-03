---
stage: plan
bolt: 015-foundation-fixes
created: 2026-03-03T18:00:00Z
---

## Implementation Plan: Foundation Fixes

### Objective

Establish shared utilities (date formatting, centralized type colors) and fix two UI bugs (filter dropdown behavior, sidebar active state) that affect the entire application. These unblock all subsequent bolts.

### Deliverables

1. `formatDate` utility in `src/lib/format.ts`
2. `TYPE_COLORS` and `TYPE_GRADIENTS` in `src/lib/constants.ts`
3. Click-outside + Escape key handler on `AccountDateFilter`
4. `startsWith`-based active state in `Layout` sidebar

### Dependencies

- None (foundation bolt)

### Technical Approach

**Story 001 — Date Formatting**
- Add `formatDate(iso: string | null | undefined): string` to `src/lib/format.ts`
- Use `Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" })` → "15 Jan 2024"
- Find all raw date displays across pages and replace with `formatDate()`
- Files affected: `transactions/page.tsx`, `valuations/page.tsx`, `transactions/add/page.tsx`, `valuations/add/page.tsx`

**Story 002 — Centralize TYPE_COLORS**
- Create `src/lib/constants.ts` with:
  - `TYPE_COLORS`: `Record<string, string>` — solid bg classes (bg-blue-500, etc.)
  - `TYPE_GRADIENTS`: `Record<string, string>` — gradient classes (from-blue-500 to-blue-600, etc.)
- Update 6 files to import from `@/lib/constants` and remove local definitions:
  - `dashboard/page.tsx` (solid)
  - `accounts/page.tsx` (gradient)
  - `transactions/page.tsx` (solid)
  - `transactions/add/page.tsx` (solid)
  - `valuations/page.tsx` (solid)
  - `valuations/add/page.tsx` (solid)

**Story 003 — Filter Dropdown Fix**
- In `AccountDateFilter`, add `useEffect` with `mousedown` listener on `document`
- If click target is outside `dropdownRef.current`, close dropdown
- Add `keydown` listener for Escape key
- Clean up listeners on unmount

**Story 004 — Sidebar Active State**
- In `Layout.tsx`, change `active={pathname === l.href}` to a helper function:
  - For `/dashboard`: exact match only (avoid matching everything)
  - For all others: `pathname.startsWith(l.href)`
- Applies to both desktop and mobile nav

### Acceptance Criteria

- [ ] All dates display as "15 Jan 2024" format (no raw ISO)
- [ ] TYPE_COLORS defined once in src/lib/constants.ts
- [ ] No duplicate TYPE_COLORS definitions in page files
- [ ] Filter dropdown closes on outside click
- [ ] Filter dropdown closes on Escape key
- [ ] /accounts/123/edit highlights "Accounts" in sidebar
- [ ] /transactions/add highlights "Transactions" in sidebar
- [ ] /dashboard only highlights for exact path
- [ ] Biome lint passes
- [ ] TypeScript compiles
- [ ] No regressions in existing tests
