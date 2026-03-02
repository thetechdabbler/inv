---
intent: 001-investment-tracker
phase: inception
status: units-defined
updated: 2026-03-02T10:25:00Z
---

# Units: Investment Tracker

## Requirement-to-Unit Mapping

- **FR-1**: Manage Investment Accounts → `001-portfolio-core`
- **FR-2**: Record Investments, Withdrawals and Valuations → `001-portfolio-core`
- **FR-3**: Web UI for Reporting and Analytics → `005-investment-tracker-ui`
- **FR-4**: Automated Data Fetching and Calculations → `002-valuation-engine`
- **FR-5**: LLM-Powered Insights → `003-llm-insights`
- **FR-6**: Security and Data Management → `004-auth-security`
- **FR-7**: Extensibility and Maintenance → Cross-cutting (applied across all units)

## Unit Summary

| Unit | Type | Bolt Type | FRs | Stories | Priority |
|------|------|-----------|-----|---------|----------|
| 001-portfolio-core | backend | ddd-construction-bolt | FR-1, FR-2 | 9 | Must |
| 002-valuation-engine | backend | ddd-construction-bolt | FR-4 | 5 | Should |
| 003-llm-insights | backend | ddd-construction-bolt | FR-5 | 6 | Should |
| 004-auth-security | backend | ddd-construction-bolt | FR-6 | 6 | Should |
| 005-investment-tracker-ui | frontend | simple-construction-bolt | FR-3 | 7 | Must |

## Dependency Graph

```text
001-portfolio-core ──────────────────────────► 005-investment-tracker-ui
        │                                              ▲
        ▼                                              │
002-valuation-engine ──────────────────────────────────┘
        │                                              │
003-llm-insights ──────────────────────────────────────┘
        │                                              │
004-auth-security ─────────────────────────────────────┘
```

## Execution Order

1. **001-portfolio-core** — Foundation: accounts, transactions, valuations, performance (no dependencies)
2. **004-auth-security** — Can run in parallel with portfolio-core (independent)
3. **002-valuation-engine** — Depends on portfolio-core (needs account/transaction models)
4. **003-llm-insights** — Depends on portfolio-core (needs portfolio data)
5. **005-investment-tracker-ui** — Depends on all backend units (consumes their APIs)
