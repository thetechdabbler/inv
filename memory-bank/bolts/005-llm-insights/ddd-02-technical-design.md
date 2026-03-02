---
stage: design
bolt: 005-llm-insights
created: 2026-03-02T22:35:00Z
---

# Technical Design: 003-llm-insights (Bolt 005)

## Architecture Pattern

**Layered + Hexagonal (ports & adapters) for the LLM boundary.** Application layer orchestrates domain services; infrastructure implements the LLM port (OpenAI client). Portfolio data is obtained via an inbound port (portfolio-core) rather than direct DB access. Rationale: clear separation so LLM provider can be swapped or mocked; prompt templates and snapshot assembly stay in application/domain; external API call isolated in infrastructure.

---

## Layer Structure

```text
┌─────────────────────────────────────────────────────────────┐
│  Presentation (Next.js API routes)                          │
│  GET /insights/summary, POST /insights/projections,         │
│  GET /insights/risk-analysis                                │
├─────────────────────────────────────────────────────────────┤
│  Application (use cases)                                    │
│  GenerateSummary, GenerateProjections, AnalyzeRisk          │
│  Snapshot assembly, prompt fill, response parsing           │
├─────────────────────────────────────────────────────────────┤
│  Domain                                                      │
│  PortfolioSnapshot (value), InsightResult, RiskFactor,      │
│  ProjectionScenario, prompt types                           │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                              │
│  OpenAI client (LLM port impl), prompt template loader      │
│  (file or in-memory)                                        │
└─────────────────────────────────────────────────────────────┘
```

- **Presentation**: Next.js route handlers under `/api/v1/insights/*`. Parse query/body, call application use case, return JSON or 4xx/5xx with consistent error shape.
- **Application**: Use cases call portfolio snapshot provider (inbound), load prompt template, build prompt, call LLM port, parse response into DTOs. No HTTP or DB here.
- **Domain**: Types and value objects for snapshot, results, risk factors, scenarios. No I/O.
- **Infrastructure**: OpenAI SDK wrapper (implements LLM port), optional prompt template repository (files under `prompts/` or config).

---

## API Design

1 - **GET /api/v1/insights/summary**  
   - Request: none (session/auth via existing middleware; snapshot from server state).  
   - Response 200: `{ summary: string, modelUsed?: string }`.  
   - Response 503: `{ code: "SERVICE_UNAVAILABLE", message: string }` when API key missing or OpenAI errors.  
   - Response 400: empty portfolio → `{ code: "VALIDATION_ERROR", message: "Add accounts first" }` (or similar).

2 - **POST /api/v1/insights/projections**  
   - Request body: `{ timeHorizonYears: number }` (required, integer 1–30).  
   - Response 200: `{ optimistic: { valuePaise?: number, narrative: string }, expected: { ... }, conservative: { ... } }` (or narrative-only if structured values not requested).  
   - Response 400: invalid or missing timeHorizonYears.  
   - Response 503: LLM unavailable.

3 - **GET /api/v1/insights/risk-analysis**  
   - Request: none.  
   - Response 200: `{ riskFactors: Array<{ severity: "high"|"medium"|"low", description: string, mitigation?: string }> }`.  
   - Response 503: LLM unavailable.

All responses use existing API conventions (JSON, `code` + `message` for errors). Monetary values in paise (ADR-001).

---

## Data Model

- **This bolt**: No new database tables. Prompt templates are stored as files (e.g. `prompts/summary.txt`, `prompts/projections.txt`, `prompts/risk.txt`) or in-memory config; no migration.
- **Bolt 006**: Will add LLM audit (query/response logging) and any persistence for templates if needed; out of scope for this design.

---

## Security Design

1 - **API key**: OPENAI_API_KEY from environment; never logged or exposed. If missing, endpoints return 503 with a generic message (e.g. "Insights temporarily unavailable").
2 - **No PII to LLM**: Only aggregate portfolio data (totals, allocation by type, account types and counts). No names, identifiers, or free-text that could contain PII.
3 - **Auth**: Insights routes sit under `/api/v1/*`; existing middleware requires valid session (same as other protected routes).
4 - **Input validation**: timeHorizonYears bounded (e.g. 1–30); no raw user text in prompts in this bolt (NL query in 006).

---

## NFR Implementation

1 - **Latency (2–15s)**: Timeout on OpenAI client (e.g. 15s); return 503 on timeout or upstream error. Frontend already expected to show loading states (unit brief).
2 - **Graceful degradation**: If OPENAI_API_KEY is absent or invalid, return 503 with message; no crash. Empty portfolio returns 400 with guidance.
3 - **Token optimization**: Snapshot summarized before prompt build: round amounts, cap account list or aggregate by type, minimal fields. Reduces cost and avoids token limit errors.
4 - **Model choice**: GPT-4o-mini for summary and risk; same or configurable for projections. Kept in application config or env for easy change.

---

## Integration Points

1 - **Portfolio-core (inbound)**: Application calls a provider (e.g. getPortfolioPerformance + listAccounts or a dedicated getSnapshotForInsights()) to obtain current totals, allocation, and per-account summary. Returns value objects matching domain (amounts in paise).
2 - **OpenAI API (outbound)**: Infrastructure implements LLM port; single method `complete(messages, options)` → `{ text, model, tokensUsed }` or throws. Uses official OpenAI Node SDK; API key from env.
3 - **Frontend**: Consumes GET/POST above via existing auth; no new auth mechanism.

---

## Completion Criteria (Stage 2)

- [x] Architecture pattern selected and documented
- [x] Layers designed with responsibilities
- [x] API contracts defined for summary, projections, risk-analysis
- [x] Data persistence clarified (none for this bolt; templates as files/config)
- [x] Security and NFRs addressed
- [x] Integration points documented
