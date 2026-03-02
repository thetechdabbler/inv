---
id: 003-update-account
unit: 001-portfolio-core
intent: 001-investment-tracker
status: complete
priority: must
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 001-portfolio-core
implemented: true
---

# Story: 003-update-account

## User Story

**As a** user
**I want** to edit an account's name, description, or type
**So that** I can correct mistakes or update account details without losing history

## Acceptance Criteria

- [ ] **Given** an existing account, **When** I update its name or description, **Then** the changes are persisted without affecting transactions or valuations
- [ ] **Given** I try to update a non-existent account, **When** I submit, **Then** I receive a 404 error
- [ ] **Given** I update an account, **When** I view it again, **Then** the updatedAt timestamp reflects the change

## Technical Notes

- API route: PATCH /api/v1/accounts/:id
- Only metadata fields (name, description, type) are updatable — initial balance is immutable
- Use optimistic locking or updatedAt check to prevent stale updates

## Dependencies

### Requires
- 001-create-account

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Changing account type | Allowed but warn user (may affect calculations) |
| Empty name | Validation error |
| Concurrent updates | Last write wins (acceptable for single user) |

## Out of Scope

- Changing initial balance (would require recalculating all performance)
- Merging accounts
