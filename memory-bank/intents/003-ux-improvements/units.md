---
intent: 003-ux-improvements
phase: inception
status: units-decomposed
updated: 2026-03-03T17:00:00Z
---

# UX Improvements - Unit Decomposition

## Units Overview

This intent decomposes into 5 units of work:

### Unit 1: 001-foundation-quality

**Description**: Quick foundational fixes that unblock other units — date formatting, centralized colors, filter dropdown fix, sidebar active state.

**Stories**: 001-date-formatting, 002-centralize-type-colors, 003-filter-dropdown-fix, 004-sidebar-active-state

**Deliverables**: `formatDate` utility, shared `TYPE_COLORS`, fixed `AccountDateFilter`, fixed `Layout` sidebar

**Dependencies**: None

**Estimated Complexity**: S

### Unit 2: 002-crud-pagination

**Description**: Inline edit/delete for transactions and valuations, plus pagination across all data-heavy pages.

**Stories**: 005-inline-edit-delete-transactions, 006-inline-edit-delete-valuations, 007-pagination

**Deliverables**: Inline CRUD UI + API routes if needed, paginated data loading

**Dependencies**: Depends on 001-foundation-quality (date formatting used in CRUD rows)

**Estimated Complexity**: L

### Unit 3: 003-account-detail-filtering

**Description**: New account detail page and AccountDateFilter added to transactions and valuations pages.

**Stories**: 008-account-detail-page, 009-transactions-filtering, 010-valuations-filtering

**Deliverables**: `/accounts/{id}` page with tabs, filter integration on listing pages

**Dependencies**: Depends on 001-foundation-quality (filter dropdown fix)

**Estimated Complexity**: M

### Unit 4: 004-form-feedback

**Description**: Form UX improvements — account pre-selection, form reset, themed dialogs, charts error handling, native select replacement.

**Stories**: 011-account-preselection, 012-form-reset, 013-themed-confirmation-dialog, 014-charts-error-handling, 015-replace-native-select

**Deliverables**: Updated add forms, themed Dialog, charts error state, shadcn Select integration

**Dependencies**: Depends on 001-foundation-quality

**Estimated Complexity**: M

### Unit 5: 005-polish-accessibility

**Description**: Nice-to-have polish — search/sort on accounts, chat improvements, staleness indicators, keyboard a11y, drawer/logout fixes.

**Stories**: 016-search-sort-accounts, 017-chat-improvements, 018-staleness-indicators, 019-keyboard-dragdrop-autobackup, 020-logout-drawer-fixes

**Deliverables**: Enhanced accounts page, improved chat, stale badges, a11y fixes

**Dependencies**: Depends on 002-crud-pagination, 003-account-detail-filtering, 004-form-feedback

**Estimated Complexity**: M

## Unit Dependency Graph

```text
[001-foundation-quality]
   ├──> [002-crud-pagination] ──────────┐
   ├──> [003-account-detail-filtering] ─┤
   └──> [004-form-feedback] ────────────┤
                                        └──> [005-polish-accessibility]
```

## Execution Order

1. Bolt 015: 001-foundation-quality (foundation)
2. Bolts 016, 017, 018: 002, 003, 004 (parallel-capable)
3. Bolt 019: 005-polish-accessibility (final)
