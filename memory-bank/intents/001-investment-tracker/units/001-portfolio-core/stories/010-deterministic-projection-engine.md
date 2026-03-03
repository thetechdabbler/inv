---
id: 010-deterministic-projection-engine
unit: 001-portfolio-core
intent: 001-investment-tracker
status: planned
priority: should
created: 2026-03-03T10:00:00.000Z
---

# Story: 010-deterministic-projection-engine

## User Story

**As a** user  
**I want** a deterministic projection engine that uses my accounts’ expected return and expected investment inputs  
**So that** I can get consistent, non-LLM projections for my portfolio

## Acceptance Criteria

- [ ] **Given** accounts with Expected annual rate of return and Expected monthly investment, **When** I request projections, **Then** the service computes Monthly, QoQ, and YoY projections using a deterministic compound-interest model.
- [ ] **Given** I request projections for a single account, **When** the engine runs, **Then** the response includes period rows (month, quarter, year) with invested capital, profit, total value, and a period label for that account only.
- [ ] **Given** I request projections for the entire portfolio, **When** the engine runs, **Then** the response aggregates per-account projections into portfolio-level invested capital, profit, and total value per period.
- [ ] **Given** an account is missing expected rate or expected investment, **When** projections are computed, **Then** safe defaults (e.g. 0% rate, 0 contribution) are applied and surfaced in the response metadata.
- [ ] **Given** a projection request with zero expected contribution, **When** the engine computes results, **Then** the output reduces to simple compounding of current value at the expected rate.
- [ ] **Given** a projection request with zero expected rate and positive expected contribution, **When** the engine computes results, **Then** the output shows linear growth equal to contributions over time.

## Technical Notes

- Implement a core projection function that accepts:
  - current value and net contributions (baseline from portfolio-core),
  - expected annual rate of return,
  - expected monthly contribution amount,
  - projection horizons for Monthly, QoQ, and YoY.
- Derive monthly rate from annual rate (e.g. \( r_m = (1 + r_a)^{1/12} - 1 \)), and build periods forward from “today”, labeling months, quarters, and years consistently.
- Expose the engine via an API route such as `GET /api/v1/projections` with query parameters for scope (portfolio | account), accountId (when scope is account), and horizon configuration.
- Keep formulas and assumptions documented in code comments and reusable for both backend services and potential LLM prompt enrichment.

## Dependencies

### Requires

- 001-portfolio-core basic models and services for Account, Transaction, and Valuation (current value and net contributions).

### Enables

- 005-investment-tracker-ui projections section.
- 003-llm-insights future enhancements that incorporate deterministic baselines.

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Negative or zero expected rate | Clamp to zero or validate and reject with error message |
| Very long horizons (50+ years) | Still compute deterministically but include a note about uncertainty |
| Accounts with no current value | Start projections from contributions only |

## Out of Scope

- LLM-based narrative projections (covered by 003-llm-insights stories).
- Monte Carlo or stochastic simulations.
- Tax modeling or inflation-adjusted returns.

