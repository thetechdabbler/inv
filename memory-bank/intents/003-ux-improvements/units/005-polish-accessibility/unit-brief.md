---
unit: 005-polish-accessibility
intent: 003-ux-improvements
phase: inception
status: complete
created: 2026-03-03T17:00:00.000Z
updated: 2026-03-03T17:00:00.000Z
---

# Unit Brief: Polish & Accessibility

## Purpose

Final polish and accessibility improvements — search/sort on accounts, chat UX enhancements, valuation staleness indicators, keyboard-accessible drag-drop with auto-backup, and logout/drawer fixes.

## Scope

### In Scope
- Search by name and sort dropdown on accounts page
- Clear history, copy-to-clipboard, aria-live on AI Insights chat
- Staleness warning badges on valuations and dashboard for accounts not valued in >30 days
- Keyboard-accessible file dropzone on data import page
- Auto-backup download option before destructive import
- Logout confirmation dialog
- Mobile drawer focus trap, Escape key close, proper ARIA on backdrop

### Out of Scope
- Major page redesigns (already done in 002-ui-modernization)
- New features beyond the listed items

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-16 | Search & Sort on Accounts Page | Could |
| FR-17 | Chat UX Improvements | Could |
| FR-18 | Valuation Staleness Indicators | Could |
| FR-19 | Keyboard Accessible Drag-Drop & Auto-Backup | Could |
| FR-20 | Logout Confirmation & Mobile Drawer Fixes | Could |
| NFR-1 | Accessibility | Should |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| SearchSort | Client-side filter/sort state | query, sortField, sortDirection |
| StalenessCheck | Days since last valuation | accountId, lastValuationDate, isStale |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| searchAccounts | Filter accounts by name | query string | Filtered accounts |
| sortAccounts | Sort by field | field, direction | Sorted accounts |
| checkStaleness | Determine if account needs valuation | account, threshold days | isStale boolean |
| copyToClipboard | Copy message text | message text | Clipboard write |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 5 |
| Must Have | 0 |
| Should Have | 0 |
| Could Have | 5 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 016-search-sort-accounts | Add search and sort to accounts page | Could | Planned |
| 017-chat-improvements | Chat clear history, copy, aria-live | Could | Planned |
| 018-staleness-indicators | Show stale valuation warnings | Could | Planned |
| 019-keyboard-dragdrop-autobackup | Keyboard a11y on dropzone + auto-backup | Could | Planned |
| 020-logout-drawer-fixes | Logout confirmation + mobile drawer a11y | Could | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 002-crud-pagination | CRUD complete before adding polish |
| 003-account-detail-filtering | Account detail enables staleness context |
| 004-form-feedback | Form improvements done before final polish |

### Depended By
| Unit | Reason |
|------|--------|
| None | Final unit |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Clipboard API | Copy to clipboard | Low — widely supported |

---

## Technical Context

### Suggested Technology
- Client-side filtering/sorting with useMemo
- navigator.clipboard.writeText for copy
- Date comparison for staleness checks
- tabIndex + onKeyDown for keyboard-accessible dropzone
- shadcn Dialog for logout confirmation
- Focus trap library or custom hook for mobile drawer

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| Accounts page | React | State management |
| InsightChat | React | Component enhancement |
| Data page | React | Keyboard event handlers |
| Layout | React | Drawer + logout dialog |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| None | — | — | — |

---

## Constraints

- Staleness threshold should be configurable (default 30 days)
- Copy-to-clipboard must handle browsers without Clipboard API gracefully
- Focus trap must not break normal tab order when drawer is closed

---

## Success Criteria

### Functional
- [ ] Accounts page has search input and sort dropdown
- [ ] Chat has clear history button, copy icon on assistant messages
- [ ] Stale accounts show warning badge on valuations and dashboard
- [ ] Dropzone is keyboard-operable (Tab, Enter/Space)
- [ ] Auto-backup offered before import in confirmation dialog
- [ ] Logout shows confirmation dialog
- [ ] Mobile drawer traps focus, closes on Escape

### Non-Functional
- [ ] All custom widgets have proper ARIA roles
- [ ] aria-live region on chat for screen readers

### Quality
- [ ] Biome lint passes
- [ ] TypeScript compiles

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 019-polish-accessibility | simple-construction-bolt | 016-020 | Final polish and a11y |

---

## Notes

- Focus trap can use a lightweight custom hook rather than adding a dependency
- Staleness check can be computed client-side from existing valuation data
- Search/sort state can optionally persist in URL params
