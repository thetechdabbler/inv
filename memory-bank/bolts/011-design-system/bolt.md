---
id: 011-design-system
unit: 001-design-system
intent: 002-ui-modernization
type: simple-construction-bolt
status: complete
stories:
  - 001-shadcn-setup
  - 002-theme-tokens
  - 003-theme-toggle
  - 004-sidebar-redesign
created: 2026-03-03T12:00:00.000Z
started: 2026-03-03T13:00:00.000Z
completed: "2026-03-02T20:20:18Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-03-03T13:10:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-03-03T13:40:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-03-03T13:55:00.000Z
    artifact: test-walkthrough.md
requires_bolts: []
enables_bolts:
  - 012-page-redesign
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 1
---

# Bolt: 011-design-system

## Overview

Foundation bolt for the UI modernization — installs shadcn/ui, configures CSS variable theming for light/dark modes, builds the theme toggle, and redesigns the sidebar.

## Objective

Establish the complete design system infrastructure so that subsequent page-redesign bolts have all components, theming, and navigation ready to use.

## Stories Included

- **001-shadcn-setup**: Install and configure shadcn/ui (Must)
- **002-theme-tokens**: Define light/dark CSS variable themes (Must)
- **003-theme-toggle**: Build theme toggle with persistence (Must)
- **004-sidebar-redesign**: Redesign sidebar with futuristic aesthetic (Must)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → Source code + implementation-walkthrough.md
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- None (first bolt in intent)

### Enables
- 012-page-redesign (core page redesigns)

## Success Criteria

- [ ] shadcn/ui installed and configured
- [ ] Light and dark themes working with CSS variables
- [ ] Theme toggle functional with localStorage persistence
- [ ] Sidebar redesigned with Lucide icons and glow effects
- [ ] No FOUC on page load
- [ ] Biome lint passes
- [ ] TypeScript compiles

## Notes

- This bolt is the prerequisite for all other UI modernization work
- Consider using next-themes for robust SSR-compatible theme management
