---
stage: model
bolt: 006-llm-insights
created: 2026-03-02T23:50:00Z
---

# Static Model: 003-llm-insights (Bolt 006)

## Bounded Context

**LLM Insights (extended)**: Extends bolt 005 with three capabilities: (1) rebalancing recommendations from current vs. target allocation; (2) natural language query answering with portfolio context injection; (3) persistent audit trail of all LLM interactions across both bolts. This context continues to read portfolio data from portfolio-core and delegates LLM calls to the existing `LLMGatewayPort`. It adds a new persistence concern: storing every prompt/response exchange in SQLite.

---

## Entities

1 - **LLMQuery**: Persistent record of a prompt sent to the LLM. Properties: id (cuid), insightType (summary | projections | risk | rebalancing | query), prompt (full text), modelRequested (string), createdAt (DateTime). Business rule: prompt is the complete text sent; insightType classifies the kind of insight requested; every LLM call produces exactly one LLMQuery record.

2 - **LLMResponse**: Persistent record of the LLM's reply. Properties: id (cuid), queryId (FK → LLMQuery), responseText (full text), modelUsed (string), tokensUsed (int | null), success (boolean), errorMessage (string | null), createdAt (DateTime). Business rule: always created as a pair with LLMQuery, even on failure (success=false, responseText empty, errorMessage set); tokensUsed is null when not provided by the API.

3 - **RebalancingRequest** (value in this bolt, not persisted): Input for rebalancing. Properties: currentAllocation (Record<AccountType, valuePaise>), targetAllocation (Record<string, percentageDecimal> | null). Business rule: if targetAllocation is null, LLM is asked to suggest a reasonable target; percentage values must sum to 1.0 when provided.

4 - **NLQuery** (value in this bolt, not persisted): Input for natural language query. Properties: question (string), portfolioSnapshot (PortfolioSnapshot from bolt 005). Business rule: question must be non-empty; snapshot is injected as context into the prompt; no conversation history in this bolt (single-turn only).

---

## Value Objects

1 - **AllocationPercentage**: Immutable. Properties: accountType (string), percentage (number 0–1). Constraints: percentage ∈ [0, 1]; sum of all AllocationPercentages in a target must equal 1.0 (validated at application layer).

2 - **RebalancingAction**: Immutable result item. Properties: accountType (string), action ("increase" | "decrease" | "maintain"), suggestion (string describing the recommended change). Constraints: action is one of three values; suggestion is non-empty.

3 - **InsightType** (extended from bolt 005): "summary" | "projections" | "risk" | "rebalancing" | "query". Constraints: closed set; used as discriminator in audit log.

---

## Aggregates

1 - **LLMInteraction** (audit aggregate root): Members: LLMQuery + LLMResponse. Invariants: a LLMQuery always has exactly one LLMResponse (created atomically after the LLM call, success or failure); the response's queryId references the query's id; both records share the same createdAt moment. This aggregate is write-only from the audit perspective — use case services create it; the history route reads it.

(No other persistent aggregates in this bolt. RebalancingRequest and NLQuery are transient value objects.)

---

## Domain Events

1 - **RebalancingRecommended**: Trigger — LLM returns rebalancing actions. Payload: currentAllocation, targetAllocation (as used in prompt), actions (RebalancingAction[]), modelUsed, queryId.

2 - **NLQueryAnswered**: Trigger — LLM answers a natural language question. Payload: question, answer (string), modelUsed, queryId.

3 - **LLMCallLogged**: Trigger — any LLM interaction (success or failure) is persisted. Payload: queryId, responseId, insightType, success.

---

## Domain Services

1 - **RebalancingService**: Operations: recommendRebalancing(snapshot, targetAllocation?) → { actions: RebalancingAction[], narrative: string }. Dependencies: PromptTemplate (rebalancing), LLMGatewayPort (ADR-003), LLMAuditService. Builds current allocation from snapshot; if targetAllocation is null, asks LLM to suggest one; requests structured JSON of actions + narrative. Delegates audit logging to LLMAuditService after call.

2 - **NLQueryService**: Operations: processQuery(question, snapshot) → { answer: string }. Dependencies: PromptTemplate (query), LLMGatewayPort, LLMAuditService. Injects portfolio snapshot summary into system prompt; appends user question; returns LLM answer text. Delegates audit logging to LLMAuditService. Guards: rejects blank question.

3 - **LLMAuditService**: Operations: logInteraction(insightType, prompt, response: LLMResponse | LLMError) → LLMQuery. Dependencies: LLMQueryRepository, LLMResponseRepository. Creates LLMQuery record before LLM call (or atomically after); creates LLMResponse record after. Wraps bolt 005 interactions too — bolt 005 use cases will call this service going forward (or via the auditing gateway wrapper).

4 - **AuditingLLMGateway** (decorator, implements LLMGatewayPort): Wraps any LLMGatewayPort implementation; intercepts complete() calls; logs query + response via LLMAuditService before returning. This eliminates the need to change bolt 005 use cases — the route handlers swap in the AuditingLLMGateway instead of plain OpenAIGateway.

---

## Repository Interfaces

1 - **LLMQueryRepository**: Entity: LLMQuery. Methods: create(data) → LLMQuery; findAll(options?: { limit, offset }) → LLMQuery[]; findById(id) → LLMQuery | null; deleteById(id) → void.

2 - **LLMResponseRepository**: Entity: LLMResponse. Methods: create(data) → LLMResponse; findByQueryId(queryId) → LLMResponse | null.

---

## Ubiquitous Language

1 - **Rebalancing**: The act of adjusting portfolio allocation to align with a target distribution across asset classes.

2 - **Target allocation**: User's desired distribution of portfolio value across asset types (e.g. 40% equity, 30% mutual funds, 15% PPF, 15% EPF), expressed as percentages.

3 - **Natural language query (NL query)**: A free-text question from the user about their portfolio, answered by the LLM with injected portfolio context.

4 - **Audit trail**: The persistent log of every prompt sent to and every response received from the LLM, including failures.

5 - **Auditing gateway**: A decorator around `LLMGatewayPort` that transparently logs every call to the audit trail without changing the calling use case.

6 - **LLM interaction**: One complete exchange: a prompt (LLMQuery) and its response (LLMResponse), always created as a pair.

7 - **Single-turn query**: An NL query that has no conversation history — each question is answered independently with fresh portfolio context.
