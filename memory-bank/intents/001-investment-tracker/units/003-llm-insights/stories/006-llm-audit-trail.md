---
id: 006-llm-audit-trail
unit: 003-llm-insights
intent: 001-investment-tracker
status: complete
priority: could
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 006-llm-insights
implemented: true
---

# Story: 006-llm-audit-trail

## User Story

**As a** user
**I want** all LLM queries and responses to be logged with timestamps
**So that** I can review past insights and debug any issues

## Acceptance Criteria

- [ ] **Given** any LLM interaction (summary, projection, risk, rebalancing, NL query), **When** it occurs, **Then** both the prompt and response are stored with timestamps, model used, and token count
- [ ] **Given** I want to review past insights, **When** I access the audit trail, **Then** I see a chronological list of all LLM interactions
- [ ] **Given** I want to manage storage, **When** I delete old entries, **Then** they are removed from the database

## Technical Notes

- Store in LLMQuery + LLMResponse tables (Prisma models)
- Log: prompt, response, model (gpt-4o-mini/gpt-4o), tokens_used, timestamp
- API route: GET /api/v1/insights/history

## Dependencies

### Requires
- Any insight story (001-005) — logging happens within each

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| LLM call fails | Log the failed attempt with error message |
| Very large response | Store full response (no truncation) |
| Concurrent requests | Each logged independently with correct timestamps |

## Out of Scope

- Analytics on LLM usage (cost tracking, usage trends)
- Exporting LLM logs
