---
id: 010-investment-tracker-ui
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
type: simple-construction-bolt
status: complete
stories:
  - 004-portfolio-charts
  - 005-filtering-and-search
  - 006-responsive-layout
  - 007-llm-chat-interface
created: 2026-03-02T10:35:00.000Z
started: 2026-03-03T01:30:00.000Z
completed: "2026-03-02T19:25:24Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-03-03T02:00:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-03-03T02:15:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-03-03T02:30:00.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 009-investment-tracker-ui
  - 004-valuation-engine
  - 006-llm-insights
enables_bolts: []
requires_units:
  - 001-portfolio-core
  - 002-valuation-engine
  - 003-llm-insights
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 2
---

# Bolt: 010-investment-tracker-ui

## Overview

Second bolt for the frontend. Implements charts and visualizations, filtering, responsive layout, and the LLM chat interface.

## Objective

Complete the UI with data visualizations, filtering capabilities, mobile responsiveness, and AI-powered conversational interface.

## Stories Included

- **004-portfolio-charts**: Line, bar, and pie charts (Must)
- **005-filtering-and-search**: Filter by account and date range (Must)
- **006-responsive-layout**: Desktop and mobile responsive design (Should)
- **007-llm-chat-interface**: Natural language query chat panel (Could)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Implementation Plan**: Pending → implementation-plan.md
- [ ] **2. Implementation**: Pending → src/
- [ ] **3. Testing**: Pending → test-report.md

## Dependencies

### Requires
- 009-investment-tracker-ui (core UI must exist)
- 004-valuation-engine (auto-computed values for charts)
- 006-llm-insights (NL query API for chat interface)

### Enables
- None (final bolt)

## Success Criteria

- [ ] Line chart shows account values over time
- [ ] Bar chart shows contributions vs returns
- [ ] Pie chart shows allocation by account type
- [ ] Filters work for account and date range
- [ ] Layout adapts to mobile, tablet, and desktop
- [ ] LLM chat panel accepts questions and shows responses
- [ ] Component tests passing
- [ ] Mobile Lighthouse performance > 80

## Notes

- Use Recharts for chart rendering
- Tailwind CSS responsive utilities for layout
- LLM chat: slide-out drawer or dedicated page
- Quick action buttons: "Summarize", "Risk analysis", "Project 10 years"
- Consider chart export to PNG (future enhancement)
