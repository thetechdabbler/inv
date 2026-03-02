---
last_updated: 2026-03-02T21:15:00Z
total_decisions: 2
---

# Decision Index

This index tracks all Architecture Decision Records (ADRs) created during Construction bolts.
Use this to find relevant prior decisions when working on related features.

## How to Use

**For Agents**: Scan the "Read when" fields below to identify decisions relevant to your current task. Before implementing new features, check if existing ADRs constrain or guide your approach. Load the full ADR for matching entries.

**For Humans**: Browse decisions chronologically or search for keywords. Each entry links to the full ADR with complete context, alternatives considered, and consequences.

---

## Decisions

### ADR-001: Store All Monetary Amounts as Integer Paise (INR)
- **Status**: accepted
- **Date**: 2026-03-02
- **Bolt**: 001-portfolio-core (001-portfolio-core)
- **Path**: `bolts/001-portfolio-core/adr-001-integer-paise-monetary-amounts.md`
- **Summary**: The investment tracker needs a consistent, precise representation for money in INR. All monetary amounts are stored and transmitted as non-negative integers in paise (1 INR = 100 paise), with display conversion only at the presentation layer.
- **Read when**: Working on accounts, transactions, valuations, performance calculations, API request/response schemas, or any feature that handles money; when choosing types for monetary fields or adding new endpoints that accept or return amounts.

### ADR-002: Passphrase-Based Authentication with Iron-Session (No JWT/OAuth)
- **Status**: accepted
- **Date**: 2026-03-02
- **Bolt**: 007-auth-security (004-auth-security)
- **Path**: `bolts/007-auth-security/adr-002-passphrase-auth-iron-session.md`
- **Summary**: For the single-user investment tracker, authentication is passphrase-based with no JWT or OAuth. The passphrase is stored only as a bcrypt hash; on successful login the server issues an encrypted cookie (iron-session) representing the session. Middleware allows /api/v1/auth/* without auth and requires a valid session for all other /api/v1/* routes.
- **Read when**: Working on authentication, session management, login/setup flows, middleware for protected routes, or considering JWT/OAuth/multi-user auth.
