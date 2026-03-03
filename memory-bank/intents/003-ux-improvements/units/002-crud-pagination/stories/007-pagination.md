---
id: 007-pagination
unit: 002-crud-pagination
intent: 003-ux-improvements
status: planned
priority: Must
complexity: 2
created: 2026-03-03T17:00:00Z
---

# Story: Paginated data loading with Load More

## User Story
**As a** user with many transactions and valuations
**I want** data to load in pages with a "Load more" button
**So that** the page loads quickly and I can see all my data progressively

## Scope
Replace hardcoded limit=500 with paginated loading (50 items per page) on transactions, valuations, and chart history endpoints. Add "Load more" button showing remaining count.

## Acceptance Criteria
- [ ] Initial load fetches 50 items
- [ ] "Load more" button fetches next 50
- [ ] Total count displayed (e.g., "Showing 50 of 234")
- [ ] Works with monthly grouping on transactions/valuations pages
- [ ] Chart history also paginated (or uses reasonable limit with indicator)
- [ ] No silent data truncation
