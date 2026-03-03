---
id: 003-theme-toggle
unit: 001-design-system
intent: 002-ui-modernization
status: complete
priority: Must
complexity: 2
created: 2026-03-03T12:00:00.000Z
implemented: true
---

# Story: 003-theme-toggle

## User Story

**As a** user
**I want** a theme toggle that switches between light, dark, and system preference
**So that** I can choose how the app looks and have my choice remembered

## Scope

Build theme toggle (light/dark/system) in sidebar. Persist to localStorage. Detect system preference. Prevent FOUC with script in head.

## Acceptance Criteria

- [ ] Toggle switches between light/dark/system
- [ ] Preference persisted in localStorage
- [ ] System preference detected
- [ ] No FOUC on reload
- [ ] `html` element gets correct class
