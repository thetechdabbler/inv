---
stage: plan
bolt: 009-investment-tracker-ui
created: 2026-03-02T21:50:00Z
---

# Implementation Plan: 005-investment-tracker-ui (Bolt 009)

## Objective

Build the core UI for the investment tracker: portfolio dashboard (landing after login), account CRUD forms with validation, and transaction/valuation entry forms. All amounts displayed in INR; backend uses paise (ADR-001). Auth is passphrase + iron-session (ADR-002); UI consumes login/setup/status and shows dashboard only when authenticated.

## Deliverables

1 - **Login and auth flow**
   - Login page (passphrase input) at `/login`; redirect to dashboard on success.
   - First-time setup flow (or link from login when not configured) calling `POST /api/v1/auth/setup`.
   - Session check via `GET /api/v1/auth/status`; redirect unauthenticated users from dashboard to `/login`.

2 - **Dashboard (landing page)**
   - Route: `/` or `/dashboard` as the post-login home.
   - Summary cards: Total portfolio value, Total contributions, Unrealised P&L (value and %), Number of accounts.
   - Asset allocation breakdown by account type (percentage and absolute).
   - Loading skeletons while data is fetched; empty state with CTA to create first account when no accounts.
   - Indian number formatting (lakhs/crores) for large values; error state with retry on API failure.

3 - **Account management forms**
   - List accounts (from `GET /api/v1/accounts`); add “Add Account” opening a form (type, name, description, initial balance).
   - Account types: bank_deposit, stocks, mutual_fund, ppf, epf, nps, gratuity (dropdown).
   - Edit: pre-fill form from existing account; submit to `PATCH /api/v1/accounts/:id`.
   - Delete: confirmation dialog; on confirm call `DELETE /api/v1/accounts/:id?confirm=true`; toast and refresh list.

4 - **Transaction and valuation forms**
   - Transaction form: account selector, type (investment/withdrawal), date, amount (INR), optional description; submit to `POST /api/v1/transactions` (or equivalent).
   - Valuation form: account selector, date, current value; submit to valuation API.
   - Success: toast notification and refresh dashboard/account context; validation (required fields, amount >= 0, date).

5 - **Shared UI concerns**
   - Loading states for all data fetches; error boundaries or error states with retry where appropriate.
   - Toast notifications for form success/failure (e.g. react-hot-toast or sonner).
   - Consistent layout (header with logout, main content area); responsive basics (mobile-friendly).

## Dependencies

- **Backend APIs** (existing): accounts CRUD, performance/summary, transactions, valuations, auth (setup, login, status). Base path `/api/v1`.
- **Next.js App Router**: Use `src/app` (existing); add routes e.g. `app/login/page.tsx`, `app/dashboard/page.tsx`, `app/accounts/...`, `app/transactions/...` as needed.
- **Libraries to add**: Data fetching (SWR or TanStack Query), form handling (React Hook Form), toast (e.g. sonner or react-hot-toast), and optionally UI component library (shadcn/ui) per unit brief and bolt notes.

## Technical Approach

- **Auth**: Client-side redirect based on `GET /api/v1/auth/status` (credentials: include for cookies). Login and setup pages call auth APIs; on success redirect to dashboard.
- **Data fetching**: Use SWR or React Query for accounts, performance summary, and list data; cache and revalidate after mutations.
- **Forms**: React Hook Form with validation (e.g. zod or yup) for account and transaction/valuation forms; submit via fetch to existing API routes.
- **Amounts**: All API amounts are in paise (ADR-001). Display layer converts paise → INR for user (divide by 100, format with Indian number style where appropriate).
- **Structure**: Feature-oriented under `src/app` (dashboard, login, accounts, transactions/valuations); shared components (e.g. layout, toasts, formatCurrency) in a shared location (e.g. `src/components` or under `app`).
- **Styling**: Tailwind CSS (if already present) or add it; optional shadcn/ui for consistent components. No new backend; frontend only.

## Acceptance Criteria

- [ ] **001-portfolio-dashboard**: Dashboard shows total value, contributions, unrealised P&L, allocation by type; loading skeletons; empty state with CTA; Indian formatting; error state with retry.
- [ ] **002-account-management-forms**: Add account (type, name, description, initial balance) with validation; edit pre-filled; delete with confirmation; toasts on success/failure.
- [ ] **003-transaction-valuation-forms**: Transaction form (account, type, date, amount, description) and valuation form (account, date, value); success toast and refresh; validation.
- [ ] Login/setup flow and session-based redirect; dashboard is landing after login.
- [ ] Loading states and error handling throughout; toasts on form submission outcomes.

## Out of Scope (this bolt)

- Charts, filtering, responsive polish, LLM chat (bolt 010).
- Backend API changes; only consuming existing endpoints.
