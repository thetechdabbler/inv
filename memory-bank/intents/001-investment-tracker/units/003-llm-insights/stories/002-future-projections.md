---
id: 002-future-projections
unit: 003-llm-insights
intent: 001-investment-tracker
status: complete
priority: should
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 005-llm-insights
implemented: true
---

# Story: 002-future-projections

## User Story

**As a** user
**I want** to see projected future values of my portfolio for a given time horizon
**So that** I can plan my financial goals

## Acceptance Criteria

- [ ] **Given** portfolio data and a time horizon (e.g., 5, 10, 15 years), **When** I request projections, **Then** the LLM returns projected values using historical returns and current interest rates
- [ ] **Given** projections are generated, **When** displayed, **Then** they include optimistic, expected, and conservative scenarios
- [ ] **Given** specific account types with known rates (PPF 7.1%, EPF 8.25%), **When** projected, **Then** those rates are used as baseline inputs

## Technical Notes

- Include current rates, historical returns, and contribution patterns in prompt
- Request structured output: { optimistic, expected, conservative } for each scenario
- API route: POST /api/v1/insights/projections with body { timeHorizonYears }

## Dependencies

### Requires
- portfolio-core unit (portfolio data, performance metrics)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Very long horizon (50+ years) | LLM should caveat about uncertainty |
| No historical data | Use current rates only |
| Mixed account types | Project each type separately then aggregate |

## Out of Scope

- Monte Carlo simulations (deterministic projections only via LLM)
- Goal-based planning (e.g., "How much do I need for retirement?")
