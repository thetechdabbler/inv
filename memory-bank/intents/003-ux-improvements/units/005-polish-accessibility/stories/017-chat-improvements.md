---
id: 017-chat-improvements
unit: 005-polish-accessibility
intent: 003-ux-improvements
status: complete
priority: Could
complexity: 2
created: 2026-03-03T17:00:00.000Z
implemented: true
---

# Story: Chat clear history, copy, aria-live

## User Story
**As a** user interacting with AI Insights
**I want** to clear history, copy responses, and have screen reader support
**So that** the chat is more usable and accessible

## Scope
Add "Clear history" button to InsightChat. Add copy-to-clipboard icon on assistant message bubbles. Add aria-live="polite" to the message container for screen reader announcements.

## Acceptance Criteria
- [ ] "Clear history" button resets all messages
- [ ] Copy icon appears on hover/focus of assistant bubbles
- [ ] Clicking copy writes message text to clipboard
- [ ] Toast confirms copy success
- [ ] Message container has aria-live="polite"
