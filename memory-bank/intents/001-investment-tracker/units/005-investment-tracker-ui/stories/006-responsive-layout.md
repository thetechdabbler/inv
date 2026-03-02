---
id: 006-responsive-layout
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
status: complete
priority: should
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 010-investment-tracker-ui
implemented: true
---

# Story: 006-responsive-layout

## User Story

**As a** user
**I want** the application to work well on both desktop and mobile
**So that** I can check my investments from any device

## Acceptance Criteria

- [ ] **Given** a desktop viewport (>1024px), **When** I use the app, **Then** the layout uses full-width with sidebar navigation
- [ ] **Given** a mobile viewport (<768px), **When** I use the app, **Then** the layout stacks vertically with a hamburger menu
- [ ] **Given** charts on mobile, **When** displayed, **Then** they resize appropriately and remain interactive

## Technical Notes

- Use Tailwind CSS responsive utilities (sm:, md:, lg:)
- Breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- Navigation: sidebar on desktop, bottom nav or hamburger on mobile
- Charts: horizontal scroll on mobile if needed

## Dependencies

### Requires
- 001-portfolio-dashboard (layout wraps all pages)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Very small screen (<320px) | Graceful degradation, no horizontal overflow |
| Landscape mobile | Use available width for charts |
| Tablet orientation change | Layout adapts without page reload |

## Out of Scope

- Native mobile app (PWA or React Native)
- Offline mode
- Touch-specific gestures beyond standard
