---
intent: 004-ai-insights-improvement
phase: inception
status: inception-complete
created: 2026-03-03T10:45:00.000Z
updated: 2026-03-03T10:45:00.000Z
---

# Units: AI Insights Improvement

## Units Overview

| Unit | Name | Type | Purpose |
|------|------|------|---------|
| 001-llm-insights-core | LLM Insights Core Enhancements | backend | Improve prompt engineering, grounding and templates |
| 002-insights-ux | AI Insights UX | frontend | Enhance insights presentation, history and actions |

## 001-llm-insights-core

- **Intent**: 004-ai-insights-improvement  
- **Type**: backend  
- **Depends On**:
  - 001-portfolio-core
  - 002-valuation-engine
  - Employment & gratuity modules
- **Description**: Evolve the existing `003-llm-insights` behavior with better grounding, deterministic+LLM hybrid flows, template management, and audit improvements.

## 002-insights-ux

- **Intent**: 004-ai-insights-improvement  
- **Type**: frontend  
- **Depends On**:
  - 003-llm-insights
  - 005-investment-tracker-ui
- **Description**: Improve the AI Insights UI to surface richer context around each insight (underlying data, projections, related actions) and better manage history and filters.

