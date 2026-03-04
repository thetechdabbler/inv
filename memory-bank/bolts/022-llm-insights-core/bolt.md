---
id: 022-llm-insights-core
unit: 001-llm-insights-core
intent: 004-ai-insights-improvement
type: ddd-construction-bolt
status: in-progress
stories:
  - 001-snapshot-builder
  - 002-template-registry
created: 2026-03-04T00:00:00Z
started: 2026-03-04T00:01:00Z
completed: null
current_stage: design
stages_completed:
  - name: model
    completed: 2026-03-04T00:05:00Z
    artifact: ddd-01-domain-model.md
requires_bolts: []
enables_bolts:
  - 023-llm-insights-core
requires_units:
  - 001-portfolio-core
  - 002-valuation-engine
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 022-llm-insights-core

## Overview

Foundation bolt for the AI Insights improvement intent. Establishes the `PortfolioSnapshot` builder and a versioned prompt template registry — the two primitives that all subsequent insight types and UX work depend on.

## Objective

Build a reusable, typed `PortfolioSnapshot` that aggregates all available portfolio, valuation, projection, and employment data into a single structure, and create a versioned template registry that maps insight types to prompt templates and output schemas.

## Stories Included

- **001-snapshot-builder**: Build portfolio snapshot for insights (Must)
- **002-template-registry**: Centralise insight templates and schemas (Must)

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
- None (first bolt in this intent)

### Enables
- 023-llm-insights-core (hybrid projections + guardrails need snapshot and templates)

### Unit Dependencies
- 001-portfolio-core (accounts, transactions, valuations, performance)
- 002-valuation-engine (projections, gratuity suggestion)

## Success Criteria

- [ ] `PortfolioSnapshot` type defined in `src/domain/insights/types.ts`
- [ ] `buildSnapshot()` function in `src/application/insights/snapshot-builder.ts` passes all acceptance criteria
- [ ] Template registry covers all 5 existing + 2 new insight types (7 total)
- [ ] `renderTemplate()` hydrates a prompt without unresolved placeholders
- [ ] Unit tests cover snapshot builder (missing data branches) and template registry (unknown type error)
- [ ] Backwards compatibility: existing insight API responses unchanged in shape

## Notes

- Extend `src/application/insights/snapshot-builder.ts` — it already exists; avoid rewriting from scratch
- Keep `PortfolioSnapshot` serialisation deterministic (sort keys, strip undefined)
- Template registry is TS objects for now — no YAML/DB complexity
