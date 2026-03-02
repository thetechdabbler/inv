---
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
unit_type: frontend
default_bolt_type: simple-construction-bolt
phase: inception
status: draft
created: 2026-03-02T10:25:00Z
updated: 2026-03-02T10:25:00Z
---

# Unit Brief: Investment Tracker UI

## Purpose

Frontend application providing the complete user interface for the investment tracker — portfolio dashboard, account management forms, transaction/valuation forms, charts and visualizations, filtering, responsive layout, and LLM chat interface.

## Scope

### In Scope
- Portfolio dashboard (total value, contributions, P&L, asset allocation)
- Account management forms (add, edit, delete with confirmation)
- Transaction and valuation entry forms with validation
- Charts: line (value over time), bar (contributions vs returns), pie (allocation)
- Filtering by account and date range
- Responsive layout for desktop and mobile
- LLM chat/query interface for natural language questions
- Loading states, error handling, toast notifications

### Out of Scope
- Backend API logic (consumed from other units)
- Database operations (via API calls)
- LLM prompt engineering (llm-insights unit)
- Authentication logic (auth-security unit — UI only renders login form)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-3 | Web UI for Reporting and Analytics | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| DashboardState | Aggregated portfolio summary | totalValue, totalContributions, unrealisedPL, allocationByType |
| ChartData | Formatted data for visualizations | labels, datasets, chartType |
| FormState | Form input/validation state | fields, errors, isSubmitting |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| renderDashboard | Display portfolio summary | API data | Dashboard view |
| renderCharts | Display portfolio visualizations | API data | Charts view |
| handleFormSubmit | Process form submission | form data | API call + feedback |
| applyFilters | Filter displayed data | account, dateRange | filtered data |
| sendNLQuery | Submit natural language question | question text | LLM response display |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 7 |
| Must Have | 5 |
| Should Have | 1 |
| Could Have | 1 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-portfolio-dashboard | Portfolio dashboard with summary cards | Must | Planned |
| 002-account-management-forms | Account CRUD forms | Must | Planned |
| 003-transaction-valuation-forms | Transaction and valuation entry forms | Must | Planned |
| 004-portfolio-charts | Charts for portfolio visualization | Must | Planned |
| 005-filtering-and-search | Filter by account and date range | Must | Planned |
| 006-responsive-layout | Responsive design for desktop and mobile | Should | Planned |
| 007-llm-chat-interface | Natural language query interface | Could | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-portfolio-core | Account, transaction, valuation APIs |
| 002-valuation-engine | Computed valuation data |
| 003-llm-insights | Insight and NL query APIs |
| 004-auth-security | Auth middleware and login API |

### Depended By
| Unit | Reason |
|------|--------|
| None | End-user facing — leaf unit |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Chart.js or Recharts | Chart rendering library | Low |

---

## Technical Context

### Suggested Technology
- Next.js pages/app router for routing and SSR
- React components with TypeScript
- Recharts or Chart.js for data visualization
- React Hook Form for form management
- Tailwind CSS or shadcn/ui for styling
- SWR or React Query for data fetching and caching

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| portfolio-core | API consumer | REST (Next.js API routes) |
| valuation-engine | API consumer | REST (Next.js API routes) |
| llm-insights | API consumer | REST (Next.js API routes) |
| auth-security | API consumer | REST (Next.js API routes) |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Client state | In-memory (React state) | Minimal | Session |
| Cache | SWR/React Query cache | API responses | TTL-based |

---

## Constraints

- Must work in modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- Charts must render with < 1s time-to-interactive
- Forms must provide real-time validation feedback
- LLM query interface must handle 2-15s response times with loading states

---

## Success Criteria

### Functional
- [ ] Dashboard shows total value, contributions, P&L, allocation breakdown
- [ ] Account forms support all 7 account types with validation
- [ ] Transaction/valuation forms submit correctly
- [ ] Charts render line, bar, and pie visualizations
- [ ] Filters narrow displayed data by account and date range
- [ ] Layout adapts gracefully to mobile and desktop
- [ ] LLM chat accepts questions and displays responses

### Non-Functional
- [ ] Dashboard initial render < 2s
- [ ] Chart time-to-interactive < 1s
- [ ] Mobile Lighthouse performance score > 80

### Quality
- [ ] Component tests for key UI components
- [ ] Accessibility: keyboard navigable, ARIA labels
- [ ] Code coverage > 60%

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 009-investment-tracker-ui | Simple | 001–003 | Core UI (dashboard, account forms, transaction forms) |
| 010-investment-tracker-ui | Simple | 004–007 | Charts, filtering, responsive, LLM chat |

---

## Notes

- Consider using shadcn/ui for consistent, accessible component library
- Dashboard should be the landing page after authentication
- Charts should support export to PNG for sharing
- LLM chat interface should show loading skeleton during API calls
