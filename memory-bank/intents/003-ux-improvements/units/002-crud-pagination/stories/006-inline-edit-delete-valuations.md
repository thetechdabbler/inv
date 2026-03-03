---
id: 006-inline-edit-delete-valuations
unit: 002-crud-pagination
intent: 003-ux-improvements
status: planned
priority: Must
complexity: 2
created: 2026-03-03T17:00:00Z
---

# Story: Inline edit/delete for valuations

## User Story
**As a** user who recorded a wrong valuation
**I want** to edit or delete the valuation directly from the list
**So that** my portfolio data stays accurate

## Scope
Same pattern as transaction inline CRUD — edit/delete icons on valuation rows, inline form toggle, confirmation for delete. API persistence and cache invalidation.

## Acceptance Criteria
- [ ] Each valuation row has edit and delete icon buttons
- [ ] Edit toggles row to inline form (date, value) with save/cancel
- [ ] Delete shows confirmation popover
- [ ] Changes persist via API (PATCH/DELETE)
- [ ] SWR cache invalidated after mutation
- [ ] No layout shift during edit mode
