---
unit: 004-auth-security
intent: 001-investment-tracker
phase: inception
status: complete
created: 2026-03-02T10:25:00.000Z
updated: 2026-03-02T10:25:00.000Z
---

# Unit Brief: Auth & Security

## Purpose

Authentication and data security service providing passphrase-based access control, application-layer encryption for sensitive fields, data export/import for backups, and access logging for audit purposes.

## Scope

### In Scope
- Passphrase setup on first use
- Passphrase verification for session access
- AES-256 encryption/decryption for sensitive financial fields
- JSON and CSV data export
- JSON and CSV data import for backup restoration
- Access and change audit logging

### Out of Scope
- Multi-user registration and management
- OAuth/social login
- Role-based access control
- Database-level encryption (SQLCipher)
- UI components for auth (investment-tracker-ui)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-6 | Security and Data Management | Should |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| UserConfig | Single user configuration | id, passphraseHash, encryptionKey, createdAt |
| AccessLog | Login and access record | id, action, ipAddress, success, timestamp |
| AuditLog | Critical data change record | id, entityType, entityId, action, oldValue, newValue, timestamp |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| setupPassphrase | Set passphrase on first use | passphrase | hashedPassphrase |
| verifyPassphrase | Authenticate user session | passphrase | session token / boolean |
| encryptField | Encrypt a sensitive value | plaintext, key | ciphertext |
| decryptField | Decrypt a sensitive value | ciphertext, key | plaintext |
| exportData | Export all data to JSON/CSV | format | file content |
| importData | Import data from JSON/CSV | file content, format | import result |
| logAccess | Record login attempt | action, success | AccessLog |
| logChange | Record critical data change | entity, action, old, new | AuditLog |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 6 |
| Must Have | 0 |
| Should Have | 6 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-passphrase-setup | Set passphrase on first use | Should | Planned |
| 002-passphrase-login | Verify passphrase for access | Should | Planned |
| 003-field-encryption | Encrypt sensitive financial fields | Should | Planned |
| 004-data-export | Export data in JSON/CSV | Should | Planned |
| 005-data-import | Import data from JSON/CSV | Should | Planned |
| 006-access-logs | Record login and change audit logs | Should | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| None | Independent — can be built in parallel with portfolio-core |

### Depended By
| Unit | Reason |
|------|--------|
| 005-investment-tracker-ui | Login screen, export/import UI |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| None | All crypto is built-in Node.js | — |

---

## Technical Context

### Suggested Technology
- bcrypt for passphrase hashing (cost factor 12)
- Node.js crypto module for AES-256-GCM encryption
- iron-session or JWT for session management
- Next.js API routes under `/api/v1/auth`, `/api/v1/backup`

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| Frontend UI | API | REST (Next.js API routes) |
| All other units | Middleware | Next.js middleware for auth check |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| UserConfig | SQL (SQLite) | 1 record | Permanent |
| AccessLogs | SQL (SQLite) | ~10K records | 90 days |
| AuditLogs | SQL (SQLite) | ~50K records | Permanent |

---

## Constraints

- Single user only — no registration flow
- Passphrase must be hashed with bcrypt (cost factor 12)
- AES-256-GCM with unique IV per encryption operation
- Encryption key derived from passphrase via PBKDF2
- Export must include all accounts, transactions, valuations
- Import must validate data integrity before applying

---

## Success Criteria

### Functional
- [ ] Passphrase can be set on first use
- [ ] Subsequent access requires correct passphrase
- [ ] Sensitive fields encrypted at rest, decrypted on read
- [ ] Full data export in JSON and CSV formats
- [ ] Data import restores from JSON/CSV backup
- [ ] Login attempts and critical changes logged

### Non-Functional
- [ ] Passphrase verification < 500ms
- [ ] Encryption/decryption adds < 10ms per field
- [ ] Export handles 100K+ records without timeout

### Quality
- [ ] Bcrypt hash verified against known test vectors
- [ ] Encryption round-trip tests pass
- [ ] Code coverage > 60%

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 007-auth-security | DDD | 001–003 | Authentication and encryption |
| 008-auth-security | DDD | 004–006 | Data management and audit logging |

---

## Notes

- Encryption key management is critical — losing the passphrase means losing encrypted data
- Consider a passphrase recovery mechanism (security questions or recovery key)
- Export format should be well-documented for interoperability
