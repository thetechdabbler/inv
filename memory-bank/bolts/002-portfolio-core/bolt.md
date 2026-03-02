---
id: 002-portfolio-core
unit: 001-portfolio-core
intent: 001-investment-tracker
type: ddd-construction-bolt
status: planned
stories:
  - 005-log-investment
  - 006-log-withdrawal
  - 007-log-valuation
  - 008-view-account-history
  - 009-compute-performance
created: 2026-03-02T10:35:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [001-portfolio-core]
enables_bolts: [003-valuation-engine, 005-llm-insights, 009-investment-tracker-ui]
requires_units: []
blocks: false

complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 002-portfolio-core

## Overview

Second bolt for portfolio core. Implements transaction recording (investments/withdrawals), valuation logging, account history, and performance computation.

## Objective

Enable users to record financial activity and view performance metrics (P&L, returns) for their accounts and overall portfolio.

## Stories Included

- **005-log-investment**: Record investment transaction (Must)
- **006-log-withdrawal**: Record withdrawal transaction (Must)
- **007-log-valuation**: Record valuation update (Must)
- **008-view-account-history**: View chronological history (Must)
- **009-compute-performance**: Calculate P&L and returns (Must)

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
- 001-portfolio-core (Account model and CRUD must exist)

### Enables
- 003-valuation-engine (needs transaction data for calculations)
- 005-llm-insights (needs portfolio data for analysis)
- 009-investment-tracker-ui (consumes transaction/performance APIs)

## Success Criteria

- [ ] Investment and withdrawal transactions recorded correctly
- [ ] Valuations recorded independently of principal
- [ ] Account history returns chronological unified list
- [ ] Performance metrics computed accurately (contributions, withdrawals, P&L, % return)
- [ ] Portfolio-level aggregation working
- [ ] Tests passing

## Notes

- Transaction type is an enum: investment, withdrawal
- Performance formula: P&L = currentValue - (contributions - withdrawals)
- Percentage return = P&L / netInvested * 100 (handle division by zero)
- Consider XIRR in future but simple returns for now
