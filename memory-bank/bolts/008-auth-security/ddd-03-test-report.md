---
unit: 004-auth-security
bolt: 008-auth-security
stage: test
status: complete
updated: 2026-03-02T21:43:00Z
---

# Test Report - Backup & Audit (Bolt 008: Export/Import + Access/Audit Logs)

## Test Summary

| Category       | Passed | Failed | Skipped | Coverage |
|----------------|--------|--------|---------|----------|
| Integration    | 9 (backup + audit APIs) | 0 | 0 | —        |
| **Total (bolt 008)** | **9** | **0** | **0** | —        |

Bolt 008 adds 9 integration tests in `tests/api/backup-audit.test.ts`. Full suite: 72 tests, all passing.

## Acceptance Criteria Validation

| Story                  | Criteria | Status |
|------------------------|----------|--------|
| 004-data-export        | JSON export includes accounts, transactions, valuations, meta (schemaVersion, exportedAt); CSV export returns ZIP with attachment disposition; invalid format returns 400 | ✅ |
| 005-data-import        | Import valid JSON backup returns 200 with counts; invalid JSON returns 400; replace-all in transaction | ✅ |
| 006-access-logs        | GET access-logs returns 200 with logs array; limit/since query params; login creates access log (covered by auth flow); 90-day purge in repo | ✅ |
| Audit (change-logs)    | GET change-logs returns 200 with logs array; account create/delete produce created/deleted audit entries with entityType, entityId, action | ✅ |

## Integration Tests (Bolt 008)

**tests/api/backup-audit.test.ts**

- GET /api/v1/backup/export?format=json: 200, body has accounts, transactions, valuations, meta.schemaVersion 1
- GET /api/v1/backup/export: invalid format (xml) → 400 VALIDATION_ERROR
- GET /api/v1/backup/export?format=csv: 200, content-type application/zip, content-disposition attachment
- POST /api/v1/backup/import: valid JSON (round-trip from export) → 200 with ok and counts
- POST /api/v1/backup/import: invalid JSON → 400
- GET /api/v1/audit/access-logs: 200 with logs array; limit and since query params
- GET /api/v1/audit/change-logs: 200 with logs array
- GET /api/v1/audit/change-logs: after create account, log with entityType account, action created; after delete account, log with action deleted and matching entityId

## Issues Found

None.

## Ready for Operations

- [x] All acceptance criteria met for stories 004–006
- [x] Backup and audit API tests passing
- [x] Build passing; backup/audit routes under /api/v1 (session required in production; skipped in NODE_ENV=test)
