---
stage: plan
bolt: 018-form-feedback
created: 2026-03-03T21:30:00Z
---

## Implementation Plan: Form & Feedback

### Objective

Improve form and feedback UX: account pre-selection from URL, full form reset after submit, themed confirmation dialog for import, charts error handling, and shadcn Select for transaction type.

### Deliverables

1. **Account pre-selection (011)**  
   On `/transactions/add` and `/valuations/add`, read `?accountId=xyz` from URL and pre-select that account in the sidebar. No error if ID does not match.

2. **Form reset (012)**  
   After successful submission on add transaction and add valuation forms: clear amount/value, date, and description. Keep selected account for bulk entry.

3. **Themed confirmation dialog (013)**  
   Replace `window.confirm()` in the data import flow with shadcn Dialog: warning message, Cancel/Confirm, themed for light and dark.

4. **Charts error handling (014)**  
   On charts page, show error card with Retry when SWR fails; match dashboard/accounts error pattern.

5. **Replace native select (015)**  
   Use shadcn Select for transaction type on `/transactions/add`; keep all options and correct light/dark styling; form submission unchanged.

### Dependencies

- **015-foundation-fixes**: General foundation (already complete).
- **Existing UI**: shadcn Dialog and Select already installed; dashboard/accounts error cards as reference.

### Technical Approach

- **011**: `useSearchParams()` on add pages; on mount, if `accountId` matches an account in the list, set it as selected (e.g. setState or default value).
- **012**: On success callback, reset form state (amount/value, date, description); do not clear account selection. Use existing form library (e.g. react-hook-form reset) or manual state reset.
- **013**: Locate data import usage of `window.confirm`; replace with controlled Dialog (open state, onConfirm proceeds with import, onCancel closes).
- **014**: Use SWR `error` and `mutate` for retry; render error card with message and Retry button when `error` is set; mirror dashboard/accounts layout and copy.
- **015**: Replace `<select>` for transaction type with shadcn `<Select>`, same options (investment/withdrawal); ensure value is still submitted correctly.

### Acceptance Criteria

- [ ] `?accountId=xyz` pre-selects account on add transaction and add valuation pages
- [ ] Amount/value, date, and description reset after successful submit; selected account persists
- [ ] Data import uses shadcn Dialog confirmation (no `window.confirm`)
- [ ] Charts page shows error card with Retry on API failure
- [ ] Transaction type uses shadcn Select on add transaction page (light/dark)
- [ ] Biome lint passes; TypeScript compiles
