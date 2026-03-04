---
id: 023-llm-insights-core
unit: 001-llm-insights-core
intent: 004-ai-insights-improvement
type: ddd-construction-bolt
status: planned
stories:
  - 003-hybrid-projections
  - 004-guardrails-and-audit
created: 2026-03-04T00:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []
requires_bolts:
  - 022-llm-insights-core
enables_bolts:
  - 024-insights-ux
requires_units:
  - 001-portfolio-core
  - 002-valuation-engine
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 023-llm-insights-core

## Overview

Enhancement bolt building on the snapshot and template foundation. Adds the deterministic+LLM hybrid projection flow and the guardrails + enriched audit trail that make insights safer and more traceable.

## Objective

Wire deterministic projection data into LLM projection prompts and return a structured `HybridProjectionResult`, while also adding a post-processing guardrail pipeline, consistent disclaimers, and enriched audit telemetry (tokens, latency, template version).

## Stories Included

- **003-hybrid-projections**: Combine deterministic and LLM projections (Should)
- **004-guardrails-and-audit**: Guardrails and enhanced audit metrics (Should)

## Bolt Type

**Type**: DDD Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [ ] **1. Domain Model**: Pending → ddd-01-domain-model.md
- [ ] **2. Technical Design**: Pending → ddd-02-technical-design.md
- [ ] **3. Implementation**: Pending → src/
- [ ] **4. Testing**: Pending → ddd-03-test-report.md

## Dependencies

### Requires
- 022-llm-insights-core (snapshot builder + template registry must exist)

### Enables
- 024-insights-ux (UX bolt reads `HybridProjectionResult` and enriched audit records)

### Unit Dependencies
- 001-portfolio-core (account + valuation data for projection vs actual comparison)
- 002-valuation-engine (deterministic projection series)

## Success Criteria

- [ ] `HybridProjectionResult` type defined with `deterministicData`, `llmNarrative`, `assumptions` fields
- [ ] Projection insight API returns both fields in a single response
- [ ] Post-processing pipeline strips explicit product recommendations
- [ ] Consistent disclaimer appended to all insight responses
- [ ] Audit records enriched with `promptTokens`, `completionTokens`, `durationMs`, `templateId`, `templateVersion`
- [ ] Debug endpoint `/api/v1/insights/debug/:auditId` returns raw prompt + response (authenticated)
- [ ] Graceful fallback when projections unavailable or LLM fails

## Notes

- Post-processing is a simple array of `(text) => text` transforms — keep it extensible but not over-engineered
- Keyword blocklist for product filtering: regex-based, documented in domain model
- Audit DB schema migration required for new telemetry fields — keep backwards compatible
