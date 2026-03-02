---
intent: 001-investment-tracker
phase: inception
status: inception-complete
created: 2026-03-02T10:15:00Z
updated: 2026-03-02T10:20:00Z
---

# Requirements: Investment Tracker

## Intent Overview

Build a personal investment tracker that makes it easy to record deposits and withdrawals, monitor current values and performance, and generate projections and analytics. Supports common Indian account types — bank deposits, stock brokerage, mutual funds, PPF, EPF, NPS and gratuity — without requiring full historical records. Users set an initial balance and then log subsequent investments, withdrawals and periodic valuation updates.

Next.js full-stack application using API routes for the backend, SQLite/Prisma for storage. LLM-powered insights via OpenAI API for projections, risk analysis and rebalancing suggestions. Automated market data fetching (mfapi.in for mutual funds, Yahoo Finance for stocks) and interest rate calculations for predictable instruments (PPF, EPF, bank deposits).

Single-user personal application with passphrase-based access control.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Track all personal investments in one place | All 7 account types supported with CRUD | Must |
| Record and view transaction history | Investments, withdrawals, valuations logged with chronological history | Must |
| Portfolio dashboard with visualizations | Dashboard renders with charts, P&L, asset allocation | Must |
| Automated valuation for predictable instruments | PPF/EPF/deposit values auto-calculated within 0.1% accuracy | Should |
| Market data integration for stocks/MFs | Auto-fetch prices from mfapi.in / Yahoo Finance | Should |
| AI-powered financial insights | LLM generates projections, risk analysis, rebalancing suggestions | Should |
| Secure personal financial data | Passphrase lock, encrypted storage, audit logs | Should |

---

## Functional Requirements

### FR-1: Manage Investment Accounts
- **Description**: CRUD operations for investment accounts (bank deposits, stocks, mutual funds, PPF, EPF, NPS, gratuity) with initial balances
- **Acceptance Criteria**:
  1. Add account with type, name, description, and initial balance; persist in SQLite via Prisma
  2. List accounts showing type, name, initial balance, current value (latest valuation), and total contributions
  3. Update account details without affecting transaction or valuation history
  4. Delete account with confirmation; cascade-delete related transactions and valuations
- **Priority**: Must
- **Related Stories**: TBD

### FR-2: Record Investments, Withdrawals and Valuations
- **Description**: Log contributions and withdrawals per account; record point-in-time valuations; compute performance metrics
- **Acceptance Criteria**:
  1. Log investment with account, date, amount, optional description; increases invested principal
  2. Log withdrawal with account, date, amount, optional description; reduces invested principal
  3. Log valuation update with account, date, current value; does not modify invested principal
  4. View account history showing all investments, withdrawals, and valuations in chronological order
  5. Compute and display total contributions, total withdrawals, current value, profit/loss (current value minus net contributions), and percentage returns
- **Priority**: Must
- **Related Stories**: TBD

### FR-3: Web UI for Reporting and Analytics
- **Description**: Rich Next.js web interface with dashboard, charts, filtering, forms, responsive design
- **Acceptance Criteria**:
  1. Dashboard summarizing total portfolio value, total contributions, unrealised profit/loss, and asset allocation by account type
  2. Charts (line, bar, pie) for account value over time, contributions vs returns, and allocation by asset class
  3. Filter transactions and valuations by account and date range
  4. Forms to add/edit/delete accounts, investments, withdrawals, and valuations with validation feedback
  5. Responsive layout for desktop and mobile viewports
- **Priority**: Must
- **Related Stories**: TBD

### FR-4: Automated Data Fetching and Calculations
- **Description**: Auto-fetch market data for stocks/MFs; compute returns for PPF (7.1% p.a.), EPF (8.25% p.a.), bank deposits; allow manual overrides
- **Acceptance Criteria**:
  1. Mutual fund NAV fetching via mfapi.in (free, no API key); compute current value from units held × latest NAV
  2. Stock price fetching via Yahoo Finance API; compute current value from shares × latest price; API key configurable via env var
  3. PPF calculation using government-notified rate (7.1% p.a. FY 2025-26) compounded annually on lowest monthly balance; user-overridable rate
  4. EPF calculation using official rate (8.25% p.a. FY 2025-26) with monthly compounding and annual crediting; user-overridable rate
  5. Bank deposit calculation with user-specified interest rate and compounding frequency (monthly/quarterly/annual)
  6. Manual valuation overrides always available; automated calculations do not prevent manual updates
- **Priority**: Should
- **Related Stories**: TBD

### FR-5: LLM-Powered Insights
- **Description**: AI-powered narrative summaries, projections, risk analysis, rebalancing recommendations, and natural language queries via OpenAI API
- **Acceptance Criteria**:
  1. Portfolio summary: send structured data (contributions, current values, account types, rates) to OpenAI API; return narrative summary highlighting gains, losses, diversification
  2. Projections: user specifies time horizon (e.g., 5/10/15 years); LLM returns projected future values with confidence intervals using historical returns and current rates
  3. Risk analysis: LLM identifies risk factors (volatility, concentration) from portfolio composition and suggests mitigation strategies
  4. Rebalancing: compute current allocation vs user-provided target allocation; LLM recommends rebalancing actions
  5. Natural language queries: UI text input for questions (e.g., "What is my projected PPF balance in 15 years?"); system translates to prompts and displays LLM response
  6. Audit trail: all LLM queries and responses logged with timestamps
- **Priority**: Should
- **Related Stories**: TBD

### FR-6: Security and Data Management
- **Description**: Passphrase-based access control, encrypted storage, config management, backup/export, access logs
- **Acceptance Criteria**:
  1. Passphrase lock: user sets a passphrase on first use; subsequent access requires passphrase; passphrase hashed and salted (bcrypt)
  2. Application-layer encryption for sensitive fields (account balances, transaction amounts) using AES-256
  3. API keys (OpenAI, market data) stored in environment variables / .env file excluded from version control
  4. Export data in JSON and CSV formats; import from JSON/CSV for backup restoration
  5. Access logs recording login attempts and changes to critical data (account creation, transaction deletion)
- **Priority**: Should
- **Related Stories**: TBD

### FR-7: Extensibility and Maintenance
- **Description**: Modular architecture, API versioning, testing, documentation, internationalisation readiness
- **Acceptance Criteria**:
  1. Codebase organised into domain modules: database/Prisma layer, business logic/services, Next.js API routes, React UI components, LLM integration module, data fetcher module; clear interfaces between modules
  2. API routes versioned under `/api/v1/` to allow future changes without breaking clients
  3. Unit and integration tests via Vitest covering critical functionality; interest calculations for PPF (7.1%) and EPF (8.25%) verified against known values
  4. Developer documentation: API reference, data model definitions, local setup instructions
  5. Currency formatting and text strings abstracted for future internationalisation
- **Priority**: Should
- **Related Stories**: TBD

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| API response time | p95 latency | < 300ms |
| Dashboard load | Initial render (SSR) | < 2s |
| Chart rendering | Time to interactive | < 1s |
| Interest calculations | Computation time | < 100ms per account |

### Scalability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Accounts | Per user | 50+ |
| Transactions | Total records | 100K+ |
| Valuations | Total records | 50K+ |
| Concurrent users | Single-user app | 1 (personal tracker) |

### Security
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Access control | Passphrase (bcrypt) | Single-user, no registration flow |
| Data at rest | AES-256 app-layer encryption | Sensitive financial fields |
| API keys | Environment variables | .env excluded from VCS |
| Audit | Access + change logs | Login attempts, critical mutations |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Data integrity | Backup/restore | JSON/CSV export on demand |
| Error handling | Graceful failures | No data loss on errors |
| Market data fallback | Degradation | Manual entry when APIs unavailable |
| LLM fallback | Degradation | App fully functional without OpenAI |

---

## Constraints

### Technical Constraints

**Project-wide standards**: Next.js, TypeScript, SQLite/Prisma, Biome, Vitest (from memory-bank standards)

**Intent-specific constraints**:
- Next.js API routes for backend (no separate Express/Fastify server)
- OpenAI API required for LLM features (key via environment variable); app degrades gracefully without it
- mfapi.in for mutual fund NAVs (free, no key); Yahoo Finance for stock prices (may need key)
- PPF/EPF interest rates are government-notified and change periodically — must be user-configurable
- SQLite single-file database limits concurrent write throughput (acceptable for single-user)

### Business Constraints
- Personal use application — single user, no multi-tenancy
- Indian financial instruments are the primary focus
- No real-money transactions — tracking and reporting only
- No regulatory compliance required (personal tool, not financial advice)

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| User has OpenAI API access | LLM features unavailable | Graceful degradation — app works without LLM |
| mfapi.in remains free and available | Can't auto-fetch MF NAVs | Manual valuation entry as fallback |
| Yahoo Finance covers Indian stocks | Can't auto-fetch stock prices | Manual valuation entry as fallback |
| PPF rate stays at 7.1% for FY 2025-26 | Calculations slightly off | User-overridable rates |
| EPF rate stays at 8.25% for FY 2025-26 | Calculations slightly off | User-overridable rates |
| Single user, local deployment | N/A for personal tracker | Can add multi-user later |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Yahoo Finance API reliability for Indian stocks (NSE/BSE)? | Developer | During FR-4 construction | Pending — will evaluate during implementation |
| NPS valuation method — NAV-based or contribution-based tracking? | Developer | During FR-4 construction | Pending |
| Gratuity calculation formula — which Act/rules to follow? | Developer | During FR-4 construction | Pending |
