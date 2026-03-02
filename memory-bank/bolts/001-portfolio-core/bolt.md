---
id: 001-portfolio-core
unit: 001-portfolio-core
intent: 001-investment-tracker
type: ddd-construction-bolt
status: planned
stories:
  - 001-create-account
  - 002-list-accounts
  - 003-update-account
  - 004-delete-account
created: 2026-03-02T10:35:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: []
enables_bolts: [002-portfolio-core]
requires_units: []
blocks: false

complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 001-portfolio-core

## Overview

First bolt for the portfolio core unit. Establishes the Prisma database schema and implements account CRUD operations — the foundation everything else builds upon.

## Objective

Define the data model (Account, Transaction, Valuation) in Prisma and implement full CRUD for investment accounts with all 7 account types.

## Stories Included

- **001-create-account**: Create investment account with type, name, initial balance (Must)
- **002-list-accounts**: List accounts with current values and contributions (Must)
- **003-update-account**: Update account metadata (Must)
- **004-delete-account**: Delete account with cascade (Must)

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
- None (first bolt — foundation)

### Enables
- 002-portfolio-core (transactions, valuations, performance)
- All other bolts depend on the schema defined here

## Success Criteria

- [ ] Prisma schema defined with Account, Transaction, Valuation models
- [ ] Migrations run successfully
- [ ] All 4 account CRUD stories implemented
- [ ] API routes: POST/GET/PATCH/DELETE /api/v1/accounts
- [ ] Tests passing

## Notes

- Account type enum: bank_deposit, stocks, mutual_fund, ppf, epf, nps, gratuity
- Store monetary values as integers (paise) to avoid floating-point issues
- Creating an account should auto-create an initial Valuation record
