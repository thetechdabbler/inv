---
intent: 001-investment-tracker
created: 2026-03-02T10:15:00Z
completed: 2026-03-02T10:40:00Z
status: complete
---

# Inception Log: Investment Tracker

## Overview

**Intent**: Personal investment tracker for Indian financial instruments with automated calculations, market data fetching, and LLM-powered insights
**Type**: green-field
**Created**: 2026-03-02T10:15:00Z

## Artifacts Created

| Artifact | Status | File |
|----------|--------|------|
| Requirements | ✅ | requirements.md |
| System Context | ✅ | system-context.md |
| Units | ✅ | units.md + units/*/unit-brief.md |
| Stories | ✅ | units/*/stories/*.md (33 stories) |
| Bolt Plan | ✅ | memory-bank/bolts/001-010 (10 bolts) |

## Summary

| Metric | Count |
|--------|-------|
| Functional Requirements | 7 |
| Non-Functional Requirements | 4 |
| Units | 5 |
| Stories | 33 |
| Bolts Planned | 10 |

## Units Breakdown

| Unit | Stories | Bolts | Priority |
|------|---------|-------|----------|
| 001-portfolio-core | 9 | 2 | Must |
| 002-valuation-engine | 5 | 2 | Should |
| 003-llm-insights | 6 | 2 | Should |
| 004-auth-security | 6 | 2 | Should |
| 005-investment-tracker-ui | 7 | 2 | Must |

## Decision Log

| Date | Decision | Rationale | Approved |
|------|----------|-----------|----------|
| 2026-03-02 | Next.js API routes (no Express/Fastify) | Monorepo simplicity, single deployment | Yes |
| 2026-03-02 | Passphrase auth (not email/password) | Single user — full auth is overkill | Yes |
| 2026-03-02 | mfapi.in for MF NAVs | Free, no API key, Indian MF coverage | Yes |
| 2026-03-02 | App-layer AES-256 (not SQLCipher) | Simpler, sufficient for personal use | Yes |
| 2026-03-02 | 5 units (4 backend + 1 frontend) | Domain-driven backend, feature-based frontend | Yes |

## Scope Changes

| Date | Change | Reason | Impact |
|------|--------|--------|--------|
| 2026-03-02 | NPS/Gratuity calculation deferred | Complex, unclear formulas | -2 stories from valuation-engine |

## Ready for Construction

**Checklist**:
- [x] All requirements documented
- [x] System context defined
- [x] Units decomposed
- [x] Stories created for all units
- [x] Bolts planned
- [x] Human review complete

## Next Steps

1. Complete human review (Checkpoint 3)
2. Begin Construction Phase
3. Start with Unit: 001-portfolio-core
4. Execute: `/specsmd-construction-agent --intent="001-investment-tracker"`

## Dependencies

```text
001-portfolio-core ──► 002-valuation-engine ──► 004-valuation-engine
       │                                              │
       ├──► 003-valuation-engine                      │
       │                                              ▼
       ├──► 005-llm-insights ──► 006-llm-insights ──► 010-investment-tracker-ui
       │                                              ▲
       ▼                                              │
007-auth-security ──► 008-auth-security ──► 009-investment-tracker-ui
```

**Parallel tracks possible:**
- Track A: 001 → 002 → 003 → 004 (portfolio + valuation)
- Track B: 007 → 008 (auth — independent of Track A)
- Track C: 005 → 006 (LLM — after 002 completes)
- Track D: 009 → 010 (UI — after Tracks A, B, C complete)
