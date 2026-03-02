---
id: 004-data-export
unit: 004-auth-security
intent: 001-investment-tracker
status: complete
priority: should
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 008-auth-security
implemented: true
---

# Story: 004-data-export

## User Story

**As a** user
**I want** to export all my data in JSON or CSV format
**So that** I can create backups and migrate my data if needed

## Acceptance Criteria

- [ ] **Given** I request a JSON export, **When** generated, **Then** all accounts, transactions, and valuations are included in a structured JSON file
- [ ] **Given** I request a CSV export, **When** generated, **Then** separate CSV files are created for accounts, transactions, and valuations
- [ ] **Given** exported data contains encrypted fields, **When** exported, **Then** values are decrypted in the export (plaintext backup)

## Technical Notes

- API route: GET /api/v1/backup/export?format=json|csv
- JSON format: { accounts: [], transactions: [], valuations: [] }
- CSV format: ZIP file containing accounts.csv, transactions.csv, valuations.csv
- Include metadata: export timestamp, schema version

## Dependencies

### Requires
- portfolio-core unit (data to export)
- 003-field-encryption (need to decrypt for export)

### Enables
- 005-data-import (import uses same format)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Large dataset (100K+ records) | Stream response, don't load all in memory |
| No data exists | Export empty structure with metadata |
| Export during active write | Consistent snapshot (read transaction) |

## Out of Scope

- Scheduled automatic backups
- Cloud backup (Google Drive, S3)
- Encrypted export format
