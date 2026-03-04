---
id: 002-template-registry
unit: 001-llm-insights-core
intent: 004-ai-insights-improvement
status: draft
priority: must
created: 2026-03-04T00:00:00Z
assigned_bolt: 022-llm-insights-core
implemented: false
---

# Story: 002-template-registry

## User Story

**As a** developer
**I want** a versioned prompt template registry for all insight types
**So that** prompt content and expected output schemas can be updated and tested without touching business logic code

## Acceptance Criteria

- [ ] **Given** the registry exists, **When** an insight type (e.g., `portfolio-summary`) is requested, **Then** its named prompt template and expected output schema are returned
- [ ] **Given** a template is registered with version `v1`, **When** a new version `v2` is created, **Then** both are available and the active version is configurable (e.g., via env var or config key)
- [ ] **Given** a `PortfolioSnapshot` and a template for `portfolio-summary`, **When** `renderTemplate(template, snapshot, params)` is called, **Then** it returns a fully-hydrated prompt string with no unresolved placeholders
- [ ] **Given** two new insight types are added (projection-quality-review and retirement-readiness), **When** the registry is loaded, **Then** both types appear with valid templates and output schemas
- [ ] **Given** an unknown insight type is requested, **When** the registry is queried, **Then** it throws a typed `UnknownInsightTypeError`

## Technical Notes

- Template registry can be TypeScript objects (not DB/YAML-backed for now) to keep it simple and type-safe
- Define an `InsightTemplate` type: `{ id, type, version, systemPrompt, userPromptTemplate, outputSchema }`
- `renderTemplate` should use simple `{{variable}}` or template-literal style substitution
- New insight types to add: `projection-quality-review` (uses `snapshot.projections`) and `retirement-readiness` (uses `snapshot.employment` + `snapshot.gratuity`)
- Existing insight types (`portfolio-summary`, `risk-analysis`, `rebalancing`, `natural-language-query`, `future-projections`) must be migrated to use registry templates

## Dependencies

### Requires
- 001-snapshot-builder (templates are rendered with snapshot data)

### Enables
- 003-hybrid-projections (projection templates in registry)
- 004-guardrails-and-audit (audit references template id + version)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Template with missing snapshot field | Placeholder resolves to empty string; log a warning |
| Two templates registered with same id+version | Startup error thrown (fail-fast) |
| Params contain XSS-like strings | Passed through as-is (LLM input, not HTML) |

## Out of Scope

- Database or file-system backed template storage (future)
- A/B testing between template versions (future)
- UI to manage templates (future)
