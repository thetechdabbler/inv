---
stage: model
bolt: 020-valuation-gratuity
created: 2026-03-03T19:15:00.000Z
---

## Static Model: Valuation Engine — Gratuity

### Bounded Context

**Automated Valuation — Gratuity**. This sub-context of the valuation engine computes a **suggested gratuity value** for gratuity accounts based on current basic salary, joining date, and valuation date. It **reads** Account data (type and identifiers) from the Portfolio Management context (portfolio-core) and produces **in-memory suggestions** that can be persisted as Valuation records via existing application logic. It does **not** persist any new domain state beyond what portfolio-core already stores (Account, Valuation).

### Entities

1. **GratuitySuggestion**
   - **Properties**:
     - `accountId: string`
     - `asOfDate: Date`
     - `basicSalaryInr: number`
     - `yearsOfService: number`
     - `suggestedGratuityInr: number`
     - `method: "gratuity_formula_v1"`
   - **Business Rules**:
     - `yearsOfService` is the full number of years between joining date and as-of date; must be ≥ 0.
     - If `yearsOfService <= 0` or `basicSalaryInr <= 0`, then `suggestedGratuityInr` MUST be 0.
     - For valid inputs, `suggestedGratuityInr = (15 / 26) * basicSalaryInr * yearsOfService`, rounded to 2 decimals.
     - The suggestion is **advisory**; callers may override the amount before creating a Valuation.

2. **Account** (from portfolio-core, referenced)
   - **Properties**: `id`, `type`, `name`, ...
   - **Business Rules (within this context)**:
     - Only accounts with `type === "gratuity"` are eligible for gratuity suggestions.

### Value Objects

1. **BasicSalary**
   - **Properties**:
     - `amountInr: number`
   - **Constraints**:
     - `amountInr > 0` for a valid salary; non-positive values treated as invalid input for suggestion.

2. **JoiningDate**
   - **Properties**:
     - `value: Date`
   - **Constraints**:
     - Must be a valid calendar date.

3. **ServiceYears**
   - **Properties**:
     - `years: number` (integer)
   - **Constraints**:
     - `years >= 0`.
     - Computed as full years between JoiningDate and as-of Date (floor of year difference).

4. **GratuityFormula**
   - **Properties**:
     - `multiplierNumerator: 15`
     - `multiplierDenominator: 26`
   - **Constraints**:
     - Formula version is fixed for `gratuity_formula_v1`, but kept as a separate concept so it can be swapped or updated later without changing callers.

### Aggregates

- **GratuitySuggestion** (aggregate root)
  - **Members**:
    - `BasicSalary`
    - `JoiningDate`
    - `ServiceYears`
    - `GratuityFormula`
  - **Invariants**:
    - For valid inputs, `suggestedGratuityInr` MUST equal formula(BasicSalary, ServiceYears).
    - For invalid inputs (non-positive salary or `ServiceYears <= 0`), `suggestedGratuityInr` MUST be 0.

### Domain Events

1. **GratuitySuggestionComputed**
   - **Trigger**: A gratuity suggestion is successfully computed for a gratuity account.
   - **Payload**:
     - `accountId`
     - `asOfDate`
     - `basicSalaryInr`
     - `yearsOfService`
     - `suggestedGratuityInr`
     - `method`

### Domain Services

1. **GratuityCalculator**
   - **Operations**:
     - `computeSuggestion(accountId, basicSalaryInr, joiningDate, asOfDate) → GratuitySuggestion`
   - **Responsibilities**:
     - Validate inputs (gratuity account type enforced by caller/application).
     - Derive `ServiceYears` from `joiningDate` and `asOfDate`.
     - Apply `GratuityFormula` to compute `suggestedGratuityInr`.
     - Emit `GratuitySuggestionComputed` (internally) for logging/metrics.
   - **Dependencies**:
     - Reads Account metadata (type, id) via existing Account reader (to guard against non-gratuity accounts if needed).

### Repository Interfaces

- **None new required for this bolt**:
  - Suggestions can be computed in-memory and passed to existing application services that create Valuation records.
  - If persisted suggestions are needed later, a dedicated `GratuitySuggestionRepository` can be introduced without changing the core calculator contract.

### Ubiquitous Language

1. **Basic Salary**: The employee’s current monthly basic salary used as the base for gratuity calculation (in INR).
2. **Joining Date**: The date the employee joined the employer; used to compute years of service.
3. **Years of Service**: Full years between joining date and the valuation (as-of) date; partial years below one year do not count.
4. **Gratuity Suggestion**: The system’s computed gratuity amount based on basic salary and years of service, before any user override.
5. **Gratuity Formula v1**: The specific rule `Gratuity = (15/26) × S × Y`, where S is current basic salary and Y is years of service.

### Stories Covered by This Model

1 - **006-gratuity-suggestion**: GratuityCalculator.computeSuggestion builds a `GratuitySuggestion` aggregate from BasicSalary, JoiningDate, ServiceYears and GratuityFormula, and exposes a suggested gratuity amount for use by the UI and application layer.

