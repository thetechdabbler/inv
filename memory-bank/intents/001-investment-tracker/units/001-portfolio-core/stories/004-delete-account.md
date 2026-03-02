---
id: 004-delete-account
unit: 001-portfolio-core
intent: 001-investment-tracker
status: complete
priority: must
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 001-portfolio-core
implemented: true
---

# Story: 004-delete-account

## User Story

**As a** user
**I want** to delete an account and all its related data
**So that** I can remove accounts I no longer want to track

## Acceptance Criteria

- [ ] **Given** an existing account, **When** I confirm deletion, **Then** the account and all related transactions and valuations are removed
- [ ] **Given** I attempt to delete, **When** the API is called, **Then** it requires explicit confirmation (e.g., confirm=true parameter)
- [ ] **Given** a deleted account, **When** I list accounts, **Then** it no longer appears

## Technical Notes

- API route: DELETE /api/v1/accounts/:id?confirm=true
- Use Prisma cascading deletes (onDelete: Cascade on Transaction and Valuation relations)
- Consider soft delete for future audit trail needs

## Dependencies

### Requires
- 001-create-account

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Delete without confirmation flag | 400 error — confirmation required |
| Delete non-existent account | 404 error |
| Delete account with many transactions | Cascade delete completes (may take time) |

## Out of Scope

- Soft delete / archive functionality
- Undo delete
