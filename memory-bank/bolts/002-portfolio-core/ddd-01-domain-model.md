---
unit: 001-portfolio-core
bolt: 002-portfolio-core
stage: model
status: complete
updated: 2026-03-02T15:00:00Z
---

# Static Model - Portfolio Core (Transactions, Valuations, Performance)

## Bounded Context

**Portfolio Management** (continued from bolt 001). This bolt extends the same bounded context with transaction recording (investments/withdrawals), valuation logging, chronological account history, and performance computation. Entities **Account**, **Transaction**, and **Valuation** are already defined in bolt 001; this model focuses on the domain services, events, and read-model concepts needed for stories 005–009.

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **Account** | (See bolt 001) | Unchanged; must exist for any transaction or valuation. |
| **Transaction** | id, accountId, date, amountPaise, type, description, createdAt | type ∈ {investment, withdrawal}; amountPaise > 0; account must exist; date required; description optional. Investment increases effective contributions; withdrawal decreases them. No business rule that withdrawals ≤ contributions — user may withdraw gains. |
| **Valuation** | id, accountId, date, valuePaise, createdAt | valuePaise ≥ 0; account must exist; date required. Does not modify principal. Latest by date (then by createdAt) defines "current value" for the account. |

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **Money** | amountPaise: number | Integer (paise); non-negative where applicable; INR only (ADR-001). |
| **TransactionType** | enum | investment, withdrawal. |
| **HistoryEntry** | date, type, amountOrValuePaise, description?, createdAt | type ∈ {investment, withdrawal, valuation}; unified view for chronological history; immutable. |
| **PerformanceSnapshot** | totalContributionsPaise, totalWithdrawalsPaise, netInvestedPaise, currentValuePaise, profitLossPaise, percentReturn | Computed; percentReturn is number or null when netInvestedPaise = 0 to avoid division by zero. |

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **Account** | Account (root), Transaction (child), Valuation (child) | Same as bolt 001. Recording a transaction or valuation requires the account to exist. Transactions and valuations are created within the account boundary; no cross-account invariants for this bolt. |

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| **TransactionRecorded** | A transaction (investment or withdrawal) is successfully persisted | accountId, transactionId, type, amountPaise, date |
| **ValuationRecorded** | A valuation is successfully persisted | accountId, valuationId, valuePaise, date |

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **TransactionService** | logTransaction(accountId, date, amountPaise, type, description?) → Transaction | AccountRepository (exists), TransactionRepository (create). Validates amountPaise > 0, type ∈ {investment, withdrawal}. |
| **ValuationService** | logValuation(accountId, date, valuePaise) → Valuation | AccountRepository (exists), ValuationRepository (create). Validates valuePaise ≥ 0. |
| **HistoryService** | getAccountHistory(accountId, dateRange?) → HistoryEntry[] | TransactionRepository (findByAccountId), ValuationRepository (findByAccountId). Merges and sorts by date, then createdAt. |
| **PerformanceService** | getAccountPerformance(accountId) → PerformanceSnapshot; getPortfolioPerformance() → PerformanceSnapshot | AccountRepository, TransactionRepository, ValuationRepository. Computes: totalContributions = sum(investment.amountPaise), totalWithdrawals = sum(withdrawal.amountPaise), netInvested = totalContributions - totalWithdrawals; currentValue = latest valuation or initial balance; P&L = currentValue - netInvested; percentReturn = netInvested > 0 ? (P&L / netInvested) * 100 : null. Portfolio aggregates across all accounts. |

## Repository Interfaces

| Repository | Entity | Methods (relevant to this bolt) |
|------------|--------|---------------------------------|
| **AccountRepository** | Account | findById(id), exists(id), findAll() — already in bolt 001. |
| **TransactionRepository** | Transaction | create(transaction), findByAccountId(accountId, dateRange?) — already in bolt 001. |
| **ValuationRepository** | Valuation | create(valuation), findLatestByAccountId(accountId), findByAccountId(accountId, dateRange?) — already in bolt 001. |

No new repositories; existing interfaces support all operations for 005–009.

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Investment** | A transaction of type "investment"; increases total contributions (money put into the account). |
| **Withdrawal** | A transaction of type "withdrawal"; increases total withdrawals (money taken out); net invested = contributions - withdrawals. |
| **Valuation** | Point-in-time snapshot of account value; does not change principal; used for current value and P&L. |
| **Total contributions** | Sum of all investment transaction amounts (in paise). |
| **Total withdrawals** | Sum of all withdrawal transaction amounts (in paise). |
| **Net invested** | totalContributions - totalWithdrawals; the principal basis for P&L. |
| **Current value** | Value from the most recent Valuation for the account (by date, then creation order); if none, use account's initial balance. |
| **P&L (Profit/Loss)** | currentValue - netInvested; can be negative. |
| **Percentage return** | (P&L / netInvested) × 100 when netInvested > 0; undefined/N/A when netInvested = 0. |
| **Account history** | Chronological list of transactions and valuations for an account, merged and sorted by date (then createdAt). |
| **Portfolio performance** | Aggregated totals across all accounts: sum of contributions, withdrawals, current values, P&L, and derived portfolio-level return. |

## Stories Covered by This Model

1 - **005-log-investment**: Transaction entity, TransactionType.investment, TransactionService.logTransaction; TransactionRecorded event.
2 - **006-log-withdrawal**: TransactionType.withdrawal, same service; net contributions decrease by withdrawal amount.
3 - **007-log-valuation**: Valuation entity, ValuationService.logValuation; ValuationRecorded event; current value from latest valuation.
4 - **008-view-account-history**: HistoryService.getAccountHistory; HistoryEntry value object; merge transactions and valuations, sort by date.
5 - **009-compute-performance**: PerformanceService.getAccountPerformance and getPortfolioPerformance; PerformanceSnapshot; formulas for net invested, P&L, percent return; handle netInvested = 0.

## Constraints from Prior Decisions

- **ADR-001 (Integer paise)**: All amounts in paise (integer); display conversion only at presentation layer. Applied to Transaction.amountPaise, Valuation.valuePaise, and all performance metrics.
