---
intent: 002-ui-modernization
phase: inception
status: context-defined
updated: 2026-03-03T12:00:00Z
---

# UI Modernization - System Context

## System Overview

Visual redesign of the existing InvestTrack frontend. No backend changes. All work is in the React/Next.js presentation layer — replacing current Tailwind utility classes with shadcn/ui components, adding a light/dark theme system, and introducing micro-interactions.

## Context Diagram

```text
┌──────────────────────────────────────────────┐
│              InvestTrack Frontend             │
│                                              │
│  ┌────────────────┐   ┌──────────────────┐   │
│  │ shadcn/ui      │   │ Theme Provider   │   │
│  │ Components     │   │ (light/dark)     │   │
│  └────────────────┘   └──────────────────┘   │
│                                              │
│  ┌────────────────┐   ┌──────────────────┐   │
│  │ Page Layouts   │   │ Animations       │   │
│  │ (all routes)   │   │ (CSS + JS)       │   │
│  └────────────────┘   └──────────────────┘   │
│                                              │
└──────────────┬───────────────────────────────┘
               │ (unchanged)
               ▼
┌──────────────────────────────────────────────┐
│     Existing API Layer (/api/v1/*)           │
│     (No modifications)                       │
└──────────────────────────────────────────────┘
```

## External Integrations

- **shadcn/ui + Radix UI**: Component primitives (copied into project, not npm dependency)
- **Lucide Icons**: Icon set bundled with shadcn

## High-Level Constraints

- No backend or API changes
- Desktop-only focus
- Must not break existing functionality
- Keep bundle size impact minimal (< 50KB gzipped)

## Key NFR Goals

- WCAG 2.1 AA contrast in both themes
- 60fps animations on desktop
- Theme toggle < 50ms with no FOUC
- Respect prefers-reduced-motion
