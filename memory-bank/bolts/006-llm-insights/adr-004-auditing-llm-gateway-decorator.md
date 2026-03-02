---
bolt: 006-llm-insights
created: 2026-03-03T00:15:00Z
status: accepted
superseded_by: null
---

# ADR-004: Decorator Pattern for Transparent LLM Audit Logging

## Context

Bolt 006 requires every LLM call — across all five insight types (summary, projections, risk, rebalancing, NL query) — to be logged to the audit trail (LLMQuery + LLMResponse tables). The existing bolt 005 use cases (`generateSummary`, `generateProjections`, `analyzeRisk`) already accept `LLMGatewayPort` as a parameter. Two approaches exist: (1) add audit logging calls inside each use case, or (2) intercept at the gateway boundary using a decorator. The project has three existing use cases and will add two more; every future insight type will need the same logging.

## Decision

Implement audit logging as an `AuditingLLMGateway` class that implements `LLMGatewayPort` and wraps any other `LLMGatewayPort` implementation (GoF Decorator pattern). Route handlers instantiate `new AuditingLLMGateway(new OpenAIGateway(), auditService)` and pass it to use cases. Use cases remain unaware of auditing.

The `insightType` label (for the audit record) is passed as an optional field on `LLMCompletionOptions` — the only interface change needed.

## Rationale

Adding audit calls inside each use case violates the Single Responsibility Principle and creates a maintenance burden: every new insight type must remember to log, and a missing log call causes silent audit gaps. The decorator centralises the cross-cutting concern at the infrastructure boundary — the only place where `LLMGatewayPort.complete()` is called. It also guarantees failure logging: when the inner gateway throws `LLMUnavailableError`, the decorator catches it, writes `LLMResponse(success=false)`, then re-throws — no audit gap even on errors.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Audit calls inside each use case | Explicit, easy to trace | Duplicated in every use case; easy to forget in new ones; mixes domain logic with infrastructure | Maintenance burden scales with insight count |
| Middleware / Next.js request interceptor | Centralised at HTTP layer | Can't easily capture the prompt text or token count; too far from the LLM call | Insufficient access to LLM call internals |
| Event-driven (emit event after each call) | Decoupled | Requires event bus infrastructure not present in this project | Over-engineered for a single-user app |
| Direct `OpenAIGateway` subclass | Simple | Ties audit logic to a specific provider; breaks port abstraction (ADR-003) | Violates the hexagonal port boundary |

## Consequences

### Positive

- Zero changes to bolt 005 use cases to enable audit logging — one-line swap at route handler level.
- Every future insight type is automatically audited by passing `AuditingLLMGateway`.
- Failure logging is guaranteed — the decorator catches and logs before re-throwing.
- Provider-agnostic: works with any `LLMGatewayPort` implementation (OpenAI today, any other tomorrow).

### Negative

- `insightType` added to `LLMCompletionOptions` is a minor interface extension; callers that don't set it will log with a fallback type (`"unknown"`).
- Adds one more class to the call chain; stack traces are one frame deeper.

### Risks

- **Silent bypass**: A developer who directly instantiates `OpenAIGateway` instead of `AuditingLLMGateway` in a route will silently skip audit logging. Mitigated by this ADR and code review convention — all route handlers must use the auditing wrapper.

## Related

- **Stories**: 006-llm-audit-trail (primary), 004-rebalancing-recommendations, 005-natural-language-query
- **Standards**: Consider documenting in coding-standards.md: "All LLM gateway instantiation in route handlers must use AuditingLLMGateway"
- **Previous ADRs**: ADR-003 (OpenAI SDK behind LLMGatewayPort — this ADR depends on and extends that boundary)
