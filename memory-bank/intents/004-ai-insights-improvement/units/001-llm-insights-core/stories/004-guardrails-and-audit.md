---
id: 004-guardrails-and-audit
unit: 001-llm-insights-core
intent: 004-ai-insights-improvement
status: draft
priority: should
created: 2026-03-04T00:00:00Z
assigned_bolt: 023-llm-insights-core
implemented: false
---

# Story: 004-guardrails-and-audit

## User Story

**As a** developer and solo user
**I want** every AI insight to include a consistent disclaimer, have investment recommendations filtered, and log full telemetry to the audit trail
**So that** outputs are safe, traceable, and I can debug or review any past insight interaction

## Acceptance Criteria

- [ ] **Given** any insight response is returned to the UI, **When** it is rendered, **Then** a standard disclaimer is always appended: assumptions made, data horizon, and a note that this is not financial advice
- [ ] **Given** the LLM output contains a specific product recommendation (e.g., "buy Fund X"), **When** post-processing runs, **Then** the recommendation is replaced with non-prescriptive guidance (e.g., "consider reviewing your equity allocation")
- [ ] **Given** an insight is generated (success or failure), **When** `recordAudit()` is called, **Then** the audit record includes: `model`, `promptTokens`, `completionTokens`, `durationMs`, `insightType`, `templateId`, `templateVersion`, `success`, `errorMessage`
- [ ] **Given** a developer is authenticated, **When** they access `/api/v1/insights/debug/:auditId`, **Then** the full raw prompt and raw LLM response for that audit record are returned (behind auth)
- [ ] **Given** an insight call fails (LLM error, timeout), **When** the audit record is written, **Then** `success: false` and `errorMessage` are populated; the user-visible response degrades gracefully with a safe fallback message

## Technical Notes

- Extend the existing `InsightAuditRecord` DB schema/type with the new telemetry fields (`promptTokens`, `completionTokens`, `durationMs`, `templateId`, `templateVersion`)
- Disclaimer text should be centralised as a constant, not inline in each template
- Post-processing pipeline: array of `(text: string) => string` transforms applied after LLM response — start with keyword substitution pass
- Debug endpoint must verify session auth before returning raw prompts (no PII beyond existing audit scope)
- Keyword blocklist for post-processing: `["invest in", "buy", "purchase", "sell", "recommend.*fund", "recommend.*stock"]` (regex-based)

## Dependencies

### Requires
- 001-snapshot-builder (audit records reference snapshot metadata)
- 002-template-registry (audit records reference template id + version)

### Enables
- 005-insights-history-list (UI reads enriched audit records)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Audit DB write fails | Log error; do not fail the insight response to user |
| Post-processing removes entire response text | Return a safe fallback message rather than empty response |
| Debug endpoint called without auth | 401 returned; no raw prompt exposed |
| Tokens unavailable from OpenAI response | Store `null` for token fields; do not error |

## Out of Scope

- Automated evaluation harness / insight quality scoring (future)
- User-visible token usage display (future)
- Insight flagging / feedback mechanism (future)
