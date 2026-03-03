---
stage: plan
bolt: 019-polish-accessibility
created: 2026-03-03T18:00:00Z
---

## Implementation Plan: Polish & Accessibility

### Objective
Deliver the final UX polish and accessibility improvements for search/sort on accounts, chat UX, valuation staleness indicators, keyboard-accessible data import, and logout/mobile drawer behavior, ensuring Biome and TypeScript stay green.

### Deliverables
- Search input and sort dropdown on the accounts page that work together and handle empty/no-results states.
- Chat enhancements on `InsightChat` including clear-history control, copy-to-clipboard for assistant messages, and an `aria-live="polite"` region.
- Client-side staleness badge calculation and display on valuations and dashboard views for accounts with valuations older than the configured threshold.
- Keyboard-accessible file dropzone on the data import page, including visible focus styles and Enter/Space activation.
- Import confirmation flow that offers a "Download backup first" action before running a potentially destructive import.
- Logout confirmation dialog using the existing dialog primitives, wired into the current auth/logout flow.
- Mobile drawer behavior updates with focus trapping, Escape-to-close, and appropriate ARIA roles on the backdrop and drawer container.

### Dependencies
- 016-inline-crud-pagination: CRUD and inline edit UX completed so polish does not conflict with core interactions.
- 017-account-detail-filtering: Account detail and filtering behavior in place so staleness indicators can hook into existing data flows.
- 018-form-feedback: Form validation and feedback patterns finalized so import and logout dialogs stay consistent.
- Clipboard API support in the browser, with graceful fallback if unavailable.

### Technical Approach
- Extend the existing accounts listing component to layer in client-side search and sort using React state and `useMemo`, reusing any shared formatting utilities for labels and values.
- Enhance `InsightChat` to manage message history in state with a clear-history handler, add a copy icon button on assistant messages that calls `navigator.clipboard.writeText` with a toast notification, and wrap the message list in a `aria-live="polite"` region.
- Compute valuation staleness on the client by comparing each account's latest valuation date to a configurable threshold (default 30 days), exposing an `isStale` flag that drives a badge rendered via the existing badge component on valuations and dashboard cards.
- Update the data import dropzone to be focusable with `tabIndex` and keyboard handlers for Enter/Space that open the file picker, adding visible focus styles consistent with the design system.
- Insert a pre-import confirmation dialog that offers "Download backup first" alongside the primary import confirm action, wiring the backup button to trigger an export/download using existing data export utilities where possible.
- Wrap logout in a confirmation dialog using the shared dialog component, ensuring the existing logout handler only fires on explicit confirmation.
- Adjust the mobile drawer implementation to introduce a lightweight focus trap (or small custom hook), wire Escape key handling, and ensure backdrop and drawer elements use appropriate ARIA attributes without interfering with normal tab order when closed.

### Acceptance Criteria
- [ ] Accounts page exposes search and sort controls that can be combined and degrade gracefully when cleared.
- [ ] InsightChat includes clear-history and copy-to-clipboard actions, with successful copy feedback and screen-reader-friendly updates via aria-live.
- [ ] Accounts with valuations older than the staleness threshold show a clearly styled warning badge on both the valuations page and dashboard.
- [ ] The data import dropzone is fully operable via keyboard with clear focus indication and Enter/Space activation.
- [ ] The import confirmation dialog offers an obvious "Download backup first" path that successfully exports current data before import.
- [ ] Logout requires explicit confirmation via dialog before ending the session.
- [ ] The mobile drawer traps focus while open, closes on Escape, and uses ARIA roles that align with accessibility best practices.

