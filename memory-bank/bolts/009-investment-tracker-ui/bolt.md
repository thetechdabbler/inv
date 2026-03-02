---
id: 009-investment-tracker-ui
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
type: simple-construction-bolt
status: planned
stories:
  - 001-portfolio-dashboard
  - 002-account-management-forms
  - 003-transaction-valuation-forms
created: 2026-03-02T10:35:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [002-portfolio-core, 007-auth-security]
enables_bolts: [010-investment-tracker-ui]
requires_units: [001-portfolio-core, 004-auth-security]
blocks: false

complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 009-investment-tracker-ui

## Overview

First bolt for the frontend. Implements the core UI: portfolio dashboard, account management forms, and transaction/valuation entry forms.

## Objective

Build the primary user interface enabling account management, transaction recording, and portfolio overview.

## Stories Included

- **001-portfolio-dashboard**: Dashboard with summary cards and allocation (Must)
- **002-account-management-forms**: Account CRUD forms with validation (Must)
- **003-transaction-valuation-forms**: Transaction and valuation entry forms (Must)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Implementation Plan**: Pending → implementation-plan.md
- [ ] **2. Implementation**: Pending → src/
- [ ] **3. Testing**: Pending → test-report.md

## Dependencies

### Requires
- 002-portfolio-core (account, transaction, valuation APIs)
- 007-auth-security (login screen and session management)

### Enables
- 010-investment-tracker-ui (charts, filtering, advanced UI)

## Success Criteria

- [ ] Dashboard displays total value, contributions, P&L, allocation
- [ ] Account forms support all 7 types with validation
- [ ] Transaction forms handle investment/withdrawal/valuation
- [ ] Loading states and error handling throughout
- [ ] Toast notifications on form submission
- [ ] Component tests passing

## Notes

- Use shadcn/ui or similar component library for consistency
- React Hook Form for form management
- SWR or React Query for data fetching
- Indian number formatting (lakhs/crores)
- Dashboard is the landing page after login
