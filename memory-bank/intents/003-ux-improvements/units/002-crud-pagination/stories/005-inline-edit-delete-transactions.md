---
id: 005-inline-edit-delete-transactions
unit: 002-crud-pagination
intent: 003-ux-improvements
status: planned
priority: Must
complexity: 3
created: 2026-03-03T17:00:00Z
---

# Story: Inline edit/delete for transactions

## User Story
**As a** user who made a mistake in a transaction entry
**I want** to edit or delete the transaction directly from the list
**So that** I can correct errors without re-entering data

## Scope
Add edit and delete icons to each transaction row. Edit toggles inline form fields. Delete shows a confirmation popover. Both persist via API and invalidate SWR cache.

## Acceptance Criteria
- [ ] Each transaction row has edit (pencil) and delete (trash) icon buttons
- [ ] Edit toggles row to inline form with save/cancel
- [ ] Delete shows confirmation popover before removing
- [ ] Changes persist via API (PATCH/DELETE)
- [ ] SWR cache invalidated after mutation
- [ ] No layout shift during edit mode
