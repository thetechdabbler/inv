---

## unit: 001-portfolio-core
intent: 001-investment-tracker
phase: inception
status: draft
created: 2026-03-02T10:25:00Z
updated: 2026-03-02T10:25:00Z

# Unit Brief: Portfolio Core

## Purpose

Core domain service handling investment account management, transaction recording (investments/withdrawals), valuation tracking, and performance computation. This is the foundational unit that all other backend units depend on.

## Scope

### In Scope

- CRUD operations for investment accounts (7 types: bank deposit, stocks, MF, PPF, EPF, NPS, gratuity)
- Recording investments and withdrawals with principal tracking
- Recording point-in-time valuations
- Chronological account history
- Performance metrics: total contributions, withdrawals, P&L, percentage returns
- Prisma schema and database migrations for core entities

### Out of Scope

- Automated interest calculations (valuation-engine)
- Market data fetching (valuation-engine)
- LLM insights (llm-insights)
- Authentication and encryption (auth-security)
- UI components (investment-tracker-ui)

---

## Assigned Requirements


| FR   | Requirement                                                         | Priority |
| ---- | ------------------------------------------------------------------- | -------- |
| FR-1 | Manage Investment Accounts (CRUD with initial balances)             | Must     |
| FR-2 | Record Investments, Withdrawals and Valuations; compute performance | Must     |


---

## Domain Concepts

### Key Entities


| Entity      | Description                          | Attributes                                                             |
| ----------- | ------------------------------------ | ---------------------------------------------------------------------- |
| Account     | Investment container                 | id, type, name, description, initialBalance, createdAt, updatedAt      |
| Transaction | Investment or withdrawal record      | id, accountId, date, amount, type (investment/withdrawal), description |
| Valuation   | Point-in-time account value snapshot | id, accountId, date, value                                             |


### Key Operations


| Operation          | Description                           | Inputs                                     | Outputs                                                                 |
| ------------------ | ------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| createAccount      | Create new investment account         | type, name, description, initialBalance    | Account                                                                 |
| listAccounts       | List all accounts with current values | filters (optional)                         | Account[] with currentValue, totalContributions                         |
| updateAccount      | Update account metadata               | accountId, fields                          | Account                                                                 |
| deleteAccount      | Remove account and related data       | accountId                                  | void (cascade delete)                                                   |
| logTransaction     | Record investment or withdrawal       | accountId, date, amount, type, description | Transaction                                                             |
| logValuation       | Record current value snapshot         | accountId, date, value                     | Valuation                                                               |
| getHistory         | Get chronological account history     | accountId, dateRange                       | (Transaction | Valuation)[]                                             |
| computePerformance | Calculate P&L and returns             | accountId                                  | { contributions, withdrawals, currentValue, profitLoss, percentReturn } |


---

## Story Summary


| Metric        | Count |
| ------------- | ----- |
| Total Stories | 9     |
| Must Have     | 9     |
| Should Have   | 0     |
| Could Have    | 0     |


### Stories


| Story ID                 | Title                             | Priority | Status  |
| ------------------------ | --------------------------------- | -------- | ------- |
| 001-create-account       | Create investment account         | Must     | Planned |
| 002-list-accounts        | List accounts with current values | Must     | Planned |
| 003-update-account       | Update account details            | Must     | Planned |
| 004-delete-account       | Delete account with cascade       | Must     | Planned |
| 005-log-investment       | Record investment transaction     | Must     | Planned |
| 006-log-withdrawal       | Record withdrawal transaction     | Must     | Planned |
| 007-log-valuation        | Record valuation update           | Must     | Planned |
| 008-view-account-history | View chronological history        | Must     | Planned |
| 009-compute-performance  | Calculate P&L and returns         | Must     | Planned |


---

## Dependencies

### Depends On


| Unit | Reason                            |
| ---- | --------------------------------- |
| None | Foundation unit — no dependencies |


### Depended By


| Unit                      | Reason                                    |
| ------------------------- | ----------------------------------------- |
| 002-valuation-engine      | Needs account/transaction models and data |
| 003-llm-insights          | Needs portfolio data for analysis         |
| 005-investment-tracker-ui | Consumes portfolio APIs                   |


### External Dependencies


| System | Purpose                    | Risk |
| ------ | -------------------------- | ---- |
| None   | Self-contained core domain | —    |


---

## Technical Context

### Suggested Technology

- Prisma ORM for database schema and queries
- Next.js API routes under `/api/v1/accounts`, `/api/v1/transactions`, `/api/v1/valuations`
- Domain service layer for business logic

### Integration Points


| Integration      | Type             | Protocol                  |
| ---------------- | ---------------- | ------------------------- |
| Frontend UI      | API              | REST (Next.js API routes) |
| Valuation Engine | Internal service | Function calls            |
| LLM Insights     | Internal service | Function calls            |


### Data Storage


| Data         | Type         | Volume        | Retention |
| ------------ | ------------ | ------------- | --------- |
| Accounts     | SQL (SQLite) | ~50 records   | Permanent |
| Transactions | SQL (SQLite) | ~100K records | Permanent |
| Valuations   | SQL (SQLite) | ~50K records  | Permanent |


---

## Constraints

- Account types are a fixed enum (bank_deposit, stocks, mutual_fund, ppf, epf, nps, gratuity)
- Transactions must not create negative invested principal
- Valuations are independent of principal — they represent market/computed values
- All monetary values stored in INR (paise as integers for precision)

---

## Success Criteria

### Functional

- All 7 account types can be created, listed, updated, deleted
- Investments and withdrawals correctly adjust principal
- Valuations recorded without affecting principal
- Account history displays in chronological order
- P&L and percentage returns computed accurately

### Non-Functional

- API response time < 300ms p95
- Cascade delete removes all related transactions and valuations

### Quality

- Code coverage > 60%
- All acceptance criteria met
- Prisma migrations run cleanly

---

## Bolt Suggestions


| Bolt               | Type | Stories | Objective                             |
| ------------------ | ---- | ------- | ------------------------------------- |
| 001-portfolio-core | DDD  | 001–004 | Account CRUD and database schema      |
| 002-portfolio-core | DDD  | 005–009 | Transactions, valuations, performance |


---

## Notes

- This unit defines the Prisma schema that all other units build upon
- Account type enum should be extensible for future instrument types
- Consider using Decimal.js or storing amounts in paise (integer) to avoid floating-point issues

