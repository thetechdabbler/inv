---
unit: 004-form-feedback
intent: 003-ux-improvements
phase: inception
status: complete
created: 2026-03-03T17:00:00.000Z
updated: 2026-03-03T17:00:00.000Z
---

# Unit Brief: Form & Feedback

## Purpose

Improve form UX across the application — account pre-selection via URL, form field reset after submission, themed confirmation dialogs, charts error handling, and replacing native select elements with shadcn Select.

## Scope

### In Scope
- Read accountId from URL params on add transaction/valuation pages
- Reset all form fields (including amount/value) after successful submission
- Replace window.confirm() with shadcn Dialog on data import
- Add error state to charts page
- Replace native select with shadcn Select in add transaction form

### Out of Scope
- New form fields or validation rules
- API changes

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-10 | Account Pre-Selection on Add Forms | Should |
| FR-11 | Form Reset After Submission | Should |
| FR-12 | Themed Confirmation Dialog for Import | Should |
| FR-14 | Charts Error Handling | Should |
| FR-15 | Replace Native Select in Add Forms | Should |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| FormState | Add form state with URL-driven defaults | accountId, fields, resetTrigger |
| ConfirmDialog | Themed confirmation modal | title, message, onConfirm, onCancel |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| preSelectAccount | Read accountId from URL and set state | searchParams | selectedAccountId |
| resetForm | Clear all fields after success | — | Empty form state |
| showConfirmDialog | Display themed confirmation | config | User choice |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 5 |
| Must Have | 0 |
| Should Have | 5 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 011-account-preselection | Pre-select account from URL param | Should | Planned |
| 012-form-reset | Reset all form fields after submission | Should | Planned |
| 013-themed-confirmation-dialog | Replace window.confirm with shadcn Dialog | Should | Planned |
| 014-charts-error-handling | Add error state to charts page | Should | Planned |
| 015-replace-native-select | Replace native select with shadcn Select | Should | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-foundation-quality | General foundation |

### Depended By
| Unit | Reason |
|------|--------|
| 005-polish-accessibility | Form improvements complete before final polish |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| None | Pure frontend changes | — |

---

## Technical Context

### Suggested Technology
- useSearchParams for URL param reading
- React state reset patterns
- shadcn Dialog component (already installed)
- shadcn Select component (already installed)

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| Add form pages | React | State management |
| Data import page | React | Dialog component |
| Charts page | React | SWR error handling |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| None | — | — | — |

---

## Constraints

- Form reset must preserve selected account for bulk entry workflow
- Confirmation dialog must match app theme (light/dark)

---

## Success Criteria

### Functional
- [ ] ?accountId=xyz pre-selects account on add pages
- [ ] All form fields clear after successful submit (except account)
- [ ] Data import uses themed Dialog instead of window.confirm()
- [ ] Charts page shows error card with retry on API failure
- [ ] Transaction type uses shadcn Select in both themes

### Non-Functional
- [ ] No regressions in existing form functionality

### Quality
- [ ] Biome lint passes
- [ ] TypeScript compiles

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 018-form-feedback | simple-construction-bolt | 011-015 | All form/feedback improvements |

---

## Notes

- The shadcn Dialog component is already installed but not used for confirmations yet
- Charts error handling should follow the same pattern as dashboard/accounts error states
