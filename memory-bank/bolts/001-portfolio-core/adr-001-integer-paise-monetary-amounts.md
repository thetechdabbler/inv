---
bolt: 001-portfolio-core
created: 2026-03-02T11:05:00Z
status: accepted
superseded_by: null
---

# ADR-001: Store All Monetary Amounts as Integer Paise (INR)

## Context

The investment tracker handles money in Indian Rupees (INR) across accounts, transactions, and valuations. We need a consistent, safe representation that avoids floating-point precision errors, works well with SQLite and Prisma, and is unambiguous for APIs and UI. The unit brief and technical design already specify paise; this ADR records the decision and rationale so future bolts (valuation-engine, LLM insights, UI) and agents apply it consistently.

## Decision

**All monetary amounts in the system are stored and transmitted as non-negative integers in paise** (1 INR = 100 paise). This applies to: account initial balance, transaction amounts, valuation values, and any derived values (e.g. total contributions, current value, P&L) in the database and in API request/response bodies. Display conversion (paise → INR) is done only at the presentation layer (UI or API response formatting).

## Rationale

- **Precision**: Integers avoid float rounding errors when summing or comparing amounts (e.g. many small transactions, or percentage returns).
- **Simplicity**: No Decimal library or custom type in the core domain; Prisma and JSON handle integers natively.
- **Clarity**: One unit everywhere (paise) removes ambiguity; frontend and reporting can convert once at the edge.
- **INR scope**: The product targets Indian instruments; multi-currency is out of scope for now. If we add other currencies later, we can introduce a currency code and still use smallest-unit integers per currency.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Float/double (rupees) | Simple, human-readable | Precision errors when summing; not acceptable for money | Unacceptable for financial data |
| Decimal/Decimal.js (rupees) | Exact decimal math | Extra dependency; Prisma/JSON handling heavier; schema less uniform | Added complexity without need for single-currency paise |
| Integer rupees | Still exact | Loses sub-rupee precision (e.g. mutual fund NAVs, small interest) | Paise is finer and future-proof for fractional values |
| String amounts | No precision loss if used carefully | No arithmetic in DB; easy to misuse; type safety lost | Not appropriate for computed fields and queries |

## Consequences

### Positive

- No floating-point bugs in calculations (performance, P&L, returns).
- Consistent type across DB, API, and domain; easy to validate (integer ≥ 0).
- Simple indexing and sorting; efficient in SQLite and Prisma.
- Clear contract for API consumers: "amounts are in paise".

### Negative

- Frontend and reports must convert paise → INR (or format with 2 decimal places) for display; small, one-time convention.
- Large values (e.g. crores) are large integers; still within safe integer range (2^53 in JSON); no issue for personal portfolio scale.

### Risks

- **Risk**: New features (e.g. a new API or import) might introduce amounts in rupees or floats.  
  **Mitigation**: Document in API contract and coding standards; code review and tests assert integer paise at boundaries.

## Related

- **Stories**: 001-create-account, 002-list-accounts, and all transaction/valuation stories in portfolio-core and valuation-engine.
- **Standards**: Can be added to data-stack or api-conventions as "Monetary amounts: integer paise (INR)".
- **Previous ADRs**: None.
