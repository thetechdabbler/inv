---
unit: 002-crud-pagination
intent: 003-ux-improvements
phase: inception
status: ready
created: 2026-03-03T17:00:00Z
updated: 2026-03-03T17:00:00Z
---

# Unit Brief: CRUD & Pagination

## Purpose

Add inline edit and delete capabilities for transactions and valuations, and replace hardcoded limit=500 with paginated data loading across all data-heavy pages.

## Scope

### In Scope
- Inline edit/delete on transaction rows (toggle editable fields, delete with confirmation)
- Inline edit/delete on valuation rows (same pattern)
- Paginated loading with "Load more" for transactions, valuations, chart histories
- API routes for PATCH/DELETE if not already present

### Out of Scope
- Batch operations (bulk delete/edit)
- Infinite scroll (using "Load more" button instead)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Inline Edit & Delete for Transactions | Must |
| FR-2 | Inline Edit & Delete for Valuations | Must |
| FR-6 | Pagination / Load More | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| EditableRow | Transaction/valuation row in edit mode | isEditing flag, form state, original values |
| PaginatedList | Data list with load-more | items[], page, hasMore, totalCount |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| updateTransaction | Edit transaction inline | id, fields | Updated transaction |
| deleteTransaction | Remove transaction | id | Success/error |
| updateValuation | Edit valuation inline | id, fields | Updated valuation |
| deleteValuation | Remove valuation | id | Success/error |
| loadMore | Fetch next page | offset, limit | Additional items |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 3 |
| Must Have | 3 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 005-inline-edit-delete-transactions | Inline edit/delete for transactions | Must | Planned |
| 006-inline-edit-delete-valuations | Inline edit/delete for valuations | Must | Planned |
| 007-pagination | Paginated data loading with Load More | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-foundation-quality | Uses formatDate in edited rows, centralized colors |

### Depended By
| Unit | Reason |
|------|--------|
| 005-polish-accessibility | Builds on completed CRUD for additional polish |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| REST API | May need PATCH/DELETE routes for transactions/valuations | Medium — check existing routes |

---

## Technical Context

### Suggested Technology
- React state for inline edit mode toggling
- SWR mutate for optimistic updates and cache invalidation
- API offset/limit params for pagination
- shadcn Popover or inline confirmation for delete

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| /api/v1/transactions | REST | GET (paginated), PATCH, DELETE |
| /api/v1/valuations | REST | GET (paginated), PATCH, DELETE |
| SWR cache | Client | mutate() for invalidation |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Transactions | SQLite | Potentially 1000s per account | Permanent |
| Valuations | SQLite | Potentially 100s per account | Permanent |

---

## Constraints

- Inline edit must not cause layout shift in the transaction/valuation table
- Delete confirmation must be non-blocking (popover, not modal)
- Pagination must work with existing monthly grouping logic

---

## Success Criteria

### Functional
- [ ] Transactions can be edited inline (date, amount, type, description)
- [ ] Transactions can be deleted with confirmation
- [ ] Valuations can be edited inline (date, value)
- [ ] Valuations can be deleted with confirmation
- [ ] Pages load 50 items initially with "Load more" button
- [ ] Total count shown to user

### Non-Functional
- [ ] No layout shift during inline edit
- [ ] Initial page load < 300ms

### Quality
- [ ] Biome lint passes
- [ ] TypeScript compiles

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 016-inline-crud-pagination | simple-construction-bolt | 005-007 | CRUD + pagination |

---

## Notes

- Check if API already has PATCH/DELETE for transactions and valuations — may need to add routes
- Pagination should use cursor-based or offset-based depending on API capability
- Monthly grouping on transactions/valuations pages must still work with paginated data
