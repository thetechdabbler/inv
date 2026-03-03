---
unit: 003-account-detail-filtering
intent: 003-ux-improvements
phase: inception
status: complete
created: 2026-03-03T17:00:00.000Z
updated: 2026-03-03T17:00:00.000Z
---

# Unit Brief: Account Detail & Filtering

## Purpose

Create a dedicated read-only account detail page and add AccountDateFilter to transactions and valuations listing pages for consistent filtering across the app.

## Scope

### In Scope
- New /accounts/{id} page with tabs (Overview, Transactions, Valuations, History chart)
- AccountDateFilter on transactions listing page
- AccountDateFilter on valuations listing page
- Update account card links to point to detail page instead of edit form

### Out of Scope
- Account creation or editing (already exists)
- New API endpoints (uses existing ones with account ID filtering)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-3 | Account Detail Page | Must |
| FR-4 | Filtering on Transactions Page | Must |
| FR-5 | Filtering on Valuations Page | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| AccountDetail | Full account view | account data, transactions, valuations, history |
| FilterState | URL-based filter state | accountIds[], dateFrom, dateTo |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| loadAccountDetail | Fetch account + related data | accountId | Account with transactions, valuations, history |
| applyFilter | Filter listing by accounts/dates | filterState | Filtered list |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 3 |
| Must Have | 3 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 008-account-detail-page | Create account detail page with tabs | Must | Planned |
| 009-transactions-filtering | Add AccountDateFilter to transactions page | Must | Planned |
| 010-valuations-filtering | Add AccountDateFilter to valuations page | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-foundation-quality | Uses fixed filter dropdown, formatDate, centralized colors |

### Depended By
| Unit | Reason |
|------|--------|
| 005-polish-accessibility | Account detail enables staleness indicators |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| None | Uses existing API endpoints | — |

---

## Technical Context

### Suggested Technology
- Next.js dynamic route /accounts/[id]/page.tsx
- shadcn Tabs for detail page sections
- Reuse AccountDateFilter component (already built)
- SWR for data fetching per tab

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| /api/v1/accounts/{id} | REST | GET |
| /api/v1/accounts/{id}/history | REST | GET |
| /api/v1/transactions?accountId={id} | REST | GET |
| /api/v1/valuations?accountId={id} | REST | GET |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| None | — | — | — |

---

## Constraints

- Account detail page must work in both light and dark modes
- Filter must persist state in URL search params for shareability

---

## Success Criteria

### Functional
- [ ] /accounts/{id} shows account overview, transactions, valuations, and history chart
- [ ] Account cards on listing page link to /accounts/{id} (not /edit)
- [ ] "Edit" button on detail page links to /accounts/{id}/edit
- [ ] Transactions page has AccountDateFilter
- [ ] Valuations page has AccountDateFilter
- [ ] Filters persist in URL

### Non-Functional
- [ ] Detail page loads in < 300ms

### Quality
- [ ] Biome lint passes
- [ ] TypeScript compiles

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 017-account-detail-filtering | simple-construction-bolt | 008-010 | Account detail + filtering |

---

## Notes

- Account detail page should reuse existing chart components (PortfolioLineChart) for the history tab
- Consider lazy-loading tab content to avoid fetching all data upfront
