---
id: 003-field-encryption
unit: 004-auth-security
intent: 001-investment-tracker
status: complete
priority: should
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 007-auth-security
implemented: true
---

# Story: 003-field-encryption

## User Story

**As a** user
**I want** sensitive financial fields to be encrypted at rest
**So that** even if the database file is accessed, my data remains protected

## Acceptance Criteria

- [ ] **Given** a transaction amount or account balance is stored, **When** persisted to SQLite, **Then** the value is encrypted with AES-256-GCM
- [ ] **Given** encrypted data is read, **When** served via API, **Then** it is decrypted transparently
- [ ] **Given** the encryption key is derived from the user's passphrase, **When** the passphrase is verified at login, **Then** the key is available for the session

## Technical Notes

- Use Node.js crypto: AES-256-GCM with random IV per operation
- Derive key from passphrase using PBKDF2 (salt stored in UserConfig)
- Encrypted fields: transaction amounts, valuation values, account balances
- Implement as Prisma middleware or custom getter/setter

## Dependencies

### Requires
- 001-passphrase-setup (key derivation from passphrase)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Passphrase changed | Re-encrypt all fields with new key |
| Corrupted ciphertext | Return decryption error, log issue |
| Performance with many records | Batch decrypt, cache in memory during session |

## Out of Scope

- Full database encryption (SQLCipher)
- Key rotation without passphrase change
