---
id: 005-llm-insights
unit: 003-llm-insights
intent: 001-investment-tracker
type: ddd-construction-bolt
status: complete
stories:
  - 001-portfolio-summary
  - 002-future-projections
  - 003-risk-analysis
created: 2026-03-02T10:35:00.000Z
started: 2026-03-02T22:30:00.000Z
completed: "2026-03-02T17:55:10Z"
current_stage: null
stages_completed:
  - name: domain-model
    completed: 2026-03-02T22:30:00.000Z
    artifact: ddd-01-domain-model.md
  - name: design
    completed: 2026-03-02T23:00:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-03-02T23:05:00.000Z
    artifact: adr-003-openai-sdk-llm-provider.md
  - name: implement
    completed: 2026-03-02T23:30:00.000Z
    artifact: src/
requires_bolts:
  - 002-portfolio-core
enables_bolts:
  - 006-llm-insights
requires_units:
  - 001-portfolio-core
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 005-llm-insights

## Overview

First bolt for the LLM insights unit. Implements core AI features: portfolio summary generation, future value projections, and risk analysis.

## Objective

Enable AI-powered financial insights by integrating with OpenAI API for portfolio analysis.

## Stories Included

- **001-portfolio-summary**: Generate narrative portfolio summary (Should)
- **002-future-projections**: Project future portfolio values (Should)
- **003-risk-analysis**: Identify portfolio risk factors (Should)

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
- 002-portfolio-core (portfolio data for prompts)

### Enables
- 006-llm-insights (advanced insights)

## Success Criteria

- [ ] OpenAI integration working with structured prompts
- [ ] Portfolio summary generates meaningful narrative
- [ ] Projections include optimistic/expected/conservative scenarios
- [ ] Risk analysis identifies concentration and volatility risks
- [ ] Graceful degradation when API unavailable
- [ ] Tests with mocked OpenAI responses

## Notes

- Use GPT-4o-mini for cost efficiency, GPT-4o for complex analysis
- Prompt templates should be modular and testable
- Portfolio data should be summarized before sending (token optimization)
- OPENAI_API_KEY from environment variable
