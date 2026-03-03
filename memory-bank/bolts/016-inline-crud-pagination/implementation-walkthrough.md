# Implementation Walkthrough — 016-inline-crud-pagination

## Summary

This bolt adds inline edit/delete capabilities for transactions and valuations, plus "Load more" pagination across both listing pages. Full-stack changes span from repository layer through API routes to the React UI.

## Changes

### Layer 1: Repository

**`src/infrastructure/prisma/transaction-repository.ts`**
- `updateTransaction(id, data)` — partial update (date, amountPaise, type, description)
- `deleteTransaction(id)` — delete by ID, returns boolean

**`src/infrastructure/prisma/valuation-repository.ts`**
- `updateValuation(id, data)` — partial update (date, valuePaise)
- `deleteValuation(id)` — delete by ID, returns boolean

### Layer 2: Application Use Cases (4 new files)

| File | Function |
|------|----------|
| `update-transaction.ts` | Validates + delegates to repo |
| `delete-transaction.ts` | Delegates to repo |
| `update-valuation.ts` | Validates + delegates to repo |
| `delete-valuation.ts` | Delegates to repo |

### Layer 3: API Routes (2 new files)

| Route | Methods |
|-------|---------|
| `/api/v1/transactions/[id]` | `PATCH` (date, amountPaise, type, description), `DELETE` |
| `/api/v1/valuations/[id]` | `PATCH` (date, valuePaise), `DELETE` |

Both routes follow existing validation patterns (400 for invalid input, 404 for not found, 500 for server errors).

### Layer 4: History API Enhancement

**`src/application/portfolio/get-account-history.ts`**
- Added `offset` parameter to `GetAccountHistoryInput`
- Returns `AccountHistoryResult { entries, total }` instead of raw array
- Entries now include `id` field

**`src/app/api/v1/accounts/[id]/history/route.ts`**
- Added `offset` query parameter support
- Returns `{ entries, total }` in response

### Layer 5: Type Updates

**`src/domain/portfolio/types.ts`** and **`src/types/api.ts`**
- `HistoryEntry` now includes `id: string`
- `AccountHistoryResponse` now includes `total: number`

### Layer 6: Frontend — Transactions Page

**`src/app/transactions/page.tsx`**
- `TransactionRow` now has three display modes:
  - **Read** (default): Shows data + hover-visible edit/delete icon buttons
  - **Edit**: Inline form with date input, type select, amount input, save/cancel
  - **Delete**: Confirmation bar with "Delete" and "Cancel" buttons
- Mutations call `PATCH /api/v1/transactions/:id` or `DELETE /api/v1/transactions/:id`
- `useSWRConfig().mutate()` revalidates all history/account cache keys after mutations
- `toast()` for success/error feedback
- `visibleCount` state with `PAGE_SIZE = 50` — "Load more" button appends next 50
- Header shows "Showing X of Y" when paginated

### Layer 7: Frontend — Valuations Page

**`src/app/valuations/page.tsx`**
- Same pattern as transactions: read/edit/delete modes on `ValuationRow`
- Edit form: date input + value input
- Same pagination with PAGE_SIZE = 50 and "Load more"
- Same SWR cache invalidation and toast feedback

## Design Decisions

- **Hover-reveal actions**: Edit/delete buttons are invisible until row hover (`opacity-0 group-hover:opacity-100`) to keep the UI clean
- **Inline editing**: No modal or sheet — row transforms in-place to form fields, preventing layout shift by maintaining consistent row height
- **Delete confirmation**: Shows inline confirmation bar (red-tinted) instead of a dialog for faster workflow
- **Client-side pagination**: Data is fetched with `limit=500` from the API (max), then paginated client-side with `slice()`. This keeps monthly grouping intact.
- **Cache invalidation**: Uses SWR's `mutate()` with a key matcher to revalidate any cache key containing "histor" or "account"

## Verification

- **Biome lint**: passes
- **TypeScript**: compiles (only pre-existing test error)
- **Unit tests**: 305/305 existing tests pass
- **Structural tests**: `inline-crud-pagination-structure.test.ts` added with 38 assertions
