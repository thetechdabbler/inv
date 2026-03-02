---
id: 005-filtering-and-search
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
status: complete
priority: must
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 010-investment-tracker-ui
implemented: true
---

# Story: 005-filtering-and-search

## User Story

**As a** user
**I want** to filter transactions and valuations by account and date range
**So that** I can find specific records and analyze specific time periods

## Acceptance Criteria

- [ ] **Given** a list of transactions/valuations, **When** I select an account filter, **Then** only records for that account are shown
- [ ] **Given** a date range picker, **When** I select start and end dates, **Then** only records within that range are shown
- [ ] **Given** combined filters (account + date range), **When** applied, **Then** both filters apply simultaneously

## Technical Notes

- Filter controls: account dropdown (multi-select), date range picker
- Filters apply to transaction history, valuation history, and charts
- Use URL query params for filter state (shareable/bookmarkable)
- Client-side filtering for small datasets, server-side for large

## Dependencies

### Requires
- 003-transaction-valuation-forms (needs data to filter)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No results after filtering | Show "No results" message with clear filters option |
| Invalid date range (end before start) | Validation error |
| All filters cleared | Show all records |

## Out of Scope

- Full-text search across descriptions
- Saved filter presets
- Export filtered results
