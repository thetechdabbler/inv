---
intent: 003-ux-improvements
phase: inception
status: context-defined
updated: 2026-03-03T17:00:00Z
---

# UX Improvements - System Context

## System Overview

Enhancement intent for the InvestTrack portfolio tracker. Improves existing UI pages with missing CRUD operations, better navigation, consistent filtering, form polish, and accessibility — all within the existing Next.js + shadcn/ui frontend.

## Context Diagram

```
[User] --> [Next.js Frontend]
                |
                |--> [REST API /api/v1/*]
                |        |
                |        |--> [SQLite via Prisma]
                |        |--> [OpenAI API (insights)]
                |
                |--> [shadcn/ui Components]
                |--> [SWR Cache]
```

## External Integrations

- **REST API**: Existing account, transaction, valuation, backup, insights endpoints
- **OpenAI API**: Used by AI Insights chat (no changes needed)

## High-Level Constraints

- Frontend-only changes (no new API endpoints unless CRUD requires PATCH/DELETE)
- Must use existing shadcn/ui components and theme system
- Must work in both light and dark modes
- Must respect prefers-reduced-motion

## Key NFR Goals

- Paginated data loading (< 300ms initial load)
- ARIA-compliant custom widgets
- No full-page reloads for error recovery
