---
unit: 004-auth-security
bolt: 007-auth-security
stage: design
status: complete
updated: 2026-03-02T21:00:00Z
---

# Technical Design - Auth & Security (Bolt 007: Passphrase + Encryption)

## Architecture Pattern

**Layered / Clean-style**. Next.js API routes under `/api/v1/auth` as presentation; application use cases (setup, verify, encrypt/decrypt orchestration) call domain services and UserConfig repository; domain holds PassphraseSetup, PassphraseVerify, and FieldEncryption semantics; infrastructure implements bcrypt, Node crypto (AES-256-GCM, PBKDF2), iron-session, and Prisma UserConfig persistence. Dependencies point inward. Middleware at the edge protects all `/api/v1/*` except `/api/v1/auth/*`.

## Layer Structure

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Presentation                                                                │
│  POST /api/v1/auth/setup, POST /api/v1/auth/login                            │
│  Next.js middleware: allow /api/v1/auth/*; require session for rest of /api/v1│
├─────────────────────────────────────────────────────────────────────────────┤
│  Application (Use Cases)                                                     │
│  SetupPassphrase, VerifyPassphrase — validate, call domain, persist/session  │
│  Field encryption: call encrypt before repo write, decrypt after repo read   │
│  (key from session; session populated at login)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Domain                                                                      │
│  PassphraseSetup, PassphraseVerify, FieldEncryption (contracts / logic)       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Infrastructure                                                              │
│  UserConfigRepository (Prisma); bcrypt; crypto (PBKDF2, AES-256-GCM);         │
│  iron-session (encrypted cookie); Next.js middleware                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## API Design

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/v1/auth/setup` | POST | `{ passphrase: string }` — min 8 chars | 200 + `{ ok: true }`; 400 validation (too short); 409 `{ code: "ALREADY_CONFIGURED" }` if UserConfig already has passphrase |
| `/api/v1/auth/login` | POST | `{ passphrase: string }` | 200 + `{ ok: true }` (Set-Cookie session); 401 `{ code: "INVALID_PASSPHRASE" }`; 404 `{ code: "NOT_CONFIGURED" }` if no UserConfig |
| `/api/v1/auth/status` | GET | — | 200 + `{ configured: boolean, authenticated?: boolean }` — for UI to decide setup vs login vs authenticated |

All amounts elsewhere (accounts, transactions, valuations) remain in **paise** (ADR-001). Encryption is applied to the stored representation of sensitive numeric fields; API request/response bodies still use paise.

## Data Persistence

| Table | Columns | Relationships |
|-------|---------|---------------|
| **user_config** | id (cuid), passphraseHash (string), keyDerivationSalt (string, nullable), createdAt, updatedAt | Single row per app (singleton). Salt required once passphrase is set; used for PBKDF2 at login. |

No separate session table; session is encrypted cookie (iron-session) holding opaque session data (e.g. derived key or session id). Key is not persisted in DB.

**Encrypted field storage (003-field-encryption):** Sensitive fields (e.g. transaction amountPaise, valuation valuePaise, account initialBalancePaise) may be stored as ciphertext in the same table: store `iv (base64) + tag (base64) + ciphertext (base64)` in a single column or split columns; or use a dedicated ciphertext column per entity. Design choice: one column per sensitive field holding base64(IV \|\| authTag \|\| ciphertext) or three columns (iv, tag, data). Decrypt on read when session has key; encrypt on write. Entities without a valid session key cannot decrypt (read path returns null or 401 depending on API).

## Security Design

| Concern | Approach |
|---------|----------|
| Passphrase storage | bcrypt hash only (cost 12); never store plaintext. |
| Key derivation | PBKDF2 with stored salt; 256-bit key for AES-256-GCM. Key derived at login and stored in encrypted session only. |
| Session | iron-session: encrypted, httpOnly, secure cookie; expiry e.g. 24h. |
| Route protection | Next.js middleware: allow `/api/v1/auth/*`; for all other `/api/v1/*` require valid session; return 401 if missing/invalid. |
| Field encryption | AES-256-GCM, random IV (12 bytes) per encrypt; 16-byte auth tag. Ciphertext = IV \|\| tag \|\| encrypted. |
| Input validation | Passphrase min length 8 at setup; reject empty or invalid JSON. |

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| Passphrase verification < 500ms | bcrypt compare is CPU-bound; cost 12 is acceptable; no external calls. |
| Encryption/decryption < 10ms per field | Node crypto AES-GCM is fast; per-request key from session; batch decrypt if many fields. |
| Single user | No user table; single UserConfig row; middleware does not distinguish users. |

## Error Handling

| Error Type | HTTP | Response Body |
|------------|------|----------------|
| Passphrase too short or missing | 400 | `{ code: "VALIDATION_ERROR", message: "Passphrase must be at least 8 characters" }` |
| Setup when already configured | 409 | `{ code: "ALREADY_CONFIGURED", message: "Passphrase already set" }` |
| Login with wrong passphrase | 401 | `{ code: "INVALID_PASSPHRASE", message: "Invalid passphrase" }` |
| Login when not configured | 404 | `{ code: "NOT_CONFIGURED", message: "Set up passphrase first" }` |
| Protected route without session | 401 | `{ code: "UNAUTHORIZED", message: "Authentication required" }` |
| Server error | 500 | `{ code: "INTERNAL_ERROR", message: "..." }` |

## External Dependencies

| Dependency | Purpose | Notes |
|------------|---------|--------|
| **bcrypt** (npm) | Hash and compare passphrase | Cost factor 12. |
| **iron-session** (npm) | Encrypted cookie session | Secret from env (SESSION_SECRET); expiry configurable. |
| **Node.js crypto** | PBKDF2, AES-256-GCM, randomBytes | No external service. |

## Implementation Notes (Stage 4)

1 - **UserConfig**: Prisma model `UserConfig` (id, passphraseHash, keyDerivationSalt, createdAt, updatedAt); singleton access (get the only row; create on first setup).
2 - **Auth routes**: `POST /api/v1/auth/setup` — validate length, check if config exists; if not, hash with bcrypt, generate salt, store hash + salt; return 200. `POST /api/v1/auth/login` — load UserConfig; if none return 404; compare passphrase with bcrypt; on success derive key (PBKDF2), create iron-session with key (or session id), set cookie, return 200.
3 - **Middleware**: Create `middleware.ts` at project root (or under `src` per Next.js convention). Match path `/api/v1/(.*)`. If path starts with `/api/v1/auth` allow; else check session; if missing or invalid return 401.
4 - **Field encryption (003)**: Provide `encryptField(plaintext: Buffer, key: Buffer): string` and `decryptField(ciphertext: string, key: Buffer): Buffer` using AES-256-GCM (12-byte IV, 16-byte tag). Store format: base64(IV \|\| tag \|\| ciphertext) or three columns. Apply in application layer when writing/reading Transaction.amountPaise, Valuation.valuePaise, Account.initialBalancePaise (or as decided for schema). Key from session; if no key (e.g. background job) either skip encryption for that flow or use a separate key strategy (out of scope for bolt 007).
5 - **Environment**: SESSION_SECRET (min 32 chars) for iron-session; no API keys required for auth itself.

## Stories Mapping

- **001-passphrase-setup**: POST /api/v1/auth/setup; UserConfig create; bcrypt + salt.
- **002-passphrase-login**: POST /api/v1/auth/login; bcrypt compare; iron-session; middleware for /api/v1/*.
- **003-field-encryption**: Encrypt/decrypt helpers; apply to sensitive fields on persist/load; key from session (derived at login).
