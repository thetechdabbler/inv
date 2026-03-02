---
stage: design
bolt: 006-llm-insights
created: 2026-03-03T00:00:00Z
---

# Technical Design: 003-llm-insights (Bolt 006)

## Architecture Pattern

**Same layered + hexagonal pattern as bolt 005**, extended with a persistence layer for the audit trail and a decorator around `LLMGatewayPort`. The `AuditingLLMGateway` decorator sits between route handlers and `OpenAIGateway`, transparently intercepting every `complete()` call to write `LLMQuery` + `LLMResponse` records. No use case changes required in bolt 005.

---

## Layer Structure

```text
┌─────────────────────────────────────────────────────────────┐
│  Presentation (Next.js API routes)                          │
│  POST /insights/rebalancing, POST /insights/query,          │
│  GET  /insights/history                                     │
├─────────────────────────────────────────────────────────────┤
│  Application (use cases)                                    │
│  RecommendRebalancing, ProcessNLQuery                       │
│  (AuditingLLMGateway wraps gateway transparently)           │
├─────────────────────────────────────────────────────────────┤
│  Domain                                                     │
│  LLMQuery, LLMResponse, RebalancingAction,                  │
│  AllocationPercentage, InsightType (extended)               │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                             │
│  AuditingLLMGateway (decorator), Prisma LLM repos,         │
│  OpenAIGateway (bolt 005, unchanged)                        │
└─────────────────────────────────────────────────────────────┘
```

- **Presentation**: Route handlers instantiate `AuditingLLMGateway(new OpenAIGateway(), auditService)` and pass it to use cases. The history route queries `LLMQueryRepository` directly.
- **Application**: `RecommendRebalancing` and `ProcessNLQuery` use cases accept `LLMGatewayPort`; they are unaware of auditing.
- **Domain**: New types for rebalancing actions, audit records, extended `InsightType`.
- **Infrastructure**: `AuditingLLMGateway` wraps the port; Prisma repositories for `LLMQuery` / `LLMResponse`.

---

## API Design

1 - **POST /api/v1/insights/rebalancing**
- Request body: `{ targetAllocation?: Record<string, number> }` — optional map of account type to fraction (0–1), must sum to 1.0 if provided.
- Response 200: `{ actions: Array<{ accountType: string, action: "increase"|"decrease"|"maintain", suggestion: string }>, narrative: string, modelUsed?: string }`.
- Response 400: missing/invalid targetAllocation (doesn't sum to 1.0, negative values).
- Response 400: empty portfolio.
- Response 503: LLM unavailable.

2 - **POST /api/v1/insights/query**
- Request body: `{ question: string }` — required, non-empty.
- Response 200: `{ answer: string, modelUsed?: string }`.
- Response 400: empty or missing question.
- Response 400: empty portfolio.
- Response 503: LLM unavailable.

3 - **GET /api/v1/insights/history**
- Query params: `limit` (default 20, max 100), `offset` (default 0).
- Response 200: `{ interactions: Array<{ id: string, insightType: string, prompt: string, response: string, modelUsed: string, tokensUsed: number|null, success: boolean, errorMessage: string|null, createdAt: string }>, total: number }`.
- No 400/503 — pure DB read, no LLM dependency.

---

## Data Model

### New Prisma models (migration required)

```prisma
model LLMQuery {
  id           String       @id @default(cuid())
  insightType  String       @map("insight_type") // summary|projections|risk|rebalancing|query
  prompt       String       // full prompt text
  modelRequested String     @map("model_requested")
  createdAt    DateTime     @default(now()) @map("created_at")
  response     LLMResponse?

  @@index([insightType])
  @@index([createdAt])
  @@map("llm_queries")
}

model LLMResponse {
  id           String    @id @default(cuid())
  queryId      String    @unique @map("query_id")
  responseText String    @map("response_text")
  modelUsed    String    @map("model_used")
  tokensUsed   Int?      @map("tokens_used")
  success      Boolean
  errorMessage String?   @map("error_message")
  createdAt    DateTime  @default(now()) @map("created_at")
  query        LLMQuery  @relation(fields: [queryId], references: [id], onDelete: Cascade)

  @@index([queryId])
  @@map("llm_responses")
}
```

One `LLMQuery` → one `LLMResponse` (1:1, always created as a pair).

---

## Security Design

1 - **API key**: Same as bolt 005 — `OPENAI_API_KEY` from env; routes check and return 503 if absent.
2 - **Prompt content**: No PII in rebalancing or NL query prompts — only aggregate allocation data and question text. NL question is user-free-text but is not sent to any external identity-linked service (the user is the only user of this single-user app).
3 - **Auth**: All three new routes under `/api/v1/*` — protected by existing iron-session middleware (ADR-002).
4 - **Audit data**: Stored in SQLite, accessible only via authenticated API. No endpoint to export raw audit logs in this bolt.
5 - **Input bounds**: question max length 1000 chars; targetAllocation max 10 keys.

---

## NFR Implementation

1 - **Latency**: Same as bolt 005 — 15s timeout on OpenAI calls; 503 on timeout.
2 - **Audit write performance**: Prisma writes are async; `LLMQuery` is written before the LLM call (to get the ID), `LLMResponse` after. SQLite write latency is negligible for this scale (~1K records).
3 - **History pagination**: `limit` + `offset` at DB level; default 20 rows. Avoids loading all records into memory.
4 - **Token tracking**: `tokensUsed` captured from OpenAI response metadata and persisted in `LLMResponse`. The `AuditingLLMGateway` extracts this from the raw gateway response.
5 - **Failure logging**: If the LLM call throws `LLMUnavailableError`, the gateway decorator still writes `LLMResponse` with `success=false` and the error message before re-throwing — ensuring no gaps in the audit trail.

---

## Integration Points

1 - **Portfolio-core (inbound)**: Same `buildPortfolioSnapshot()` as bolt 005 — rebalancing and NL query both need the current snapshot.
2 - **OpenAI API (outbound)**: Via `AuditingLLMGateway → OpenAIGateway` chain. No direct OpenAI imports in new use cases.
3 - **SQLite (new)**: Two new tables via Prisma migration. `AuditingLLMGateway` writes to both. History route reads from `LLMQuery` + `LLMResponse` join.
4 - **Bolt 005 routes (retrofit)**: After bolt 006, the summary/projections/risk routes can optionally swap in `AuditingLLMGateway` to capture their interactions in the audit trail too. This is a one-line change per route handler.

---

## AuditingLLMGateway Design

```text
AuditingLLMGateway implements LLMGatewayPort
  constructor(inner: LLMGatewayPort, auditRepo: LLMAuditService)

  async complete(prompt, options?):
    1. Write LLMQuery record (insightType from options.insightType)
    2. Try inner.complete(prompt, options)
       - On success: write LLMResponse(success=true, text, model, tokens)
       - On LLMUnavailableError: write LLMResponse(success=false, error) then re-throw
    3. Return LLMResponse text
```

`insightType` is passed as an extension on `LLMCompletionOptions` (add optional `insightType?: InsightType` field).

---

## Completion Criteria

- [x] Architecture pattern selected and documented
- [x] Layers designed with responsibilities
- [x] API contracts defined for all 3 new endpoints
- [x] Database schema designed (LLMQuery, LLMResponse models)
- [x] Security and NFRs addressed
- [x] Integration points documented
- [x] AuditingLLMGateway decorator design specified
