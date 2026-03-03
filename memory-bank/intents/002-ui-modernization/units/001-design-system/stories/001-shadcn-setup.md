---
id: 001-shadcn-setup
unit: 001-design-system
intent: 002-ui-modernization
status: complete
priority: Must
complexity: 2
created: 2026-03-03T12:00:00.000Z
implemented: true
---

# Story: 001-shadcn-setup

## User Story

**As a** developer
**I want** shadcn/ui installed and configured with Tailwind CSS
**So that** the app has a consistent, accessible component foundation for UI modernization

## Scope

Install and configure shadcn/ui with Tailwind CSS. Initialize shadcn CLI, generate base components (Card, Button, Input, Select, Badge, Table, Tabs, Dialog, Tooltip, Alert, Skeleton). Configure `components.json`.

## Acceptance Criteria

- [ ] shadcn CLI initialized
- [ ] `components.json` configured
- [ ] All base components generated in `src/components/ui/` (Card, Button, Input, Select, Badge, Table, Tabs, Dialog, Tooltip, Alert, Skeleton)
- [ ] Tailwind config updated for CSS variable mode
- [ ] Existing pages still render
