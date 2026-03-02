---
bolt: 007-auth-security
created: 2026-03-02T21:15:00Z
status: accepted
superseded_by: null
---

# ADR-002: Passphrase-Based Authentication with Iron-Session (No JWT/OAuth)

## Context

The investment tracker is a single-user application with no registration or multi-tenant model. The tech stack previously had "Authentication: TBD". We need a concrete auth strategy that: (1) protects the app with a single secret (passphrase), (2) works with Next.js API routes and future UI, (3) avoids external identity providers and heavy session storage, and (4) fits the constraint that there is exactly one "user" (the device owner). Session state must survive browser refresh and be secure (no plaintext secrets in cookies).

## Decision

**Use passphrase-based authentication with an encrypted cookie session (iron-session).** The user sets a passphrase on first use (stored only as a bcrypt hash). Subsequent access requires entering the same passphrase; on success, the server creates a cryptographically signed and encrypted cookie (via iron-session) that represents an authenticated session. No JWT, no OAuth, no database-backed session table. Next.js middleware allows `/api/v1/auth/*` unauthenticated; all other `/api/v1/*` routes require a valid session cookie.

## Rationale

- **Single user**: No need for user IDs, roles, or token claims; a single "is authenticated" signal is enough. Passphrase + one cookie is the minimal model.
- **No external deps**: No OAuth provider, no auth-as-a-service; reduces integration and failure modes. bcrypt and iron-session are well-understood, npm-only dependencies.
- **Session in cookie**: iron-session stores session data (e.g. derived encryption key or session id) inside an encrypted cookie. No server-side session store to scale or back up; stateless from the server’s perspective aside from the cookie.
- **Next.js fit**: Middleware can read the cookie and return 401 for protected routes; API routes and UI can rely on the same session. Aligns with file-based routing and serverless-friendly deployment.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| JWT in cookie or header | Stateless; easy to add claims later | Overkill for single-user; need to handle refresh/revocation; key in session still needed for field decryption | Simpler to keep one server-signed cookie and derive key at login |
| OAuth / social login | Familiar; no password to remember | Multi-user oriented; external dependency; doesn’t provide a single passphrase for local encryption key derivation | Out of scope for single-owner app |
| Session in database | Full control; easy to invalidate all sessions | Extra table and lookup per request; more moving parts | iron-session is sufficient and keeps server stateless |
| No session (passphrase every request) | No session state | Poor UX; passphrase in memory/network repeatedly | Unacceptable for normal use |

## Consequences

### Positive

- Clear, minimal auth model for the codebase and for future agents (auth is "passphrase + iron-session cookie").
- Tech stack "Authentication" can be updated from TBD to "Passphrase + iron-session (single user)".
- Protects all `/api/v1/*` except auth routes with one middleware pattern; easy to reason about.

### Negative

- If we later add multi-user or SSO, we will need a new auth strategy and likely a new ADR (this one would be superseded or refined).
- Session revocation is "change passphrase" or "clear cookie"; no per-session revoke without adding server-side state.

### Risks

- **Risk**: Cookie theft or replay.  
  **Mitigation**: iron-session uses encryption and signing; httpOnly and secure flags reduce XSS and MITM. Passphrase never sent after initial setup/login.
- **Risk**: Losing the passphrase means losing access and (with field encryption) losing decryption of data.  
  **Mitigation**: Document in user-facing flow; recovery/backup is out of scope for this ADR but may be addressed in a later bolt or product decision.

## Related

- **Stories**: 001-passphrase-setup, 002-passphrase-login (007-auth-security).
- **Standards**: Tech-stack "Authentication" should be updated to reflect this decision.
- **Previous ADRs**: None (auth-specific).
