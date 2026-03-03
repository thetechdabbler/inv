---
intent: 002-ui-modernization
phase: inception
status: inception-complete
created: 2026-03-03T12:00:00Z
updated: 2026-03-03T12:00:00Z
---

# Requirements: UI Modernization

## Intent Overview

Complete visual redesign of the InvestTrack application with a minimal futuristic aesthetic. Introduces shadcn/ui component library, light/dark mode theming, and micro-interactions/animations across all pages. Desktop-focused (mobile deferred).

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Modern, futuristic visual identity | All pages redesigned with consistent design system | Must |
| Light/dark mode support | User-togglable theme persisted across sessions | Must |
| Polished micro-interactions | Page transitions, hover effects, loading animations on all interactive elements | Must |
| shadcn/ui component library | All form controls, buttons, cards, tables use shadcn primitives | Must |
| Improved data readability | Typography, spacing, color hierarchy make financial data scannable | Should |

---

## Functional Requirements

### FR-1: Design System & Theme Infrastructure
- **Description**: Install and configure shadcn/ui with Tailwind CSS. Define a custom theme with CSS variables for light and dark palettes. Futuristic aesthetic: clean lines, subtle gradients, soft glows, monospace accents for numbers.
- **Acceptance Criteria**:
  1. shadcn/ui installed and configured with Tailwind and CSS variable theming
  2. Light palette: white/slate backgrounds, indigo/violet accents, high-contrast text
  3. Dark palette: slate-900/950 backgrounds, cyan/violet neon accents, soft glow borders
  4. Shared design tokens for spacing, border-radius, shadows, typography
  5. All existing Tailwind utility classes replaced with shadcn Card, Button, Input, Select, Table, Badge, Dialog, Tabs, Tooltip components where applicable
- **Priority**: Must
- **Related Stories**: 001-shadcn-setup, 002-theme-tokens, 003-theme-toggle

### FR-2: Theme Toggle & Persistence
- **Description**: Light/dark mode toggle in the sidebar with system preference detection and localStorage persistence.
- **Acceptance Criteria**:
  1. Toggle button in sidebar switches between light, dark, and system modes
  2. Theme preference saved to localStorage and restored on page load
  3. System preference respected when set to "system" mode
  4. No flash of unstyled content (FOUC) on initial load
  5. All components and pages render correctly in both themes
- **Priority**: Must
- **Related Stories**: 003-theme-toggle

### FR-3: Sidebar & Navigation Redesign
- **Description**: Redesign the sidebar with a futuristic aesthetic — translucent panels, glow effects on active links, smooth collapse animation.
- **Acceptance Criteria**:
  1. Sidebar uses subtle backdrop-blur and border glow in dark mode
  2. Active nav link has animated indicator (left bar slide or glow pulse)
  3. Nav icons updated to Lucide icon set (shadcn default)
  4. Theme toggle integrated at bottom of sidebar
  5. Smooth open/close transition on mobile drawer
- **Priority**: Must
- **Related Stories**: 004-sidebar-redesign

### FR-4: Dashboard Redesign
- **Description**: Redesign dashboard with futuristic stat cards, animated number counters, and polished chart containers.
- **Acceptance Criteria**:
  1. Stat cards use shadcn Card with subtle gradient borders and number count-up animation on load
  2. Allocation bar and top accounts section styled with consistent card design
  3. Loading state uses animated skeleton components from shadcn
  4. Empty state has an illustrated placeholder
- **Priority**: Must
- **Related Stories**: 005-dashboard-redesign

### FR-5: Accounts Page Redesign
- **Description**: Redesign account tiles with hover lift effects, animated P&L indicators, and consistent card styling.
- **Acceptance Criteria**:
  1. Account tiles use shadcn Card with hover scale/lift transition
  2. P&L percentage uses animated badge with color-coded glow
  3. Account type badges use shadcn Badge component
  4. Grid layout with staggered fade-in animation on page load
- **Priority**: Must
- **Related Stories**: 006-accounts-redesign

### FR-6: Transactions & Valuations Pages Redesign
- **Description**: Redesign month-grouped listings, monthly report tables, and add-form pages using shadcn components.
- **Acceptance Criteria**:
  1. Month group cards use shadcn Card with collapsible animation
  2. Summary footers use Badge components for invested/withdrawn/net
  3. Monthly report uses shadcn Table with hover row highlights
  4. Tab switcher uses shadcn Tabs component
  5. Add Transaction/Valuation forms use shadcn Input, Select, Button with form validation styling
  6. Account selector panel uses styled list with shadcn hover states
- **Priority**: Must
- **Related Stories**: 007-transactions-redesign, 008-valuations-redesign

### FR-7: Charts Page Redesign
- **Description**: Restyle chart containers with futuristic card frames, subtle glow borders in dark mode, and improved filter controls.
- **Acceptance Criteria**:
  1. Chart cards have glassmorphism-lite border (1px glow in dark mode)
  2. Filter controls use shadcn Select and Button components
  3. Loading state uses chart-shaped skeleton placeholders
  4. Smooth fade-in transition on chart render
- **Priority**: Must
- **Related Stories**: 009-charts-redesign

### FR-8: AI Insights Page Redesign
- **Description**: Redesign the chat interface with futuristic message bubbles, typing indicator animation, and styled quick-action buttons.
- **Acceptance Criteria**:
  1. Chat bubbles have distinct styling per role (user: right-aligned accent, assistant: left-aligned card)
  2. Typing/loading indicator shows animated dots or pulse
  3. Quick-action buttons use shadcn Button variant with icon
  4. Empty state has a futuristic illustration or icon
- **Priority**: Should
- **Related Stories**: 010-insights-redesign

### FR-9: Import/Export Page Redesign
- **Description**: Restyle data management page with shadcn components and consistent card layout.
- **Acceptance Criteria**:
  1. Export/Import cards use shadcn Card
  2. File upload uses styled dropzone with drag-and-drop visual feedback
  3. Warning/success alerts use shadcn Alert component
  4. Buttons use shadcn Button with loading spinner state
- **Priority**: Should
- **Related Stories**: 011-data-page-redesign

### FR-10: Page Transitions & Micro-Interactions
- **Description**: Add CSS/Framer Motion animations for page transitions, element entry, hover states, and interactive feedback.
- **Acceptance Criteria**:
  1. Page content fades in on navigation (CSS or lightweight animation library)
  2. Cards and list items stagger-in on initial render
  3. Buttons show press feedback (scale down on active)
  4. Number values animate (count up) when they appear
  5. Skeleton loaders smoothly transition to real content
- **Priority**: Must
- **Related Stories**: 012-page-transitions, 013-micro-interactions

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Bundle size impact | shadcn + animation overhead | < 50KB gzipped additional |
| Theme switch | Mode toggle latency | < 50ms, no layout shift |
| Animation FPS | Interaction smoothness | 60fps on desktop |

### Accessibility
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Color contrast | WCAG 2.1 AA | Both light and dark themes |
| Reduced motion | prefers-reduced-motion | Disable animations when set |
| Keyboard navigation | Full keyboard support | All shadcn components support this by default |

---

## Constraints

### Technical Constraints

**Project-wide standards**: Next.js, TypeScript, Tailwind CSS, Biome, Vitest

**Intent-specific constraints**:
- shadcn/ui uses Radix UI primitives — components copied into `src/components/ui/`, not an npm dependency
- CSS variables for theming (HSL format per shadcn convention)
- No heavy animation library (prefer CSS transitions + lightweight JS)
- Desktop viewport only — no mobile-specific work
- Purely presentational — no changes to API layer or data logic

### Business Constraints
- Existing functionality must remain fully intact
- No new features — visual redesign only

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| shadcn/ui compatible with current Next.js version | Components may not work | Verify compatibility before starting |
| CSS variable theming works with existing Tailwind config | Theme conflicts | Test early in FR-1 |
| Animations don't degrade perceived performance | UI feels sluggish | Keep animations < 300ms, respect reduced-motion |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| None | — | — | — |
