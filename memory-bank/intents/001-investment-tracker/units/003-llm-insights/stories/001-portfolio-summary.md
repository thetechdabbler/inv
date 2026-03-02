---
id: 001-portfolio-summary
unit: 003-llm-insights
intent: 001-investment-tracker
status: complete
priority: should
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 005-llm-insights
implemented: true
---

# Story: 001-portfolio-summary

## User Story

**As a** user
**I want** the system to generate a narrative summary of my portfolio's performance
**So that** I get an easy-to-understand overview highlighting gains, losses, and diversification

## Acceptance Criteria

- [ ] **Given** portfolio data (accounts, contributions, current values, account types), **When** I request a summary, **Then** the system sends structured data to OpenAI and returns a narrative summary
- [ ] **Given** the summary is generated, **When** displayed, **Then** it highlights top performers, underperformers, overall P&L, and asset diversification
- [ ] **Given** OpenAI API is unavailable, **When** summary is requested, **Then** a graceful error message is shown

## Technical Notes

- Assemble portfolio snapshot: { accounts[], totalValue, totalContributions, pnl, allocationByType }
- Use GPT-4o-mini for cost efficiency
- Prompt template should request structured analysis with sections
- API route: GET /api/v1/insights/summary

## Dependencies

### Requires
- portfolio-core unit (portfolio data)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty portfolio | Return message suggesting to add accounts |
| Single account | Summary focuses on that account's performance |
| API key not configured | Return error with setup instructions |
| Token limit exceeded | Summarize portfolio data before sending |

## Out of Scope

- Historical trend analysis across multiple summaries
- Comparison with market benchmarks
