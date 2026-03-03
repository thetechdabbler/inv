---
stage: design
bolt: 020-valuation-gratuity
created: 2026-03-03T19:20:00.000Z
---

## Technical Design: Valuation Engine — Gratuity

### Architecture Pattern

Reuse the existing layered / clean-style architecture from bolt 003 (interest calculators). The gratuity helper sits in the **Domain** layer as a pure calculation service and is exposed via the **Application** layer for UI/API consumption. No new database tables are required; suggestions are computed on demand and, if desired, converted into Valuation writes by application services.

### Layer Structure

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Presentation (Next.js API Routes)                                         │
│  - (Optional) /api/v1/valuations/compute/gratuity/[accountId]  (future)    │
│    Accepts: { basicSalaryInr, joiningDate, asOfDate? }                     │
│    Returns: { suggestedGratuityInr, yearsOfService }                       │
│  - Current UI can also call an internal application helper directly        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Application (Use Cases)                                                   │
│  - ComputeGratuitySuggestion                                               │
│    * Validates account, type === "gratuity"                                │
│    * Calls GratuityCalculator in domain                                    │
│    * Optionally maps suggestion into a Valuation write flow                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Domain                                                                    │
│  - GratuityCalculator (pure function/service)                              │
│  - GratuitySuggestion aggregate + value objects                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Infrastructure                                                            │
│  - Reuse AccountRepository and ValuationRepository from portfolio-core     │
│  - No new Prisma models or migrations                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### API / Application Design

Initially, the gratuity suggestion will be consumed by the UI using an **application-level helper** rather than a dedicated public API route. A thin use case function can be added in the valuation application layer:

1. **Use Case**: `computeGratuitySuggestion(accountId, basicSalaryInr, joiningDate, asOfDate)`
   - **Inputs**:
     - `accountId: string`
     - `basicSalaryInr: number`
     - `joiningDate: string | Date`
     - `asOfDate: string | Date` (defaults to today if omitted)
   - **Behavior**:
     1. Load account via existing `AccountRepository.findById`.
     2. Ensure account exists and `type === "gratuity"`.
     3. Call `GratuityCalculator.computeSuggestion(...)` in the domain.
     4. Return `{ suggestedGratuityInr, yearsOfService }` to the caller (UI or API).
   - **Output**:
     - `suggestedGratuityInr: number`
     - `yearsOfService: number`

If we later decide to expose this as an HTTP endpoint, we follow the same pattern as `/valuations/compute/ppf` with a new route:

- `POST /api/v1/valuations/compute/gratuity/[accountId]`
  - Body: `{ basicSalaryInr: number, joiningDate: "YYYY-MM-DD", asOfDate?: "YYYY-MM-DD" }`
  - Response: `201 { valuePaise, asOfDate, method: "gratuity_formula_v1" }` and optional Valuation write.

### Domain Implementation Plan

**Domain module** (e.g. `src/domain/valuation/gratuity.ts`):

1. Implement `computeServiceYears(joining: Date, asOf: Date): number`
   - Compute the full years between the two dates (floor of year difference).
   - Guard against invalid dates; return 0 for invalid or reversed ranges.

2. Implement `computeGratuity(basicSalaryInr: number, yearsOfService: number): number`
   - If `basicSalaryInr <= 0` or `yearsOfService <= 0`, return 0.
   - Otherwise compute `(15 / 26) * basicSalaryInr * yearsOfService`, rounded to two decimals.

3. Implement `GratuityCalculator.computeSuggestion(...)`
   - Accepts raw inputs (accountId, salary, joiningDate, asOfDate).
   - Performs validation and conversions.
   - Returns a `GratuitySuggestion` shape with all derived fields.

**Application module** (e.g. `src/application/valuation/compute-gratuity-suggestion.ts`):

- Wrap the domain calculator and existing repositories:
  - Fetch account, check type, delegate to domain.
  - Return a DTO friendly for UI consumption.

### Data / Persistence

- **No new tables**: The existing `Account` and `Valuation` tables remain the single sources of truth.
- GratuitySuggestion is **not** persisted as its own table; instead:
  - The suggestion is a transient object used to prefill valuation forms.
  - When the user saves, the UI posts a standard valuation (`/api/v1/valuations`) with the chosen amount.

### Error Handling

- If account is not found → surface the existing `NOT_FOUND` behavior from valuation/account routes.
- If account type is not `gratuity` → treat as a **409 ACCOUNT_TYPE_MISMATCH** in any HTTP context, or a typed error in the application layer.
- Invalid salary or dates → return a safe “no suggestion” result (`suggestedGratuityInr = 0`, `yearsOfService = 0`) and allow the caller to decide what to show.

### NFR / Quality Hooks

- Calculation remains O(1) and negligible compared to interest calculators (no history traversal).
- Unit tests will:
  - Cover typical tenure lengths (e.g. 5, 10, 20 years).
  - Cover edge cases (joining date == as-of date, negative salary, invalid dates).
- No additional performance or scaling impact; this is a pure CPU-bound helper.

### Integration with Existing Code

- Domain layer colocated with other valuation helpers under `src/domain/valuation/`.
- Application wrapper colocated with other valuation use cases under `src/application/portfolio/` or a valuation-specific submodule.
- The UI bolt (`021-ui-gratuity`) will call into the application helper from the valuation form logic rather than duplicating the formula in React components.

