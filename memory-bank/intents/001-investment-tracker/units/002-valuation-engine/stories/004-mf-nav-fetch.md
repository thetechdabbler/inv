---
id: 004-mf-nav-fetch
unit: 002-valuation-engine
intent: 001-investment-tracker
status: draft
priority: should
created: 2026-03-02T10:30:00Z
assigned_bolt: 004-valuation-engine
implemented: false
---

# Story: 004-mf-nav-fetch

## User Story

**As a** user
**I want** the system to automatically fetch the latest NAV for my mutual fund holdings
**So that** my mutual fund portfolio value stays current without manual updates

## Acceptance Criteria

- [ ] **Given** a mutual fund account with a scheme code, **When** I trigger NAV fetch, **Then** the latest NAV is retrieved from mfapi.in
- [ ] **Given** the NAV is fetched, **When** the portfolio value is computed, **Then** current value = units held × latest NAV
- [ ] **Given** mfapi.in is unavailable, **When** fetch fails, **Then** the system falls back to the last known NAV and shows a warning

## Technical Notes

- API: https://api.mfapi.in/mf/{schemeCode}
- No API key required
- Cache NAVs for 24 hours to avoid redundant calls
- User must provide scheme code when setting up MF account
- API route: POST /api/v1/valuations/compute/mf/:accountId

## Dependencies

### Requires
- portfolio-core unit (Account, Transaction, Valuation models)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid scheme code | Return error with message |
| API rate limiting | Retry with exponential backoff |
| NAV not updated (holiday) | Use last available NAV |
| Multiple MF schemes in one account | Not supported — one account per scheme |

## Out of Scope

- SIP tracking and reminders
- Scheme comparison and recommendations
- Historical NAV charts (use valuation history instead)
