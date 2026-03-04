---
id: 003-hybrid-projections
unit: 001-llm-insights-core
intent: 004-ai-insights-improvement
status: draft
priority: should
created: 2026-03-04T00:00:00Z
assigned_bolt: 023-llm-insights-core
implemented: false
---

# Story: 003-hybrid-projections

## User Story

**As an** investor
**I want** projection-related AI insights to clearly combine deterministic numbers with LLM narrative
**So that** I can trust the numeric forecast while still getting a meaningful qualitative commentary on what those numbers mean for my situation

## Acceptance Criteria

- [ ] **Given** a projection insight is requested, **When** the LLM prompt is built, **Then** it includes the deterministic projection series (monthly/QoQ/YoY expected values) from `snapshot.projections`
- [ ] **Given** an LLM projection response, **When** it is returned to the client, **Then** the API response contains both `deterministicData` (structured numbers) and `llmNarrative` (text) as distinct fields
- [ ] **Given** the user has actual valuations on record, **When** a projection insight is generated, **Then** the LLM is instructed to comment on whether the user is ahead or behind their deterministic plan and offer a qualitative reason
- [ ] **Given** the LLM narrative includes an explicit stock or fund recommendation, **When** post-processing runs, **Then** that recommendation is replaced with a generic non-prescriptive equivalent
- [ ] **Given** the deterministic projections are unavailable (e.g., no contribution rate set), **When** a projection insight is requested, **Then** the LLM is told projections are unavailable and produces a qualitative-only response without fabricating numbers

## Technical Notes

- The hybrid response type should be defined: `HybridProjectionResult { deterministicData: ProjectionSeries | null, llmNarrative: string, assumptions: string[] }`
- Post-processing for investment-product removal can use a simple keyword blocklist + substitution pass
- The `projection-quality-review` template (from `002-template-registry`) is the primary template here
- The API route for projections insight (`/api/v1/insights/projections`) should return `HybridProjectionResult`

## Dependencies

### Requires
- 001-snapshot-builder (projection data lives in snapshot)
- 002-template-registry (projection-quality-review template)

### Enables
- 004-guardrails-and-audit (guardrail post-processing used here)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Projections series is empty array | LLM told projections unavailable; no fabrication |
| LLM returns no narrative text | Return deterministic data with empty narrative; do not error |
| Post-processing removes too much text | Log the substitution; keep minimum viable narrative |

## Out of Scope

- User-adjustable projection scenarios from the UI (future)
- Comparing multiple projection models side-by-side (future)
