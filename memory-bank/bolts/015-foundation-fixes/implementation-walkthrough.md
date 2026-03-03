# Implementation Walkthrough — 015-foundation-fixes

## Summary

This bolt delivers four foundation-level improvements that affect the entire application: a shared date formatting utility, centralized investment-type color constants, a dropdown dismiss fix, and correct sidebar navigation highlighting.

## Changes

### 1. formatDate utility (`src/lib/format.ts`)

Added `formatDate(iso)` using `Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" })`. Returns `""` for null/undefined/invalid inputs. The formatter instance is created once at module scope to avoid per-call allocation.

### 2. Shared constants (`src/lib/constants.ts`) — **New File**

Exports two maps:

- `TYPE_COLORS` — solid background classes (`bg-blue-500`, etc.) used by dashboard, transactions, and valuations pages.
- `TYPE_GRADIENTS` — gradient pairs (`from-blue-500 to-blue-600`, etc.) used by the accounts page.

All seven investment types covered: `stocks`, `mutual_fund`, `ppf`, `epf`, `nps`, `bank_deposit`, `gratuity`.

### 3. Pages updated (6 files)

| Page | Import | formatDate |
|------|--------|------------|
| `dashboard/page.tsx` | `TYPE_COLORS` from constants | n/a (no raw dates) |
| `accounts/page.tsx` | `TYPE_GRADIENTS as TYPE_COLORS` | n/a |
| `transactions/page.tsx` | `TYPE_COLORS` + `formatDate` | `{tx.date}` → `{formatDate(tx.date)}` |
| `transactions/add/page.tsx` | `TYPE_COLORS` + `formatDate` | `{tx.date}` → `{formatDate(tx.date)}` |
| `valuations/page.tsx` | `TYPE_COLORS` + `formatDate` | `{v.date}` → `{formatDate(v.date)}` |
| `valuations/add/page.tsx` | `TYPE_COLORS` + `formatDate` | `{v.date}` → `{formatDate(v.date)}` |

Local `TYPE_COLORS` definitions removed from all six files.

### 4. AccountDateFilter click-outside + Escape (`src/components/filters/AccountDateFilter.tsx`)

Added a `useEffect` that activates when `dropdownOpen` is `true`:

- **mousedown** on `document` → closes dropdown if click target is outside `dropdownRef.current`.
- **keydown** on `document` → closes dropdown on `Escape`.
- Cleanup removes both listeners.

### 5. Sidebar active state (`src/components/Layout.tsx`)

Changed `active` prop from `pathname === l.href` to:

```typescript
l.href === "/dashboard"
  ? pathname === "/dashboard"
  : pathname.startsWith(l.href)
```

Applied to both desktop and mobile nav renderings. This ensures `/transactions/add` highlights the Transactions nav item, `/valuations/add` highlights Valuations, etc., while `/dashboard` uses exact match to avoid false positives.

## Verification

- **Biome lint**: passes (0 warnings, 0 errors)
- **TypeScript**: compiles (only pre-existing test file error remains)
- **Unit tests**: 268/268 pass
- **Structural tests**: `foundation-fixes-structure.test.ts` added with 30 assertions
