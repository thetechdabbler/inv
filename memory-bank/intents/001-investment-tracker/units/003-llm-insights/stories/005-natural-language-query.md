---
id: 005-natural-language-query
unit: 003-llm-insights
intent: 001-investment-tracker
status: draft
priority: should
created: 2026-03-02T10:30:00Z
assigned_bolt: 006-llm-insights
implemented: false
---

# Story: 005-natural-language-query

## User Story

**As a** user
**I want** to ask natural language questions about my portfolio
**So that** I can get quick answers without navigating through menus

## Acceptance Criteria

- [ ] **Given** a question like "What is my projected PPF balance in 15 years?", **When** submitted, **Then** the system translates it into an appropriate prompt with portfolio context and returns the LLM's answer
- [ ] **Given** a question about specific accounts, **When** answered, **Then** the response references actual data from those accounts
- [ ] **Given** an ambiguous question, **When** processed, **Then** the LLM asks for clarification or provides its best interpretation

## Technical Notes

- Inject relevant portfolio data into the prompt context
- Use function calling or structured prompts to extract intent from questions
- API route: POST /api/v1/insights/query with body { question }
- Consider conversation history for follow-up questions (optional)

## Dependencies

### Requires
- portfolio-core unit (portfolio data for context)
- 001-portfolio-summary, 002-future-projections (may reference these capabilities)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Non-financial question | Politely redirect to portfolio-related topics |
| Question about account that doesn't exist | Inform user and list available accounts |
| Very complex multi-part question | Break down into parts and answer each |

## Out of Scope

- Voice input
- Multi-turn conversation with full memory
- Action execution from queries (e.g., "Add Rs 5000 to my PPF")
