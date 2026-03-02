---
stage: test
bolt: 005-llm-insights
created: 2026-03-02T23:45:00Z
---

# Test Report: 003-llm-insights (Bolt 005)

## Summary

| Suite | Tests | Passed | Failed | Coverage |
|-------|-------|--------|--------|----------|
| Unit (use cases + formatter) | 27 | 27 | 0 | — |
| Integration (API routes) | 16 | 16 | 0 | — |
| **Total (this bolt)** | **43** | **43** | **0** | — |

All 43 new tests pass. Pre-existing failures in unrelated test files (valuation-compute-mf-stock-market-config) are not caused by this bolt — confirmed by running those tests in isolation (17/17 pass) and verifying the failures existed before bolt 005.

---

## Test Files

### `tests/unit/insights.test.ts` — 27 tests

**Snapshot formatter helpers:**
- `paiseToINR`: paise → INR conversion, rounding
- `formatPercent`: decimal formatting, null → "N/A"
- `buildAccountSummary`: sort by value, cap at 5, overflow indicator
- `buildAllocationSummary`: sort by value, INR values in output, empty → "none"

**`generateSummary` use case:**
- Returns trimmed summary text and modelUsed from gateway
- Passes non-empty prompt containing ₹ symbol
- Propagates `LLMUnavailableError` from gateway

**`generateProjections` use case:**
- Throws `ProjectionsValidationError` for out-of-range horizon (0, 31)
- Throws `ProjectionsValidationError` for non-integer horizon (1.5)
- Parses valid JSON and returns all three scenario labels + narratives
- Strips markdown fences from LLM response before parsing
- Throws on invalid JSON
- Throws on missing scenario key
- Propagates `LLMUnavailableError`

**`analyzeRisk` use case:**
- Returns risk factors with correct severity/description/mitigation
- Accepts risk factor without mitigation field
- Throws on invalid severity value
- Throws when riskFactors array is missing
- Strips markdown fences before parsing
- Propagates `LLMUnavailableError`

---

### `tests/api/insights.test.ts` — 16 tests

**GET /api/v1/insights/summary:**
- 503 when `OPENAI_API_KEY` not set
- 400 for empty portfolio (no accounts)
- 200 with summary and modelUsed on success
- 503 when gateway throws `LLMUnavailableError`

**POST /api/v1/insights/projections:**
- 503 when `OPENAI_API_KEY` not set
- 400 for missing `timeHorizonYears`
- 400 for `timeHorizonYears = 0` (below min)
- 400 for `timeHorizonYears = 31` (above max)
- 400 for `timeHorizonYears = 5.5` (non-integer)
- 400 for empty portfolio
- 200 with all three scenarios (labels + narratives) on success
- 503 when gateway throws `LLMUnavailableError`

**GET /api/v1/insights/risk-analysis:**
- 503 when `OPENAI_API_KEY` not set
- 400 for empty portfolio
- 200 with risk factors array on success
- 503 when gateway throws `LLMUnavailableError`

---

## Acceptance Criteria Validation

### Story 001 — Generate Portfolio Narrative Summary

- ✅ `GET /api/v1/insights/summary` returns `{ summary: string, modelUsed?: string }`
- ✅ Prompt includes total value, P&L, allocation, and account list
- ✅ Returns 503 (graceful degradation) when API key missing or LLM unavailable
- ✅ Returns 400 when portfolio is empty

### Story 002 — Project Future Portfolio Values

- ✅ `POST /api/v1/insights/projections` accepts `{ timeHorizonYears: 1–30 }`
- ✅ Returns `{ optimistic, expected, conservative }` each with `label` + `narrative`
- ✅ Validates `timeHorizonYears` bounds (1–30, integer)
- ✅ Strips markdown fences from LLM response for robust parsing
- ✅ Returns 400 for invalid input; 503 for LLM unavailability

### Story 003 — Identify Portfolio Risk Factors

- ✅ `GET /api/v1/insights/risk-analysis` returns `{ riskFactors: RiskFactor[] }`
- ✅ Each factor has `severity` (high/medium/low), `description`, optional `mitigation`
- ✅ Validates severity values; throws on unrecognised values
- ✅ Returns 503 for LLM unavailability; 400 for empty portfolio

### Cross-cutting

- ✅ ADR-003: `OpenAIGateway` is the only place that imports `openai`; all use cases accept `LLMGatewayPort`
- ✅ ADR-001: All monetary values in paise internally; INR formatting only in prompt text
- ✅ ADR-002: Insights routes protected by existing iron-session middleware (no new auth logic added)
- ✅ No PII in prompts — only aggregate totals, allocation by type, account type + name
- ✅ `LLMUnavailableError` boundary: routes catch and return 503, use cases propagate cleanly

---

## Issues Found

None. All acceptance criteria met.

---

## Recommendations

- **Prompt template caching**: Templates are pure functions — no optimisation needed.
- **JSON parse robustness**: Projections and risk prompts explicitly request raw JSON; markdown-fence stripping is implemented as a safety net. Could add retry on parse failure in bolt 006.
- **Token usage tracking**: `tokensUsed` is not captured in this bolt (OpenAI SDK response includes it). Bolt 006 audit trail should persist this.
- **Model override**: `LLMCompletionOptions.model` field exists on the port — can be surfaced as a query param in bolt 006 if needed.
