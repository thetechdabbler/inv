---
## unit: 004-auth-security
bolt: 008-auth-security
stage: model
status: complete
updated: 2026-03-02T21:30:00Z

# Static Model - Auth & Security (Data Export/Import & Audit Logging)

## Bounded Context

**Data Portability & Audit Logging**. This context owns full export of accounts, transactions, and valuations (JSON or CSV); import of backup data with validation and all-or-nothing apply; and recording of access events (login attempts) and change events (critical data changes). It **reads** Account, Transaction, Valuation (portfolio-core) and **writes** AccessLog, AuditLog. Export produces plaintext backup (decrypted at export boundary); import consumes the same format and re-encrypts with current session key. Ownership: **export format**, **import validation**, **access and change log lifecycle**.

## Domain Entities


| Entity       | Properties                                                                 | Business Rules                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **AccessLog** | id, action, ipAddress, success, timestamp                                 | One row per login attempt; action e.g. "login"; success boolean; IP from request; retention 90 days (purge older).                            |
| **AuditLog**  | id, entityType, entityId, action, oldValue?, newValue?, timestamp         | One row per critical change; entityType ∈ { account, transaction, valuation }; action ∈ { created, updated, deleted }; old/new for audit trail; sensitive values redacted or hashed if stored. |


## Value Objects


| Value Object     | Properties                    | Constraints                                                                 |
| ---------------- | ----------------------------- | --------------------------------------------------------------------------- |
| **ExportFormat** | format: "json" \| "csv"       | Requested output type.                                                       |
| **ExportSnapshot** | accounts, transactions, valuations, exportedAt, schemaVersion | Serializable snapshot; exportedAt ISO timestamp; schemaVersion for compatibility. |
| **ImportPayload** | accounts?, transactions?, valuations?, schemaVersion? | Validated input; must match expected schema version or migration path.      |


## Aggregates


| Aggregate Root | Members     | Invariants                                                                 |
| -------------- | ----------- | -------------------------------------------------------------------------- |
| **AccessLog**  | AccessLog   | Append-only; no update/delete of existing rows; purge by age only.        |
| **AuditLog**   | AuditLog    | Append-only; no update/delete of existing rows.                            |


## Domain Events


| Event           | Trigger                    | Payload                                                                 |
| --------------- | -------------------------- | ----------------------------------------------------------------------- |
| **DataExported**| Export completed           | format, recordCounts, exportedAt                                        |
| **DataImported**| Import completed           | recordCounts, importedAt                                                |
| **AccessLogged**| Login attempt recorded     | action, success, timestamp                                              |
| **ChangeLogged**| Critical change recorded   | entityType, entityId, action, timestamp                                  |


## Domain Services


| Service         | Operations                                                                 | Dependencies                                                                 |
| --------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **DataExporter**| export(format) → ExportSnapshot (JSON) or ZIP of CSVs                      | Read: Account, Transaction, Valuation (portfolio-core); decrypt sensitive fields using session key before including in snapshot. |
| **DataImporter**| import(payload) → success \| validationError                                | Validate schema version and structure; apply in single DB transaction; write Account, Transaction, Valuation; re-encrypt sensitive fields with current session key. |
| **AccessLogger**| logAccess(action, success, ipAddress) → void                               | Write AccessLog.                                                             |
| **ChangeLogger**| logChange(entityType, entityId, action, oldValue?, newValue?) → void       | Write AuditLog; redact or hash sensitive fields in old/new if stored.        |


## Repository Interfaces


| Repository       | Entity      | Methods                                                                 |
| ---------------- | ----------- | ----------------------------------------------------------------------- |
| **AccountReader**| Account     | findAll() — from portfolio-core.                                        |
| **TransactionReader** | Transaction | findAll() or by account — from portfolio-core.                    |
| **ValuationReader**  | Valuation   | findAll() or by account — from portfolio-core.                    |
| **AccessLogRepo**| AccessLog   | create(action, ipAddress, success); findRecent(limit?, since?); purgeOlderThan(date). |
| **AuditLogRepo** | AuditLog    | create(entityType, entityId, action, oldValue?, newValue?); findRecent(limit?, since?). |


## Ubiquitous Language


| Term          | Definition                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| **Export**    | Full snapshot of accounts, transactions, valuations in JSON or CSV (ZIP); plaintext at rest in the file. |
| **Import**    | Restore from backup file; validate then apply in one transaction; re-encrypt with current key. |
| **Access log**| Record of login attempts (success/fail, IP, timestamp).                     |
| **Audit log** | Record of critical data changes (entity, action, old/new, timestamp).      |
| **Schema version** | Version identifier in export/import payload for forward compatibility. |


## Stories Covered by This Model

1 - **004-data-export**: DataExporter.export(format); JSON = single structure { accounts, transactions, valuations, metadata }; CSV = ZIP with accounts.csv, transactions.csv, valuations.csv; decrypt before export; include exportedAt and schemaVersion.
2 - **005-data-import**: DataImporter.import(payload); validate schema/structure; single transaction; re-encrypt with session key; conflict policy (merge/replace) as per design.
3 - **006-access-logs**: AccessLogger.logAccess on login (success/fail, IP); AuditLogRepo for change events; log critical changes (account create/delete, transaction delete, etc.); GET /api/v1/audit/access-logs and GET /api/v1/audit/change-logs for retrieval; purge access logs older than 90 days.

## Constraints from Prior Decisions

- ADR-001: Monetary amounts in paise in export/import payloads.
- 007-auth-security: Session key used to decrypt on export and re-encrypt on import.

## External Dependencies (Context)

- None beyond portfolio-core (read/write) and 007 session/encryption.
