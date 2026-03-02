---
stage: model
bolt: 005-llm-insights
created: 2026-03-02T22:30:00Z
---

# Static Model: 003-llm-insights

## Bounded Context

**LLM Insights**: AI-powered analysis of the user's portfolio. This context consumes portfolio data (from portfolio-core), invokes an external LLM (OpenAI), and produces narrative summaries, future value projections, and risk analysis. It does not own portfolio data; it only reads aggregated/summarized data and returns generated text and structured insight payloads.

---

## Entities

1 - **InsightRequest**: Logical request for one of the insight types (summary, projections, risk). Properties: type (summary | projections | risk), portfolioSnapshot (reference or payload), optional timeHorizonYears (for projections). Business rule: type determines required inputs; projections require timeHorizonYears.

2 - **PortfolioSnapshot** (input from portfolio-core): Read-only view of portfolio at a point in time. Properties: accounts (id, type, name, currentValuePaise, totalContributionsPaise), totalValuePaise, totalContributionsPaise, netInvestedPaise, profitLossPaise, percentReturn, allocationByType. Business rule: must be summarized/token-optimized before sending to LLM; monetary amounts in paise (ADR-001).

3 - **InsightResult**: Outcome of an LLM insight call. Properties: type (summary | projections | risk), narrative or structured payload, modelUsed, tokensUsed (optional), createdAt. Business rule: success yields narrative/payload; failure yields error reason (e.g. API unavailable, key missing).

4 - **PromptTemplate**: Reusable prompt structure. Properties: type (summary, projections, risk), template (text with placeholders), requiredFields. Business rule: templates must not expose PII; only aggregate financial data.

---

## Value Objects

1 - **ProjectionScenario**: Immutable scenario result. Properties: label (optimistic | expected | conservative), valuePaise (or narrative), assumptions. Constraints: label is one of the three; value non-negative when numeric.

2 - **RiskFactor**: Single risk finding. Properties: severity (high | medium | low), description, mitigation. Constraints: severity required; description non-empty.

3 - **TimeHorizon**: Requested projection period. Properties: years (number). Constraints: positive integer; typically capped (e.g. 1–30) for sanity.

---

## Aggregates

1 - **InsightSession** (conceptual aggregate root for this bolt): Members: InsightRequest, PromptTemplate (by type), external LLM call, InsightResult. Invariants: one request produces one result (or explicit failure); portfolio snapshot is read-only and not modified by this context.

(No persistent aggregate root in this bolt; LLM audit trail and persistence of queries/responses are in bolt 006. This bolt focuses on request/response flow and prompt/result shaping.)

---

## Domain Events

1 - **InsightRequested**: Trigger — application requests summary, projections, or risk analysis. Payload: type, portfolioSnapshotRef or summary, optional timeHorizonYears.

2 - **InsightCompleted**: Trigger — LLM returns success. Payload: type, result (narrative or structured), modelUsed, tokensUsed.

3 - **InsightFailed**: Trigger — LLM or pre-check fails. Payload: type, reason (e.g. api_unavailable, key_missing, token_limit).

---

## Domain Services

1 - **PortfolioSummaryService**: Operations: generateSummary(portfolioSnapshot) → narrative text. Dependencies: PromptTemplate (summary), LLM gateway (OpenAI). Uses GPT-4o-mini; assembles snapshot per story (accounts, totalValue, P&L, allocation); returns narrative or graceful error.

2 - **ProjectionService**: Operations: generateProjections(portfolioSnapshot, timeHorizonYears) → { optimistic, expected, conservative }. Dependencies: PromptTemplate (projections), LLM gateway. Includes current rates (e.g. PPF 7.1%, EPF 8.25%) and contribution pattern in prompt; returns structured scenarios or error.

3 - **RiskAnalysisService**: Operations: analyzeRisk(portfolioSnapshot) → RiskFactor[]. Dependencies: PromptTemplate (risk), LLM gateway. Sends allocation and holdings; requests severity, description, mitigation per factor; returns list or error.

4 - **LLMGateway** (application/port): Operations: complete(prompt, options) → { text, model, tokensUsed } or error. Dependencies: external OpenAI API, API key. Abstracts HTTP call; handles rate limits and timeouts; no PII in payloads.

---

## Repository Interfaces

1 - **PromptTemplateRepository** (or in-memory / config): Entity: PromptTemplate. Methods: findByType(type) → PromptTemplate | null. (Templates may be file-based or in DB; interface allows substitution.)

2 - **PortfolioSnapshotProvider** (inbound port): Not a repository; provided by portfolio-core. Method: getCurrentSnapshot() → PortfolioSnapshot. Used by the three services to obtain input; no persistence in this context.

(LLM query/response persistence for audit is deferred to bolt 006; this bolt does not define that repository.)

---

## Ubiquitous Language

1 - **Portfolio snapshot**: Read-only, summarized view of portfolio (accounts, totals, allocation) at a point in time, used as LLM input.

2 - **Insight**: A single generated artifact — summary narrative, projection scenarios, or risk factors — produced by the LLM from a snapshot.

3 - **Prompt template**: Reusable text with placeholders (e.g. {{allocation}}, {{timeHorizon}}) filled from portfolio data before sending to the LLM.

4 - **Graceful degradation**: When the LLM API is unavailable or key is missing, return a clear error or fallback message instead of crashing.

5 - **Token optimization**: Reducing payload size (e.g. summarizing portfolio, rounding) so prompts fit context limits and cost is minimized.

6 - **Scenario** (projections): One of optimistic, expected, or conservative future value outcome.

7 - **Risk factor**: A single identified risk (e.g. concentration, liquidity) with severity, description, and mitigation suggestion.
