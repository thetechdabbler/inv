---
## unit: 004-auth-security
bolt: 007-auth-security
stage: model
status: complete
updated: 2026-03-02T20:00:00Z

# Static Model - Auth & Security (Passphrase + Encryption)

## Bounded Context

**Authentication & Field Encryption**. This context owns first-time passphrase setup, passphrase verification, session creation, and application-layer encryption of sensitive financial fields. It **reads/writes** UserConfig (single record); it **derives** an encryption key from the passphrase via PBKDF2 and **encrypts/decrypts** values with AES-256-GCM. Ownership: **passphrase lifecycle**, **session**, **encryption key derivation**, **field cipher**. AccessLog and AuditLog are in bolt 008 (data export/import and access logs).

## Domain Entities


| Entity       | Properties                                                                 | Business Rules                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **UserConfig** | id, passphraseHash, keyDerivationSalt?, createdAt, updatedAt              | Single row per app; passphraseHash from bcrypt (cost 12); salt used for PBKDF2 to derive encryption key. Once setup, passphrase cannot be re-set without explicit “reset” flow (out of scope here). |


## Value Objects


| Value Object     | Properties                    | Constraints                                                                 |
| ---------------- | ----------------------------- | --------------------------------------------------------------------------- |
| **Passphrase**   | value: string (opaque)        | Min 8 characters at setup; never stored in plaintext; only hash persisted.  |
| **SessionToken** | opaque (e.g. iron-session)   | Created on successful verifyPassphrase; bound to cookie; expiry (e.g. 24h). |
| **Ciphertext**   | iv (bytes), tag (bytes), data | AES-256-GCM output; IV unique per encryption; tag for integrity.            |


## Aggregates


| Aggregate Root | Members     | Invariants                                                                 |
| -------------- | ----------- | -------------------------------------------------------------------------- |
| **UserConfig** | UserConfig  | At most one instance; passphraseHash and salt immutable after first set.  |


## Domain Events


| Event               | Trigger                          | Payload                                  |
| ------------------- | -------------------------------- | ---------------------------------------- |
| **PassphraseSet**   | First-time setup completed       | — (no sensitive data)                     |
| **SessionCreated**  | Passphrase verified successfully | sessionId (opaque)                        |
| **LoginFailed**     | Passphrase verification failed   | reason (e.g. wrong passphrase); for 008.  |


## Domain Services


| Service              | Operations                                                                 | Dependencies                                                                 |
| -------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **PassphraseSetup**  | setup(passphrase) → success | alreadyConfigured | validationError | Hash with bcrypt (cost 12); store hash + generate and store salt; derive key (PBKDF2) and store nothing else for key in DB — key derived at login. |
| **PassphraseVerify** | verify(passphrase) → session | invalidPassphrase | notConfigured | Compare with bcrypt; on success create session (iron-session); optionally derive and attach key to session for decryption. |
| **FieldEncryption**  | encrypt(plaintext, key) → ciphertext; decrypt(ciphertext, key) → plaintext | AES-256-GCM, random IV per encrypt; key from session (derived at login via PBKDF2 + stored salt). |


**Note**: Encryption key is derived at login (PBKDF2 + UserConfig.keyDerivationSalt) and held in session; not stored in DB. Sensitive fields (e.g. transaction amount, valuation value) encrypted before persist, decrypted on read when session has key.

## Repository Interfaces


| Repository        | Entity    | Methods                                                                 |
| ----------------- | --------- | ----------------------------------------------------------------------- |
| **UserConfigRepo**| UserConfig| get(): UserConfig | null; setPassphrase(hash, salt): void. Single row.                      |


## Ubiquitous Language


| Term            | Definition                                                                 |
| --------------- | -------------------------------------------------------------------------- |
| **Passphrase**  | User-chosen secret for access; hashed with bcrypt, never stored plain.     |
| **Session**     | Encrypted cookie (iron-session) proving recent authentication; expiry 24h.  |
| **Key derivation** | PBKDF2 with stored salt from passphrase → 256-bit key for AES-256-GCM. |
| **Field encryption** | Per-field AES-256-GCM; IV and auth tag stored with ciphertext.         |


## Stories Covered by This Model

1 - **001-passphrase-setup**: PassphraseSetup.setup(passphrase); validate min 8 chars; bcrypt hash (cost 12); store hash + salt in UserConfig; reject if already configured.
2 - **002-passphrase-login**: PassphraseVerify.verify(passphrase); on success create session (iron-session); protect /api/v1/* except /api/v1/auth/* via Next.js middleware.
3 - **003-field-encryption**: FieldEncryption.encrypt/decrypt; key from session (derived at login); apply to sensitive fields on write/read (transaction amounts, valuation values, account balances as per design).

## Constraints from Prior Decisions

- bcrypt cost factor: 12.
- AES-256-GCM with random IV per operation.
- PBKDF2 with stored salt for key derivation; key not persisted.
- iron-session for encrypted cookie-based sessions.

## External Dependencies (Context)

- None (Node.js crypto and bcrypt/iron-session only).
