---
unit: 004-auth-security
bolt: 008-auth-security
stage: design
status: complete
updated: 2026-03-02T21:35:00Z
---

# Technical Design - Auth & Security (Bolt 008: Export/Import & Audit)

## Architecture Pattern

**Layered / Clean-style** (same as 007). Next.js API routes under `/api/v1/backup` and `/api/v1/audit` as presentation; application use cases orchestrate export (read + decrypt), import (validate + transaction + re-encrypt), and logging; domain holds export/import and audit semantics; infrastructure implements Prisma for AccessLog, AuditLog and reuses portfolio-core repos for Account, Transaction, Valuation. Export/import require authenticated session (key for decrypt on export, re-encrypt on import).

## Layer Structure

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Presentation                                                                │
│  GET /api/v1/backup/export?format=json|csv                                   │
│  POST /api/v1/backup/import (multipart file)                                 │
│  GET /api/v1/audit/access-logs, GET /api/v1/audit/change-logs                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Application (Use Cases)                                                     │
│  ExportData (format) → stream or buffer; ImportData (file) → validate + tx   │
│  LogAccess, LogChange — called from login route and from critical ops       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Domain                                                                      │
│  DataExporter, DataImporter, AccessLogger, ChangeLogger                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Infrastructure                                                              │
│  AccessLogRepo, AuditLogRepo (Prisma); Account/Transaction/Valuation repos   │
│  (portfolio-core); session key from 007                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## API Design

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/v1/backup/export` | GET | Query: `format=json` or `format=csv` | 200 + JSON body `{ accounts, transactions, valuations, meta: { exportedAt, schemaVersion } }` or 200 + ZIP (Content-Disposition attachment) with accounts.csv, transactions.csv, valuations.csv. 400 invalid format; 401 no session. |
| `/api/v1/backup/import` | POST | multipart/form-data: `file` (JSON or ZIP) | 200 + `{ ok: true, counts: { accounts, transactions, valuations } }`; 400 validation error (invalid file, schema mismatch); 409 conflict policy required; 401 no session. |
| `/api/v1/audit/access-logs` | GET | Query: `limit?`, `since?` (ISO date) | 200 + `{ logs: [{ id, action, ipAddress, success, timestamp }] }`; 401 no session. |
| `/api/v1/audit/change-logs` | GET | Query: `limit?`, `since?`, `entityType?` | 200 + `{ logs: [{ id, entityType, entityId, action, oldValue?, newValue?, timestamp }] }`; 401 no session. |

All amounts in export/import in **paise** (ADR-001). Export is plaintext (decrypted); import re-encrypts with current session key.

## Data Persistence

| Table | Columns | Relationships |
|-------|---------|---------------|
| **access_logs** | id (cuid), action (string), ip_address (string), success (boolean), timestamp (DateTime), createdAt | Append-only. action e.g. "login". Purge rows where timestamp &lt; now - 90 days (job or on-write). |
| **audit_logs** | id (cuid), entity_type (string), entity_id (string), action (string), old_value (text?), new_value (text?), timestamp (DateTime), createdAt | Append-only. entity_type ∈ { account, transaction, valuation }; action ∈ { created, updated, deleted }. old_value/new_value JSON or redacted. |

Existing: Account, Transaction, Valuation (portfolio-core). Import writes to these in a single transaction; export reads from these.

## Security Design

| Concern | Approach |
|---------|----------|
| Export/import auth | Require valid session (middleware); session key used to decrypt on export and re-encrypt on import. |
| Export plaintext | Backup file is plaintext; user is responsible for storing securely. |
| Audit log sensitivity | Redact or hash sensitive fields in old_value/new_value (e.g. amounts as "***" or hash). |
| Access log retention | Purge access_logs where timestamp older than 90 days (scheduled or on append). |

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| Export 100K+ records | Stream JSON (NDJSON) or chunk CSV; or limit single response and document pagination; avoid loading all in memory at once. |
| Import all-or-nothing | Single Prisma transaction; rollback on any validation or write failure. |
| Schema version | Export includes meta.schemaVersion (e.g. 1); import rejects or migrates if version &gt; supported. |
| Access log purge | Optional: cron or on create delete where timestamp &lt; 90 days ago; or background job. |

## Error Handling

| Error Type | HTTP | Response Body |
|------------|------|----------------|
| Invalid export format | 400 | `{ code: "VALIDATION_ERROR", message: "format must be json or csv" }` |
| Invalid import file / schema | 400 | `{ code: "VALIDATION_ERROR", message: "..." }` |
| Schema version mismatch | 400 | `{ code: "SCHEMA_VERSION_UNSUPPORTED", message: "..." }` |
| No session (export/import/audit) | 401 | `{ code: "UNAUTHORIZED", message: "Authentication required" }` |
| Import conflict policy missing | 409 | `{ code: "CONFLICT_POLICY_REQUIRED", message: "..." }` (if we support merge/replace query param) |
| Server error | 500 | `{ code: "INTERNAL_ERROR", message: "..." }` |

## Export Format (Schema Version 1)

**JSON**: `{ "accounts": [...], "transactions": [...], "valuations": [...], "meta": { "exportedAt": "ISO8601", "schemaVersion": 1 } }`. Each entity: same shape as API (id, type, name, initialBalancePaise, etc. for accounts; id, accountId, date, amountPaise, type for transactions; id, accountId, date, valuePaise for valuations).

**CSV ZIP**: Three files: accounts.csv, transactions.csv, valuations.csv. Headers in first row; meta in a separate meta.json or first row comment. ZIP name e.g. backup-YYYY-MM-DD.zip.

## Import Behavior

1. Parse file (JSON or unzip + parse CSVs).
2. Validate meta.schemaVersion (support 1); reject if unsupported.
3. Validate required fields per entity type.
4. Optional: conflict policy query param (replace_all | merge). Default replace_all: delete existing accounts/transactions/valuations (or truncate) then insert; merge: skip or update by id (design choice).
5. Single transaction: apply all inserts; on failure rollback.
6. Re-encrypt sensitive fields (if 007 field encryption is applied) using current session key before persisting.

## Logging Integration

- **AccessLog**: Call AccessLogger.logAccess("login", success, ip) from POST /api/v1/auth/login (after verify). IP from request headers (x-forwarded-for or similar).
- **AuditLog**: Call ChangeLogger.logChange(entityType, entityId, action, old?, new?) from application layer when: account created/deleted, transaction created/deleted, valuation created (or from API route handlers that perform these). Prefer application-layer calls so all code paths (API, future CLI) are covered.

## Implementation Notes (Stage 4)

1 - **Prisma**: Add AccessLog and AuditLog models; migration.
2 - **Repos**: access-log-repository.ts (create, findRecent, purgeOlderThan), audit-log-repository.ts (create, findRecent).
3 - **Export**: Use case loads all accounts, transactions, valuations (via existing repos); decrypt if encrypted; build JSON or CSV; return buffer or stream. Route GET /api/v1/backup/export?format=json|csv sets Content-Type and Content-Disposition.
4 - **Import**: Use case accepts parsed payload; validate; prisma.$transaction([delete or truncate, create many]); re-encrypt if applicable. Route POST /api/v1/backup/import parses multipart, calls use case.
5 - **Audit routes**: GET access-logs and change-logs call repos findRecent(limit, since); return JSON.
6 - **Login**: In 007 login route, after successful verify call accessLogger.logAccess("login", true, ip); on failure call accessLogger.logAccess("login", false, ip). IP from request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown".
