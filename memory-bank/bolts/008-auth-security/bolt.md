---
id: 008-auth-security
unit: 004-auth-security
intent: 001-investment-tracker
type: ddd-construction-bolt
status: complete
stories:
  - 004-data-export
  - 005-data-import
  - 006-access-logs
created: 2026-03-02T10:35:00.000Z
started: 2026-03-02T21:30:00.000Z
completed: "2026-03-02T16:13:27Z"
current_stage: null
stages_completed:
  - domain_model
  - design
  - adr
  - implement
requires_bolts:
  - 007-auth-security
enables_bolts:
  - 009-investment-tracker-ui
requires_units:
  - 001-portfolio-core
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 008-auth-security

## Overview

Second bolt for auth and security. Implements data export/import for backups and audit logging for access and critical changes.

## Objective

Enable data portability (JSON/CSV backup and restore) and comprehensive audit logging.

## Stories Included

- **004-data-export**: Export all data in JSON/CSV (Should)
- **005-data-import**: Import data from JSON/CSV backup (Should)
- **006-access-logs**: Log login attempts and critical data changes (Should)

## Bolt Type

**Type**: DDD Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [x] **1. Domain Model**: Complete → ddd-01-domain-model.md
- [x] **2. Technical Design**: Complete → ddd-02-technical-design.md
- [x] **3. ADR Analysis**: Complete (no ADRs created)
- [x] **4. Implementation**: Complete → src/
- [ ] **5. Testing**: Pending → ddd-03-test-report.md

## Dependencies

### Requires
- 007-auth-security (encryption infrastructure for export/import)
- portfolio-core unit (data to export)

### Enables
- 009-investment-tracker-ui (export/import UI)

## Success Criteria

- [ ] JSON export includes all accounts, transactions, valuations with metadata
- [ ] CSV export generates ZIP with separate files per entity
- [ ] Import validates data before applying
- [ ] Import uses database transaction (all-or-nothing)
- [ ] Login attempts logged with timestamp, success, IP
- [ ] Critical data changes logged with entity, action, old/new values
- [ ] Tests passing

## Notes

- Exported data should be decrypted (plaintext backup)
- Import must re-encrypt values with current session key
- Consider schema version in export for forward compatibility
- Access logs auto-purge after 90 days
