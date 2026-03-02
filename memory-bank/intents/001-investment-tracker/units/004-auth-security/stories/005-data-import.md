---
id: 005-data-import
unit: 004-auth-security
intent: 001-investment-tracker
status: draft
priority: should
created: 2026-03-02T10:30:00Z
assigned_bolt: 008-auth-security
implemented: false
---

# Story: 005-data-import

## User Story

**As a** user
**I want** to import data from a JSON or CSV backup
**So that** I can restore my data or migrate from another system

## Acceptance Criteria

- [ ] **Given** a valid JSON backup file, **When** I upload it, **Then** all accounts, transactions, and valuations are imported
- [ ] **Given** a valid CSV ZIP file, **When** I upload it, **Then** data from all CSV files is imported
- [ ] **Given** imported data conflicts with existing data, **When** importing, **Then** the user can choose to merge or replace

## Technical Notes

- API route: POST /api/v1/backup/import with multipart file upload
- Validate schema version compatibility before import
- Use database transaction: all-or-nothing import
- Re-encrypt imported values using current session key

## Dependencies

### Requires
- 004-data-export (uses same format)
- 003-field-encryption (re-encrypt on import)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid file format | Return validation error with details |
| Corrupted file | Abort import, no partial data |
| Schema version mismatch | Attempt migration or reject with message |
| Duplicate accounts | Ask user: skip, rename, or replace |

## Out of Scope

- Import from third-party formats (e.g., bank statements)
- Incremental import (always full import)
