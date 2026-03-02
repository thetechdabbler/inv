---
unit: 001-portfolio-core
bolt: 001-portfolio-core
stage: model
status: complete
updated: 2026-03-02T10:45:00Z
---

# Static Model - Portfolio Core (Account CRUD)

## Bounded Context

**Portfolio Management** — The context within which users create and manage investment accounts, and the system maintains account metadata, initial balances, and referential integrity for related transactions and valuations. This bolt covers the **Account** aggregate only; transaction and valuation recording are in a subsequent bolt, but the data model for all three entities is defined here as the shared foundation.

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **Account** | id, type, name, description, initialBalancePaise, createdAt, updatedAt | type ∈ {bank_deposit, stocks, mutual_fund, ppf, epf, nps, gratuity}; name required, non-empty; initialBalancePaise ≥ 0; description optional; on create, an initial Valuation is recorded with value = initialBalancePaise and date = createdAt |
| **Transaction** | id, accountId, date, amountPaise, type, description, createdAt | type ∈ {investment, withdrawal}; amountPaise > 0; account must exist; date required; description optional; used in bolt 002 |
| **Valuation** | id, accountId, date, valuePaise, createdAt | valuePaise ≥ 0; account must exist; date required; does not modify invested principal; latest valuation per account defines "current value" |

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **AccountType** | enum | bank_deposit, stocks, mutual_fund, ppf, epf, nps, gratuity — fixed set for Indian instruments |
| **TransactionType** | enum | investment, withdrawal |
| **Money** | amountPaise: number | Integer (paise); avoids float precision issues; INR only |
| **AccountName** | value: string | Non-empty, max length 100; trimmed |

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **Account** | Account (root), Transaction (child), Valuation (child) | Name required; initialBalancePaise ≥ 0; type required; on delete, all related Transaction and Valuation records are removed (cascade); no orphan transactions or valuations |

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| **AccountCreated** | Account aggregate created with valid type, name, initial balance | accountId, type, name, initialBalancePaise, initialValuationId |
| **AccountUpdated** | Account name, description, or type changed | accountId, changedFields |
| **AccountDeleted** | User confirms account deletion | accountId, deletedTransactionCount, deletedValuationCount |

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **AccountService** | createAccount(type, name, description?, initialBalancePaise), listAccounts(filters?), getAccountById(id), updateAccount(id, fields), deleteAccount(id, confirm) | AccountRepository, ValuationRepository (for initial valuation on create) |
| **AccountQueryService** | getCurrentValue(accountId) — resolves latest Valuation for account; getTotalContributions(accountId) — sum of investment transactions (deferred to bolt 002) | AccountRepository, ValuationRepository |

Repository interfaces below; total contributions and performance are implemented in bolt 002.

## Repository Interfaces

| Repository | Entity | Methods |
|------------|--------|---------|
| **AccountRepository** | Account | create(account), findById(id), findAll(filters?), update(id, partial), delete(id); exists(id) |
| **ValuationRepository** | Valuation | create(valuation), findLatestByAccountId(accountId), findByAccountId(accountId, dateRange?) — used for list "current value" and history |
| **TransactionRepository** | Transaction | create(transaction), findByAccountId(accountId, dateRange?) — used in bolt 002 for history and contributions |

Persistence: Prisma with SQLite. Account delete enforces cascade of Transaction and Valuation (Prisma relation onDelete: Cascade).

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Account** | An investment container (e.g. a bank FD, brokerage account, PPF account) identified by type, name, and initial balance; holds the lifecycle for its transactions and valuations |
| **Initial balance** | The amount (in paise) the user declares as the starting position when creating an account; persisted and used as the first valuation |
| **Current value** | The value of an account on a given date; for listing, the value from the most recent Valuation record |
| **Transaction** | A recorded investment (contribution) or withdrawal; affects net invested principal; has date, amount, type, optional description |
| **Valuation** | A point-in-time snapshot of an account’s value; does not change principal; used for performance and "current value" |
| **Paise** | Smallest currency unit (1 INR = 100 paise); all monetary amounts stored as integers in paise |
| **Cascade delete** | When an account is deleted, all its transactions and valuations are deleted and must not remain in the system |
| **Account type** | One of: bank_deposit, stocks, mutual_fund, ppf, epf, nps, gratuity |

## Stories Covered by This Model

1 - **001-create-account**: Account entity, AccountType, Money, createAccount → AccountCreated, initial Valuation created.
2 - **002-list-accounts**: AccountRepository.findAll, ValuationRepository.findLatestByAccountId for current value; total contributions (query) deferred to bolt 002.
3 - **003-update-account**: AccountRepository.update for name, description, type; AccountUpdated event.
4 - **004-delete-account**: AccountRepository.delete with cascade; AccountDeleted event; confirmation required at application/API layer.
