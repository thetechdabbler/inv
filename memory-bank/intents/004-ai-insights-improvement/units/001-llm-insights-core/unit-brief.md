---
unit: 001-llm-insights-core
intent: 004-ai-insights-improvement
unit_type: backend
default_bolt_type: ddd-bolt
phase: inception
status: in-progress
created: 2026-03-03T10:45:00.000Z
updated: 2026-03-03T10:45:00.000Z
---

# Unit Brief: LLM Insights Core Enhancements

## Purpose

Enhance the core LLM Insights service so that all prompts are grounded in rich, structured portfolio and projection data, use well-defined templates, and produce safer, more actionable outputs with full audit coverage.

## Scope

### In Scope
- Portfolio snapshot builder that aggregates data from portfolio, valuations, projections, and employment modules.
- Prompt template registry and versioning for all insight types.
- Deterministic+LLM hybrid projection flows and projection-vs-valuation commentary.
- Guardrails (content filters, disclaimers, post-processing) and richer audit trail metadata.

### Out of Scope
- UI components and visual layout (handled by `002-insights-ux`).
- Core account/transaction/valuation schema changes (owned by existing units).

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| AFR-1 | Ground LLM Prompts in Full System Context | Must |
| AFR-2 | Insight Types and Templates | Must |
| AFR-3 | Deterministic + LLM Hybrid Projections | Should |
| AFR-4 | Insight Quality and Safety Controls | Should |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| PortfolioSnapshot | Aggregated data sent to LLM | accounts, allocations, projections, employment, gratuity |
| InsightTemplate | Prompt + expected output schema | id, type, version, template, schema |
| InsightResult | Structured LLM output | id, type, payload, narrative, assumptions |
| InsightMetrics | Telemetry for a single run | model, tokens, durationMs, success, error |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| buildSnapshot | Build portfolio snapshot for LLM | userId/scope | PortfolioSnapshot |
| renderTemplate | Fill prompt template with data | template, snapshot, params | prompt string |
| callLLM | Invoke OpenAI with prompt | prompt, model, options | raw response |
| interpretInsight | Parse and validate LLM output | raw response, schema | InsightResult |
| recordAudit | Persist query/response/metrics | InsightResult, InsightMetrics | audit record id |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 4 |
| Must Have | 2 |
| Should Have | 2 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-snapshot-builder | Build portfolio snapshot for insights | Must | Planned |
| 002-template-registry | Centralize insight templates and schemas | Must | Planned |
| 003-hybrid-projections | Combine deterministic and LLM projections | Should | Planned |
| 004-guardrails-and-audit | Guardrails and enhanced audit metrics | Should | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-portfolio-core | Portfolio data (accounts, history, performance) |
| 002-valuation-engine | Deterministic valuations and projections |
| Employment & Gratuity module | Employment context and gratuity suggestions |

### Depended By
| Unit | Reason |
|------|--------|
| 002-insights-ux | Needs richer, structured insights + metrics |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| OpenAI API | LLM inference | Medium (cost, latency) |

---

## Technical Context

### Suggested Technology
- TypeScript services within existing `llm-insights` module.
- JSON-schema-like validation for insight outputs.
- Configuration-driven template registry (e.g., JSON/YAML or DB-backed).

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| portfolio-core | Internal service | Function calls |
| valuation/projections | Internal service | Function calls / API |
| UI | API consumer | REST (Next.js API routes) |
| OpenAI | External API | REST / JSON |

---

## Success Criteria

- [ ] All insight types use the portfolio snapshot builder.
- [ ] Templates and schemas are versioned and testable.
- [ ] Projection-related insights use deterministic baselines.
- [ ] Audit records include metrics and basic guardrail flags.

