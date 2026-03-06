---
stage: model
bolt: 023-llm-insights-core
created: 2026-03-04T01:05:00Z
---

## Static Model: LLM Insights Core — Hybrid Projections, Guardrails & Enriched Audit

---

### Entities

- **HybridProjectionResult**: The combined output of a projection insight — deterministic numbers plus LLM narrative.
  - Properties: `deterministicData` (ProjectionSeries | null), `llmNarrative` (string), `assumptions` (string[]), `disclaimer` (string)
  - Business Rules: `llmNarrative` may be empty string if LLM returns no text (non-fatal). `deterministicData` is null when no contribution rates are configured. `disclaimer` is always present. `assumptions` is extracted from LLM response where possible, else empty array.

- **PostProcessingTransform**: A single named transform applied to raw LLM text as part of the guardrail pipeline.
  - Properties: `name` (string — identifies the transform for logging), `apply` ((text: string) => string)
  - Business Rules: Must not throw — if the transform fails, it logs a warning and returns the original text unchanged. Transforms are pure functions with no side effects.

- **EnrichedLLMQuery**: Extension of the existing `LLMQuery` audit record with template provenance.
  - Properties: All existing `LLMQuery` fields + `templateId` (string | null), `templateVersion` (string | null)
  - Business Rules: `templateId` and `templateVersion` are null for calls from use cases that have not yet been migrated to the template registry (forward-compatible). Non-null when the call originates from a `renderTemplate()` invocation.

- **EnrichedLLMResponse**: Extension of the existing `LLMResponse` audit record with telemetry.
  - Properties: All existing `LLMResponse` fields + `promptTokens` (integer | null), `completionTokens` (integer | null), `durationMs` (integer | null)
  - Business Rules: Token fields are null when the LLM provider does not return usage data. `durationMs` is always populated (measured wall-clock from gateway call start to response). All fields are nullable to maintain backwards compatibility with existing records.

- **DebugAuditView**: A read-only projection for the debug endpoint — raw prompt and response for a single audit pair.
  - Properties: `auditId` (string), `insightType` (string), `prompt` (string), `responseText` (string), `modelUsed` (string), `promptTokens` (integer | null), `completionTokens` (integer | null), `durationMs` (integer | null), `templateId` (string | null), `templateVersion` (string | null), `success` (boolean), `errorMessage` (string | null), `createdAt` (DateTime)
  - Business Rules: Only accessible by authenticated users (existing iron-session check). Raw prompt may contain portfolio data — this is intentional for debugging and only exposed to the authenticated user.

---

### Value Objects

- **InsightDisclaimer**: Immutable centralised disclaimer constant appended to every insight response.
  - Value: Fixed multi-sentence string covering: data horizon (latest known valuations), assumption notice (rates assumed, not guaranteed), and non-advisory statement.
  - Constraints: Immutable. Shared across all insight types. Stored as an exported constant `INSIGHT_DISCLAIMER` in a new `src/domain/insights/disclaimer.ts` file.

- **GuardrailBlocklist**: The set of regex patterns used to detect and replace investment product recommendations.
  - Patterns: `\binvest in\b`, `\bbuy\b`, `\bpurchase\b`, `\bsell\b`, `\brecommend[a-z]*\s+(fund|stock|share|etf)\b`, `\bswitch to\b`
  - Replacement: `"consider reviewing your allocation"` (generic, non-prescriptive)
  - Constraints: Case-insensitive matching. Patterns are documented and version-controlled in code, not in DB.

- **ProjectionAssumptions**: The list of qualitative assumptions extracted from (or attributed to) the LLM response.
  - Properties: `items` (string[]) — each item is a single assumption sentence.
  - Constraints: Derived from LLM response where parseable. May be an empty array.

---

### Aggregates

- **HybridProjectionAggregate**: Root is `HybridProjectionResult`.
  - Members: `HybridProjectionResult`, `ProjectionSeries?` (from snapshot), `InsightDisclaimer`
  - Invariants: (1) `disclaimer` is always set. (2) If `deterministicData` is null, `llmNarrative` must not reference specific numeric projections.

- **AuditPairAggregate**: Root is `EnrichedLLMQuery`.
  - Members: `EnrichedLLMQuery`, `EnrichedLLMResponse`
  - Invariants: (1) Each query has at most one response. (2) `durationMs` in response is measured from query creation time. (3) `templateId`/`templateVersion` on query are consistent with what was passed in `LLMCompletionOptions`.

---

### Domain Events

- **GuardrailApplied**: Emitted when a post-processing transform modifies LLM text.
  - Trigger: A transform's regex matches and substitutes text.
  - Payload: `transformName` (string), `matchCount` (integer), `originalLength` (integer), `resultLength` (integer)
  - Usage: Logged at info level; not persisted.

- **DisclaimerAppended**: Emitted when the disclaimer is appended to an insight response.
  - Trigger: `appendDisclaimer()` called on a response.
  - Payload: `insightType` (string)
  - Usage: Logged at debug level.

- **AuditEnriched**: Emitted when an audit record is written with full telemetry.
  - Trigger: `AuditingLLMGateway.complete()` successfully writes both query and enriched response.
  - Payload: `queryId`, `templateId` (string | null), `durationMs` (integer), `promptTokens` (integer | null)
  - Usage: Logged at debug level.

---

### Domain Services

- **PostProcessingService**: Applies the guardrail pipeline to raw LLM text.
  - Operations: `process(text: string): string` — applies all transforms in order; each transform is independent.
  - Dependencies: None (stateless pipeline of pure functions).
  - Behaviour: If a transform throws, it logs a warning and skips that transform. If the result is empty after processing, returns a safe fallback message.

- **DisclaimerService**: Appends the standard disclaimer to an insight narrative.
  - Operations: `append(narrative: string): string` — returns `${narrative}\n\n${INSIGHT_DISCLAIMER}`.
  - Dependencies: `INSIGHT_DISCLAIMER` constant.
  - Behaviour: Always returns a non-empty string. If input is empty, returns only the disclaimer.

- **HybridProjectionService**: Orchestrates the projection insight — builds context, calls LLM via template, applies guardrails, and structures the hybrid response.
  - Operations: `generate(snapshot: PortfolioSnapshot, gateway: LLMGatewayPort): Promise<HybridProjectionResult>`
  - Dependencies: `TemplateRegistry`, `PostProcessingService`, `DisclaimerService`
  - Behaviour: Embeds deterministic projection data in the prompt when available. If projections absent, instructs LLM not to fabricate numbers.

---

### Repository Interfaces

- **LLMQueryRepository** (extended):
  - Existing: `createLLMQuery(input)`, `findLLMQueryById(id)`, paginated list
  - New: `createLLMQueryEnriched(input: { insightType, prompt, modelRequested, templateId?, templateVersion? }): Promise<{ id }>`

- **LLMResponseRepository** (extended):
  - Existing: `createLLMResponse(input)`, linked find
  - New: `createLLMResponseEnriched(input: { queryId, responseText, modelUsed, tokensUsed?, promptTokens?, completionTokens?, durationMs?, success, errorMessage? }): Promise<void>`
  - Also new: `findDebugView(queryId: string): Promise<DebugAuditView | null>` — joins LLMQuery + LLMResponse for debug endpoint

---

### Examples

#### HybridProjectionResult — example payload

```json
{
  "deterministicData": {
    "granularity": "yearly",
    "points": [
      { "label": "2027", "periodEndDate": "2027-03-31", "investedPaise": 55000000, "profitPaise": 8250000, "totalValuePaise": 63250000 },
      { "label": "2028", "periodEndDate": "2028-03-31", "investedPaise": 61000000, "profitPaise": 17080000, "totalValuePaise": 78080000 },
      { "label": "2029", "periodEndDate": "2029-03-31", "investedPaise": 67000000, "profitPaise": 27220000, "totalValuePaise": 94220000 }
    ]
  },
  "llmNarrative": "Based on your current allocation, your portfolio is on track to reach approximately ₹9.4L by 2029, assuming similar contribution rates. Your equity-heavy mutual fund position is the primary growth driver. Consider reviewing your debt allocation if stability is a priority.",
  "assumptions": [
    "Equity returns assumed at 12% p.a. (historical Indian market average)",
    "PPF contributions continue at current rate of ₹1.5L/year",
    "No major withdrawals assumed over the projection period"
  ],
  "disclaimer": "This projection is based on historical data and assumed rates. Actual returns may differ. This is not financial advice. Data as of your most recent valuation."
}
```

#### PostProcessingService — guardrail pipeline example

**Input** (raw LLM text):
```
Your portfolio is equity-heavy. I recommend you invest in Axis Bluechip Fund and buy more HDFC Bank shares to balance growth. You should sell your PPF allocation and switch to NPS for better retirement returns.
```

**Guardrail transforms applied** (in order):

1 - `investmentRecommendationTransform`:
   - Matches: `invest in`, `buy`, `sell`, `switch to`
   - Output: `"Your portfolio is equity-heavy. I suggest you consider reviewing your allocation in equity funds and consider reviewing your allocation more HDFC Bank shares to balance growth. You should consider reviewing your allocation your PPF allocation and consider reviewing your allocation NPS for better retirement returns."`

2 - `fundNameSanitisationTransform` (regex: `\b[A-Z][a-zA-Z]+ (Fund|ETF|Bluechip)\b`):
   - Matches: `Axis Bluechip Fund`
   - Output: replaces with `"an equity fund"`

**Final output**:
```
Your portfolio is equity-heavy. I suggest you consider reviewing your allocation in equity funds and consider reviewing your allocation more in equity for balance. You should consider reviewing your allocation from PPF-type instruments and consider reviewing your NPS allocation for better retirement returns.
```

*Note: if final output is empty or < 20 chars, `PostProcessingService` returns the safe fallback:*
```
Your portfolio data has been analysed. Please consult your financial advisor for personalised recommendations.
```

#### INSIGHT_DISCLAIMER — example constant

```
⚠️ This insight is generated by an AI model based on your portfolio data as of the most recent recorded valuation. Rates and returns are assumed, not guaranteed. Market conditions, tax rules, and personal circumstances can differ significantly from modelled assumptions. This output is for informational purposes only and does not constitute financial advice. Consult a SEBI-registered investment advisor for personalised guidance.
```

#### EnrichedLLMQuery + EnrichedLLMResponse — DB example

**LLMQuery row (after migration):**
```
id:              "cld_abc123"
insightType:     "future-projections"
prompt:          "You are a financial advisor... [full prompt]"
modelRequested:  "gpt-4o-mini"
templateId:      "future-projections"         ← NEW
templateVersion: "1.0.0"                      ← NEW
createdAt:       "2026-03-04T01:15:00Z"
```

**LLMResponse row (after migration):**
```
id:               "resp_xyz789"
queryId:          "cld_abc123"
responseText:     "[raw LLM output before post-processing]"
modelUsed:        "gpt-4o-mini"
tokensUsed:       342                          ← existing (total)
promptTokens:     289                          ← NEW
completionTokens: 53                           ← NEW
durationMs:       1840                         ← NEW
success:          true
errorMessage:     null
createdAt:        "2026-03-04T01:15:02Z"
```

#### DebugAuditView — example API response

`GET /api/v1/insights/debug/cld_abc123`

```json
{
  "auditId": "cld_abc123",
  "insightType": "future-projections",
  "prompt": "You are a financial advisor for an Indian investor...\n\nPortfolio:\n- Current value: ₹5,00,000\n...",
  "responseText": "Based on your current allocation of mutual funds and PPF...",
  "modelUsed": "gpt-4o-mini",
  "promptTokens": 289,
  "completionTokens": 53,
  "durationMs": 1840,
  "templateId": "future-projections",
  "templateVersion": "1.0.0",
  "success": true,
  "errorMessage": null,
  "createdAt": "2026-03-04T01:15:00Z"
}
```

#### LLMCompletionOptions — extended example

```typescript
await gateway.complete(prompt, {
  insightType: "future-projections",
  templateId: "future-projections",    // NEW — stored in LLMQuery
  templateVersion: "1.0.0",            // NEW — stored in LLMQuery
});
```

---

### Ubiquitous Language

| Term | Definition |
|------|-----------|
| **HybridProjectionResult** | A projection insight combining deterministic numeric series with an LLM-authored narrative and assumption list |
| **Post-processing pipeline** | An ordered array of `(text) => text` transforms applied to raw LLM output before returning it to the caller |
| **Guardrail** | A post-processing transform that detects and replaces investment product recommendations with non-prescriptive equivalents |
| **Disclaimer** | A fixed, centralised string appended to every insight response — covers data assumptions and "not financial advice" |
| **INSIGHT_DISCLAIMER** | The exported constant holding the disclaimer text |
| **Enriched audit record** | An `LLMQuery`/`LLMResponse` pair augmented with `templateId`, `templateVersion`, `promptTokens`, `completionTokens`, `durationMs` |
| **durationMs** | Wall-clock elapsed time in milliseconds from the start of a `gateway.complete()` call to receipt of the LLM response |
| **Debug view** | The read-only join of an LLMQuery + LLMResponse exposed at `/api/v1/insights/debug/:auditId` for authenticated inspection |
| **Safe fallback message** | A user-visible message returned when the post-processing pipeline reduces the LLM output to empty string |
| **GuardrailBlocklist** | The set of regex patterns that identify investment-recommendation language to be replaced by generic guidance |
