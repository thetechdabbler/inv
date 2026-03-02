---
unit: 003-llm-insights
intent: 001-investment-tracker
phase: inception
status: complete
created: 2026-03-02T10:25:00.000Z
updated: 2026-03-02T10:25:00.000Z
---

# Unit Brief: LLM Insights

## Purpose

AI-powered insights service that integrates with OpenAI API to generate portfolio summaries, future value projections, risk analysis, rebalancing recommendations, and handle natural language queries about the user's investments.

## Scope

### In Scope
- Portfolio narrative summary generation
- Future value projections with user-specified time horizons
- Risk factor identification and mitigation suggestions
- Rebalancing recommendations (current vs target allocation)
- Natural language query processing
- LLM interaction audit trail (all queries and responses logged)
- Prompt engineering and response parsing

### Out of Scope
- Portfolio data retrieval (portfolio-core)
- Automated calculations (valuation-engine)
- Chat UI components (investment-tracker-ui)
- Real-time streaming responses (future enhancement)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-5 | LLM-Powered Insights | Should |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| LLMQuery | A prompt sent to OpenAI | id, promptType, prompt, portfolioSnapshot, createdAt |
| LLMResponse | Response from OpenAI | id, queryId, response, model, tokensUsed, createdAt |
| PromptTemplate | Reusable prompt structure | type, template, requiredFields |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| generateSummary | Portfolio narrative summary | portfolioData | narrative text |
| generateProjection | Future value projection | portfolioData, timeHorizon | projected values, confidence |
| analyzeRisk | Risk factor identification | portfolioData | risk factors, mitigations |
| recommendRebalancing | Allocation recommendations | currentAllocation, targetAllocation | rebalancing actions |
| processNLQuery | Handle natural language question | question, portfolioData | answer text |
| getAuditTrail | Retrieve LLM interaction history | filters | LLMQuery[] with responses |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 6 |
| Must Have | 0 |
| Should Have | 5 |
| Could Have | 1 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-portfolio-summary | Generate portfolio narrative summary | Should | Planned |
| 002-future-projections | Project future portfolio values | Should | Planned |
| 003-risk-analysis | Identify risk factors | Should | Planned |
| 004-rebalancing-recommendations | Recommend rebalancing actions | Should | Planned |
| 005-natural-language-query | Handle NL questions about portfolio | Should | Planned |
| 006-llm-audit-trail | Log all LLM interactions | Could | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-portfolio-core | Needs portfolio data (accounts, transactions, valuations, performance) |

### Depended By
| Unit | Reason |
|------|--------|
| 005-investment-tracker-ui | Displays insights and NL query interface |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| OpenAI API | LLM inference (GPT-4o / GPT-4o-mini) | Medium (cost, latency, API key required) |

---

## Technical Context

### Suggested Technology
- OpenAI Node.js SDK for API calls
- Structured prompt templates with Handlebars or template literals
- Next.js API routes under `/api/v1/insights`

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| portfolio-core | Internal service | Function calls |
| OpenAI API | External API | REST / JSON |
| Frontend UI | API | REST (Next.js API routes) |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| LLM Queries | SQL (SQLite) | ~1K records | Permanent (audit) |
| LLM Responses | SQL (SQLite) | ~1K records | Permanent (audit) |

---

## Constraints

- OpenAI API key required — app must degrade gracefully without it
- Token costs — use GPT-4o-mini for simple queries, GPT-4o for complex analysis
- Prompt size limits — summarize portfolio data to fit context window
- Response latency 2-10s — UI must handle async loading states
- No PII sent to OpenAI — only aggregate financial data

---

## Success Criteria

### Functional
- [ ] Portfolio summary generated with meaningful insights
- [ ] Projections include confidence intervals and assumptions
- [ ] Risk analysis identifies concentration and volatility risks
- [ ] Rebalancing recommendations are actionable
- [ ] Natural language queries return relevant answers
- [ ] All interactions logged with timestamps

### Non-Functional
- [ ] LLM responses returned within 15s
- [ ] Graceful error handling when API is unavailable
- [ ] Token usage tracked per query

### Quality
- [ ] Prompt templates tested with sample data
- [ ] Error handling for API failures
- [ ] Code coverage > 60%

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 005-llm-insights | DDD | 001–003 | Core insights (summary, projections, risk) |
| 006-llm-insights | DDD | 004–006 | Advanced insights (rebalancing, NL queries, audit) |

---

## Notes

- Consider caching LLM responses for identical portfolio states to reduce API costs
- Prompt templates should be version-controlled for reproducibility
- Future: support streaming responses for better UX
