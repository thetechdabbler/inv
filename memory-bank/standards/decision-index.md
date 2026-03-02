---
last_updated: 2026-03-03T00:15:00Z
total_decisions: 4
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

### ADR-004: Decorator Pattern for Transparent LLM Audit Logging
- **Status**: accepted
- **Date**: 2026-03-03
- **Bolt**: 006-llm-insights (003-llm-insights)
- **Path**: `bolts/006-llm-insights/adr-004-auditing-llm-gateway-decorator.md`
- **Summary**: All LLM calls must be logged to the audit trail (LLMQuery + LLMResponse). Rather than adding logging inside each use case, an `AuditingLLMGateway` decorator wraps any `LLMGatewayPort` implementation, intercepting every `complete()` call to write audit records — including failures — before returning.
- **Read when**: Adding a new insight type or route that calls the LLM gateway; debugging missing audit trail entries; instantiating `LLMGatewayPort` in any route handler; considering changes to the audit logging approach.

### ADR-003: Use OpenAI Node SDK Behind a Hexagonal LLM Port
- **Status**: accepted
- **Date**: 2026-03-02
- **Bolt**: 005-llm-insights (003-llm-insights)
- **Path**: `bolts/005-llm-insights/adr-003-openai-sdk-llm-provider.md`
- **Summary**: The LLM Insights unit requires an AI provider for portfolio summaries, projections, and risk analysis. The `openai` Node SDK is used as the concrete implementation behind an `LLMGateway` port (hexagonal pattern); GPT-4o-mini is the default model tier for cost efficiency, with GPT-4o available as a configurable override.
- **Read when**: Working on LLM/AI integration, adding new insight types, swapping AI providers, configuring model tiers, or building features that call the LLMGateway port.

### ADR-002: Passphrase-Based Authentication with Iron-Session (No JWT/OAuth)
- **Status**: accepted
- **Date**: 2026-03-02
- **Bolt**: 007-auth-security (004-auth-security)
- **Path**: `bolts/007-auth-security/adr-002-passphrase-auth-iron-session.md`
- **Summary**: For the single-user investment tracker, authentication is passphrase-based with no JWT or OAuth. The passphrase is stored only as a bcrypt hash; on successful login the server issues an encrypted cookie (iron-session) representing the session. Middleware allows /api/v1/auth/* without auth and requires a valid session for all other /api/v1/* routes.
- **Read when**: Working on authentication, session management, login/setup flows, middleware for protected routes, or considering JWT/OAuth/multi-user auth.
