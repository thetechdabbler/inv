---
id: 003-risk-analysis
unit: 003-llm-insights
intent: 001-investment-tracker
status: complete
priority: should
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 005-llm-insights
implemented: true
---

# Story: 003-risk-analysis

## User Story

**As a** user
**I want** the system to identify risk factors in my portfolio
**So that** I can understand potential vulnerabilities and take corrective action

## Acceptance Criteria

- [ ] **Given** portfolio composition data, **When** I request risk analysis, **Then** the LLM identifies concentration risk, volatility exposure, and liquidity concerns
- [ ] **Given** risks are identified, **When** displayed, **Then** each risk includes severity (high/medium/low), description, and mitigation suggestion
- [ ] **Given** a well-diversified portfolio, **When** analyzed, **Then** the report acknowledges good diversification

## Technical Notes

- Send allocation percentages by asset class and individual holdings
- Risk factors to check: concentration (>50% in one type), liquidity (locked instruments like PPF), market exposure (stocks/MF volatility)
- API route: GET /api/v1/insights/risk-analysis

## Dependencies

### Requires
- portfolio-core unit (portfolio allocation data)

### Enables
- 004-rebalancing-recommendations (uses risk analysis as input context)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| 100% in one asset class | Flag severe concentration risk |
| All fixed income (PPF/EPF/FD) | Flag low growth potential, acknowledge safety |
| Empty portfolio | Return message suggesting to add accounts |

## Out of Scope

- Quantitative risk metrics (VaR, Sharpe ratio)
- Market-level risk analysis (macro conditions)
