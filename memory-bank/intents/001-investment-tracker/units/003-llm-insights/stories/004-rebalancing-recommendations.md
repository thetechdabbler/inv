---
id: 004-rebalancing-recommendations
unit: 003-llm-insights
intent: 001-investment-tracker
status: draft
priority: should
created: 2026-03-02T10:30:00Z
assigned_bolt: 006-llm-insights
implemented: false
---

# Story: 004-rebalancing-recommendations

## User Story

**As a** user
**I want** rebalancing recommendations based on my current vs target allocation
**So that** I can keep my portfolio aligned with my investment strategy

## Acceptance Criteria

- [ ] **Given** current allocation and a user-provided target allocation, **When** I request rebalancing, **Then** the LLM recommends specific actions (increase/decrease amounts per asset class)
- [ ] **Given** no target allocation is set, **When** requested, **Then** the LLM suggests a reasonable target based on portfolio composition and risk profile
- [ ] **Given** the portfolio is already aligned with target, **When** analyzed, **Then** the system confirms no rebalancing needed

## Technical Notes

- Target allocation stored as user preference: { stocks: 40%, mf: 30%, ppf: 15%, epf: 15% }
- API route: POST /api/v1/insights/rebalancing with optional body { targetAllocation }

## Dependencies

### Requires
- portfolio-core unit (current allocation data)
- 003-risk-analysis (contextual risk awareness)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Large deviation from target | Suggest gradual rebalancing over time |
| Locked instruments (PPF) | Note that PPF can't be reduced until maturity |
| Single account type | Suggest diversification rather than rebalancing |

## Out of Scope

- Automatic execution of rebalancing trades
- Tax-loss harvesting suggestions
