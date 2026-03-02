---
stage: implement
bolt: 009-investment-tracker-ui
created: 2026-03-02T22:15:00Z
---

# Implementation Walkthrough: 005-investment-tracker-ui (Bolt 009)

## Summary

Core UI for the investment tracker was implemented: login and first-time setup flows, session-based redirects, dashboard with portfolio summary and allocation, account CRUD (list, add, edit, delete with confirmation), and transaction and valuation entry forms. All amounts are displayed in INR (converted from paise per ADR-001); auth uses existing passphrase and iron-session APIs (ADR-002). A logout API was added so the UI can clear the session.

## Structure Overview

App Router under `src/app`: root redirects by auth state; `/login`, `/setup`, `/dashboard`, `/accounts`, `/accounts/new`, `/accounts/[id]/edit`, `/transactions`, `/valuations`. Shared layout with header and logout wraps protected routes via `RequireAuth`. Data fetching uses SWR; forms use React Hook Form; toasts use Sonner. Styling is Tailwind CSS with a single `globals.css` importing Tailwind directives.

## Completed Work

- [x] `src/app/globals.css` - Tailwind base/components/utilities
- [x] `src/app/layout.tsx` - Root layout with Toaster (sonner)
- [x] `src/app/page.tsx` - Redirect to dashboard, login, or setup by auth state
- [x] `src/app/login/page.tsx` - Login form; redirect when not configured or already authenticated
- [x] `src/app/setup/page.tsx` - First-time passphrase setup (min 8 chars, confirm)
- [x] `src/app/dashboard/page.tsx` - Summary cards (total value, invested, P&L, account count), allocation by type, loading/error/empty states
- [x] `src/app/accounts/page.tsx` - Account list with links to edit; Add account CTA
- [x] `src/app/accounts/new/page.tsx` - Add account form (type, name, description, initial balance in INR)
- [x] `src/app/accounts/[id]/edit/page.tsx` - Edit account form; delete with confirmation
- [x] `src/app/transactions/page.tsx` - Transaction form (account, type, date, amount in INR, description)
- [x] `src/app/valuations/page.tsx` - Valuation form (account, date, value in INR)
- [x] `src/app/api/v1/auth/logout/route.ts` - POST logout clears session cookie
- [x] `src/components/RequireAuth.tsx` - Wrapper that redirects to login when not authenticated and renders Layout
- [x] `src/components/Layout.tsx` - Header nav (Dashboard, Accounts, Add Transaction, Add Valuation) and Logout
- [x] `src/hooks/useAuth.ts` - SWR-based auth status (configured, authenticated)
- [x] `src/lib/api.ts` - apiFetch with credentials, apiJson helper
- [x] `src/lib/format.ts` - paiseToInr, formatIndian (lakhs/crores), formatInr
- [x] `src/types/api.ts` - AuthStatus, AccountListItem, AccountsResponse, PerformanceSnapshot, ACCOUNT_TYPES, TRANSACTION_TYPES
- [x] `tailwind.config.js` - content paths for src
- [x] `postcss.config.js` - tailwindcss, autoprefixer

## Key Decisions

- **SWR for data**: Lightweight, credentials included via custom apiFetch; no React Query to keep deps minimal.
- **Client-side auth redirect**: useAuth + RequireAuth; root and login/setup redirect by status. No server-side session check in page components (middleware already protects API).
- **INR at UI boundary**: User inputs and displayed values in rupees; conversion to/from paise only in submit and format helpers.
- **Logout endpoint**: Added POST /api/v1/auth/logout to clear iron-session; required for header logout button.

## Deviations from Plan

- Dashboard is at `/dashboard`; root `/` only redirects. Plan said "dashboard is the landing page after login" — achieved by redirecting to `/dashboard` when authenticated.
- No separate "implementation-plan" artifact naming conflict; plan is implementation-plan.md, walkthrough is implementation-walkthrough.md per bolt type.

## Dependencies Added

- [x] `swr` - Data fetching and cache for accounts, performance
- [x] `react-hook-form` - Form state and validation for account and transaction/valuation forms
- [x] `sonner` - Toast notifications
- [x] `tailwindcss`, `postcss`, `autoprefixer` (dev) - Styling

## Developer Notes

- Run `npm run dev` and open `/`; if not configured you are sent to `/setup`, then `/login`, then `/dashboard`. API calls use credentials so session cookie is sent.
- Middleware protects `/api/v1/*` (except auth) in production; in test env auth is skipped so existing API tests do not need a session.
