---
intent: 003-ux-improvements
phase: inception
status: complete
created: 2026-03-03T17:00:00Z
updated: 2026-03-03T17:00:00Z
---

# Requirements: UX Improvements

## Intent Overview

Comprehensive UX improvements across the investment tracker application — fixing usability gaps, adding missing CRUD operations, improving navigation, enhancing forms, and addressing accessibility concerns.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Users can correct data entry mistakes | Edit/delete available on all transaction and valuation rows | Must |
| Consistent, intuitive navigation | All pages have filtering; sidebar highlights correctly; account detail page exists | Must |
| Polished form experience | Forms reset, pre-select accounts, use themed components | Should |
| Accessible to all users | ARIA roles on custom widgets; keyboard navigation; focus management | Should |

---

## Functional Requirements

### FR-1: Inline Edit & Delete for Transactions
- **Description**: Users can edit and delete transactions directly from the transactions listing page via inline controls.
- **Acceptance Criteria**: Each row shows edit/delete actions; edit toggles inline form; delete shows confirmation; changes persist via API and invalidate SWR cache.
- **Priority**: Must

### FR-2: Inline Edit & Delete for Valuations
- **Description**: Users can edit and delete valuations directly from the valuations listing page, identical pattern to transactions.
- **Acceptance Criteria**: Each row shows edit/delete actions; inline editing for date and value; delete with confirmation; API persistence and cache invalidation.
- **Priority**: Must

### FR-3: Account Detail Page
- **Description**: Dedicated read-only account detail page at `/accounts/{id}` with tabs for Overview, Transactions, Valuations, and History.
- **Acceptance Criteria**: Page loads account data; tabs switch content; "Edit" button links to edit form; back navigation to accounts list.
- **Priority**: Must

### FR-4: Filtering on Transactions Page
- **Description**: Add AccountDateFilter to transactions listing for filtering by account(s) and date range.
- **Acceptance Criteria**: Filter state in URL params; list respects filters; clear filters resets to all.
- **Priority**: Must

### FR-5: Filtering on Valuations Page
- **Description**: Add AccountDateFilter to valuations listing, same behavior as transactions.
- **Acceptance Criteria**: Filter state in URL params; list respects filters; clear filters works.
- **Priority**: Must

### FR-6: Pagination / Load More
- **Description**: Replace hardcoded limit=500 with paginated loading across transactions, valuations, and chart histories.
- **Acceptance Criteria**: Initial load 50 items; "Load more" fetches next batch; total count displayed; no silent truncation.
- **Priority**: Must

### FR-7: Localized Date Formatting
- **Description**: Format all ISO dates into user-friendly locale format throughout the app.
- **Acceptance Criteria**: All visible dates use shared formatDate utility; no raw ISO strings shown.
- **Priority**: Must

### FR-8: Centralize TYPE_COLORS
- **Description**: Extract account type color mappings into a single shared module.
- **Acceptance Criteria**: One TYPE_COLORS definition in src/lib/constants.ts; all pages import from it.
- **Priority**: Must

### FR-9: Filter Dropdown Click-Outside Close
- **Description**: AccountDateFilter dropdown closes when clicking outside.
- **Acceptance Criteria**: Outside click dismisses dropdown; Escape key also closes it.
- **Priority**: Must

### FR-10: Account Pre-Selection on Add Forms
- **Description**: Navigate to add forms with ?accountId=xyz to pre-select that account.
- **Acceptance Criteria**: URL param read on mount; matching account auto-selected.
- **Priority**: Should

### FR-11: Form Reset After Submission
- **Description**: All form fields reset after successful submission on add pages.
- **Acceptance Criteria**: Amount, date, description clear after success; selected account persists for bulk entry.
- **Priority**: Should

### FR-12: Themed Confirmation Dialog for Import
- **Description**: Replace window.confirm() on data import with shadcn Dialog.
- **Acceptance Criteria**: Import triggers styled modal; no native browser dialogs.
- **Priority**: Should

### FR-13: Sidebar Active State for Nested Routes
- **Description**: Navigation sidebar highlights correct parent for nested routes.
- **Acceptance Criteria**: Uses pathname.startsWith(href); all nested routes highlight correctly.
- **Priority**: Must

### FR-14: Charts Error Handling
- **Description**: Add error state to charts page when API calls fail.
- **Acceptance Criteria**: Failed calls show error card with retry; loading skeleton doesn't persist forever.
- **Priority**: Should

### FR-15: Replace Native Select in Add Forms
- **Description**: Replace native select for transaction type with shadcn Select.
- **Acceptance Criteria**: Uses shadcn Select; renders correctly in both themes.
- **Priority**: Should

### FR-16: Search & Sort on Accounts Page
- **Description**: Add search input and sort dropdown to accounts listing.
- **Acceptance Criteria**: Search filters by name; sort by name/value/type/returns; both work together.
- **Priority**: Could

### FR-17: Chat UX Improvements
- **Description**: Add clear history, copy-to-clipboard, and aria-live to AI Insights chat.
- **Acceptance Criteria**: Clear button resets messages; copy icon on assistant bubbles; aria-live on container.
- **Priority**: Could

### FR-18: Valuation Staleness Indicators
- **Description**: Show which accounts haven't been valued recently (>30 days).
- **Acceptance Criteria**: Stale accounts show warning badge; visible on valuations page and dashboard.
- **Priority**: Could

### FR-19: Keyboard Accessible Drag-Drop & Auto-Backup
- **Description**: Make dropzone keyboard-accessible; offer auto-backup before import.
- **Acceptance Criteria**: Dropzone focusable via Tab; Enter triggers file picker; backup button in dialog.
- **Priority**: Could

### FR-20: Logout Confirmation & Mobile Drawer Fixes
- **Description**: Confirmation dialog before logout; focus trap and Escape key in mobile drawer.
- **Acceptance Criteria**: Logout shows confirmation; Escape closes drawer; focus trapped; proper ARIA on backdrop.
- **Priority**: Could

---

## Non-Functional Requirements

### NFR-1: Accessibility
- **Metric**: Custom dropdowns have ARIA roles; dynamic content uses aria-live; focus management in modals/drawers
- **Priority**: Should

### NFR-2: Performance
- **Metric**: Paginated pages load initial data in < 300ms; no full-page reloads for error recovery
- **Priority**: Should

---

## Constraints

### Technical Constraints
- **Project-wide standards**: Loaded from memory-bank standards folder by Construction Agent
- **Intent-specific**: Must use existing shadcn/ui component library; no new dependencies for animations (already handled by 002-ui-modernization)

### Business Constraints
- None

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| API supports PATCH/DELETE for transactions and valuations | CRUD features blocked | Check API routes first, add if missing |
| AccountDateFilter component is reusable across pages | Need to refactor before reuse | Component already parameterized via props |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| None | — | — | — |
