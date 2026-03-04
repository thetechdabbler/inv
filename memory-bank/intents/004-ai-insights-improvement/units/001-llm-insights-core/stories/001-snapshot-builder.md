---
id: 001-snapshot-builder
unit: 001-llm-insights-core
intent: 004-ai-insights-improvement
status: draft
priority: must
created: 2026-03-04T00:00:00Z
assigned_bolt: 022-llm-insights-core
implemented: false
---

# Story: 001-snapshot-builder

## User Story

**As a** developer
**I want** a unified `PortfolioSnapshot` builder that aggregates accounts, valuations, projections, and employment/gratuity data
**So that** all LLM prompts are grounded in the richest possible structured context without each insight type duplicating data-fetching logic

## Acceptance Criteria

- [ ] **Given** a user with accounts and valuations, **When** `buildSnapshot()` is called, **Then** it returns a typed `PortfolioSnapshot` containing: aggregated contributions, current values, allocation by type, recent performance summary, and deterministic projections (if available)
- [ ] **Given** a user with employment info (basic salary, joining date), **When** `buildSnapshot()` is called, **Then** the snapshot includes employment context and gratuity suggestion
- [ ] **Given** no employment info exists, **When** `buildSnapshot()` is called, **Then** the snapshot still succeeds with `employment: null` and no gratuity fields
- [ ] **Given** a snapshot is built, **When** it is serialised for a prompt, **Then** the output is a compact, deterministic JSON string with no circular references or undefined fields
- [ ] **Given** the snapshot builder is used by an existing insight type (e.g., portfolio-summary), **When** it runs end-to-end, **Then** the response is identical in structure to the previous version (backwards compatibility)

## Technical Notes

- Location: `src/application/insights/snapshot-builder.ts` (already partially exists — extend rather than replace)
- The snapshot should re-use existing service calls (`getAccounts`, `getTransactions`, `getValuations`, `getProjections`, `getEmploymentInfo`, `computeGratuity`)
- Define a `PortfolioSnapshot` type in `src/domain/insights/types.ts`
- Keep the builder free of LLM concerns — it is a pure data aggregation step
- Serialise with `JSON.stringify` (no circular refs); strip `undefined` fields before serialisation

## Dependencies

### Requires
- 001-portfolio-core (accounts, transactions, valuations APIs)
- 002-valuation-engine (projections, gratuity helper)

### Enables
- 002-template-registry (templates need a snapshot to render against)
- 003-hybrid-projections (projection insight needs snapshot.projections)
- 004-guardrails-and-audit (audit records reference snapshot metadata)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User has no accounts | Snapshot built with empty arrays; no crash |
| Projections API times out | Snapshot built without projections; `projections: null` |
| Gratuity service throws | Snapshot built with `gratuity: null`; error logged but not propagated |
| Very large portfolio (100+ accounts) | Snapshot summarises — does not include raw transaction lists |

## Out of Scope

- Caching the snapshot (a future optimisation)
- Per-account-level snapshots (this is portfolio-level only)
- Sending the snapshot to the LLM (that is the template/prompt layer)
