---
id: 006-llm-insights
unit: 003-llm-insights
intent: 001-investment-tracker
type: ddd-construction-bolt
status: complete
stories:
  - 004-rebalancing-recommendations
  - 005-natural-language-query
  - 006-llm-audit-trail
created: 2026-03-02T10:35:00.000Z
started: 2026-03-02T23:50:00.000Z
completed: "2026-03-02T18:30:06Z"
current_stage: null
stages_completed:
  - name: domain-model
    completed: 2026-03-03T00:00:00.000Z
    artifact: ddd-01-domain-model.md
  - name: design
    completed: 2026-03-03T00:10:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-03-03T00:15:00.000Z
    artifact: adr-004-auditing-llm-gateway-decorator.md
  - name: implement
    completed: 2026-03-03T00:30:00.000Z
    artifact: src/
requires_bolts:
  - 005-llm-insights
enables_bolts:
  - 010-investment-tracker-ui
requires_units:
  - 001-portfolio-core
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 006-llm-insights

## Overview

Second bolt for the LLM insights unit. Implements rebalancing recommendations, natural language query processing, and the LLM audit trail.

## Objective

Complete the AI insights suite with rebalancing advice, conversational query support, and full audit logging of all LLM interactions.

## Stories Included

- **004-rebalancing-recommendations**: Recommend portfolio rebalancing actions (Should)
- **005-natural-language-query**: Handle natural language questions (Should)
- **006-llm-audit-trail**: Log all LLM interactions (Could)

## Bolt Type

**Type**: DDD Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [ ] **1. Domain Model**: Pending → ddd-01-domain-model.md
- [ ] **2. Technical Design**: Pending → ddd-02-technical-design.md
- [ ] **3. Implementation**: Pending → src/
- [ ] **4. Testing**: Pending → ddd-03-test-report.md

## Dependencies

### Requires
- 005-llm-insights (core LLM integration and patterns)

### Enables
- 010-investment-tracker-ui (LLM chat interface)

## Success Criteria

- [ ] Rebalancing recommendations generated from current vs target allocation
- [ ] Natural language queries processed with portfolio context
- [ ] All LLM interactions logged with prompt, response, model, tokens, timestamp
- [ ] Audit trail retrievable via API
- [ ] Tests with mocked OpenAI responses

## Notes

- NL queries should inject relevant portfolio data into prompt context
- Audit trail uses LLMQuery + LLMResponse Prisma models
- Consider caching responses for identical portfolio states
