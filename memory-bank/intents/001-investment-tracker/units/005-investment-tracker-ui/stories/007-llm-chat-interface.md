---
id: 007-llm-chat-interface
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
status: draft
priority: could
created: 2026-03-02T10:30:00Z
assigned_bolt: 010-investment-tracker-ui
implemented: false
---

# Story: 007-llm-chat-interface

## User Story

**As a** user
**I want** a chat-like interface to ask questions about my portfolio
**So that** I can get AI-powered insights in a conversational format

## Acceptance Criteria

- [ ] **Given** the LLM insights service is available, **When** I open the chat panel, **Then** I see a text input and previous queries (if any)
- [ ] **Given** I type a question and submit, **When** the LLM is processing, **Then** I see a loading indicator with the query displayed
- [ ] **Given** the LLM responds, **When** the response arrives, **Then** it is displayed in a formatted chat bubble with markdown support

## Technical Notes

- Chat panel: slide-out drawer or dedicated page
- Support markdown rendering in responses (tables, lists, bold)
- Show quick-action buttons: "Summarize portfolio", "Risk analysis", "Project 10 years"
- Display token usage or cost per query (optional)

## Dependencies

### Requires
- llm-insights APIs (query endpoint)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| LLM takes >10 seconds | Show "still thinking..." message |
| API key not configured | Show setup instructions instead of chat |
| Network error mid-response | Show error with retry option |
| Very long response | Scrollable response area, no truncation |

## Out of Scope

- Voice input/output
- Multi-turn conversation context
- Response editing or regeneration
