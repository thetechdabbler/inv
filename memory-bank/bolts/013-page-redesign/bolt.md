---
id: 013-page-redesign
unit: 002-page-redesign
intent: 002-ui-modernization
type: simple-construction-bolt
status: complete
stories:
  - 009-charts-redesign
  - 010-insights-redesign
  - 011-data-page-redesign
created: 2026-03-03T12:00:00Z
started: 2026-03-03T15:00:00Z
completed: 2026-03-03T15:30:00Z
current_stage: null
stages_completed: [plan, implement, test]

requires_bolts:
  - 012-page-redesign
enables_bolts:
  - 014-animations-polish
requires_units: []
blocks: false

complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 1
---

# Bolt: 013-page-redesign

## Overview

Second page-redesign bolt covering the secondary pages — charts, AI insights, and import/export data. Completes the full-app visual redesign.

## Objective

Convert charts, AI insights, and data management pages to use shadcn/ui components with consistent theming, completing the page-level redesign.

## Stories Included

- **009-charts-redesign**: Redesign charts page (Must)
- **010-insights-redesign**: Redesign AI insights page (Should)
- **011-data-page-redesign**: Redesign import/export page (Should)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan**: Complete → implementation-plan.md
- [x] **2. Implement**: Complete → Source code + implementation-walkthrough.md
- [x] **3. Test**: Complete → test-walkthrough.md

## Dependencies

### Requires
- 012-page-redesign (core pages done, patterns established)

### Enables
- 014-animations-polish (all pages ready for animation)

## Success Criteria

- [ ] Charts page uses shadcn Card with glow border in dark mode
- [ ] AI insights chat redesigned with themed bubbles and quick actions
- [ ] Import/export page uses shadcn Card, Alert, Button
- [ ] All 3 pages render correctly in light and dark modes
- [ ] Biome lint passes
- [ ] TypeScript compiles

## Notes

- Charts (Recharts) may need theme-aware color arrays — consider reading CSS variables in JS
- Insights chat has a unique bubble layout — extract a ChatBubble component
- Data page is straightforward — mostly Card/Button/Alert swaps
