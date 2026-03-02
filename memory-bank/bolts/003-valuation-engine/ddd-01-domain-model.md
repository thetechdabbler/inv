---
unit: 002-valuation-engine
bolt: 003-valuation-engine
stage: model
status: complete
updated: 2026-03-02T16:35:00Z
---

# Static Model - Valuation Engine (Interest Calculators)

## Bounded Context

**Automated Valuation — Interest-Based**. This context computes current values for predictable instruments (PPF, EPF, bank deposits) using configurable interest rates and government-style formulas. It **reads** Account and Transaction data from the Portfolio Management context (portfolio-core) and **writes** Valuation records back via the same persistence. No ownership of Account/Transaction; ownership of the **calculation rules** and **interest configuration**. Bolt 003 covers only interest calculators (PPF, EPF, deposit); market data (MF, stocks) is in bolt 004.

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **Account** | (See portfolio-core) | Consumed read-only; must exist and have type ppf, epf, or bank_deposit for these calculators. |
| **Transaction** | (See portfolio-core) | Consumed read-only; used to build running/lowest balances and principal. |
| **Valuation** | (See portfolio-core) | Written by this context; one new Valuation per successful computation (date = as-of date, valuePaise = computed value). |
| **InterestRateConfig** | id, accountType, ratePercentPerAnnum, compoundingFrequency?, effectiveFrom?, **financialYear?** | accountType ∈ {ppf, epf, bank_deposit}. **PPF/EPF**: rate is configurable **per financial year** (e.g. financialYear 2024 = April 2024–March 2025); ratePercentPerAnnum applies to that year only; multiple configs per accountType (one per year). bank_deposit: optional effectiveFrom and/or per-account; compoundingFrequency: monthly, quarterly, annual. ratePercentPerAnnum ≥ 0. |

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **AnnualRate** | ratePercentPerAnnum: number | Non-negative; e.g. 7.1 for PPF, 8.25 for EPF. |
| **FinancialYear** | year: number | Calendar year of the **start** of the financial year (e.g. 2024 = FY 2024-25, April 2024–March 2025). Used to look up PPF/EPF rate for that year. |
| **CompoundingFrequency** | value: enum | monthly, quarterly, annual — for deposit only. |
| **MonthBalance** | year, month, balancePaise | Used for PPF “lowest balance between 5th and end of month”; balance in paise (ADR-001). |
| **RunningBalance** | date, balancePaise | Used for EPF “running balance” after each transaction for monthly interest. |
| **ComputedValuation** | accountId, valuePaise, asOfDate, method | method ∈ {ppf, epf, deposit}; valuePaise integer (ADR-001). |

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **InterestRateConfig** | InterestRateConfig (root) | **PPF/EPF**: one config per accountType **per financial year** (e.g. 2024 → 7.1%, 2025 → 7.2%). bank_deposit: one per account or effectiveFrom range. No duplicate (accountType, financialYear) for ppf/epf; no duplicate (accountId or accountType, effectiveFrom) for deposit. |
| *(None for Account/Transaction/Valuation)* | *(Owned by portfolio-core)* | This context only reads Account/Transaction and appends Valuation. |

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| **ValuationComputed** | A calculator successfully produces a value and it is persisted | accountId, valuePaise, method (ppf \| epf \| deposit), asOfDate |

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **PPFCalculator** | compute(accountId, asOfDate, rateOverrides?) → ComputedValuation | Read: Account, Transaction (by accountId); Read: InterestRateConfig **by financial year** (accountType=ppf). For each financial year in scope, use configured rate for that year; if missing, use default (e.g. 7.1%). Rule: lowest balance between 5th and last day of each month; interest compounded annually (e.g. March). **Rate is per-year configurable.** |
| **EPFCalculator** | compute(accountId, asOfDate, rateOverrides?) → ComputedValuation | Read: Account, Transaction; Read: InterestRateConfig **by financial year** (accountType=epf). For each financial year in scope, use configured rate for that year; if missing, use default (e.g. 8.25%). Rule: monthly interest on running balance; credited annually. Monthly rate = annual/12. **Rate is per-year configurable.** |
| **DepositCalculator** | compute(accountId, asOfDate, ratePercent?, frequency?) → ComputedValuation | Read: Account, Transaction; Read: InterestRateConfig (accountType=bank_deposit, or per-account). Rule: A = P(1 + r/n)^(nt); n = 12 (monthly), 4 (quarterly), 1 (annual). User-configurable rate and frequency. |
| **ValuationWriter** | persistValuation(accountId, valuePaise, date) → Valuation | Infrastructure: create Valuation record (delegates to portfolio-core ValuationRepository or equivalent). |

## Repository Interfaces

| Repository | Entity | Methods |
|------------|--------|---------|
| **AccountReader** | Account | findById(accountId) — from portfolio-core. |
| **TransactionReader** | Transaction | findByAccountId(accountId, dateRange?) — from portfolio-core. |
| **ValuationWriter** | Valuation | create(accountId, date, valuePaise) — from portfolio-core. |
| **InterestRateConfigRepository** | InterestRateConfig | **findForAccountTypeAndYear(accountType, financialYear)** for PPF/EPF (returns rate for that year); **findAllYearsForAccountType(accountType)** (returns map or list of year → rate for multi-year calculations). findForAccountType(accountType, asOfDate?) for deposit; findForAccount(accountId)? (deposit overrides). save(config). |

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **PPF** | Public Provident Fund; interest on lowest balance between 5th and last day of each month; compounded annually (government formula). |
| **Lowest monthly balance** | For PPF: min(balance on 5th, balance at end of month); deposits after 5th do not count for that month’s interest. |
| **EPF** | Employees’ Provident Fund; monthly interest on running balance; credited annually. |
| **Running balance** | Balance after each transaction in order; used for EPF monthly interest. |
| **Compound interest** | A = P(1 + r/n)^(nt); r = annual rate (decimal), n = compounding frequency per year, t = time in years. |
| **Compounding frequency** | How often interest is applied: monthly (12), quarterly (4), annual (1). |
| **As-of date** | Date up to which the valuation is computed; transactions and rate effective on or before this date are included. |
| **Financial year** | For PPF/EPF: period April 1–March 31 (e.g. FY 2024-25). Rate is configured per financial year so that government-notified rate changes (e.g. annual) are applied correctly. |
| **Rate per year (PPF/EPF)** | Each financial year can have its own interest rate (e.g. 7.1% for 2024-25, 7.2% for 2025-26). Calculators look up the rate for each year when computing interest for that year. |
| **Interest rate config** | User- or system-defined rate. For PPF/EPF: one config per **financial year** per account type. For bank_deposit: per account or effectiveFrom range; optionally compounding frequency. |

## Stories Covered by This Model

1 - **001-ppf-calculation**: PPFCalculator.compute; lowest balance between 5th and month-end; **rate configurable per financial year** (default 7.1% per year when not set); output persisted as Valuation.
2 - **002-epf-calculation**: EPFCalculator.compute; monthly interest on running balance; **rate configurable per financial year** (default 8.25% per year when not set); output persisted as Valuation.
3 - **003-deposit-calculation**: DepositCalculator.compute; A = P(1+r/n)^(nt); user-specified rate and frequency (monthly/quarterly/annual); output persisted as Valuation; InterestRateConfig for bank_deposit.

## Constraints from Prior Decisions

- **ADR-001 (Integer paise)**: All monetary amounts (balances, computed value, stored Valuation) in paise. Rates as percentages or decimals for formula only; result rounded to integer paise.
