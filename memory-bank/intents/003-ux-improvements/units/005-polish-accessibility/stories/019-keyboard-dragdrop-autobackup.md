---
id: 019-keyboard-dragdrop-autobackup
unit: 005-polish-accessibility
intent: 003-ux-improvements
status: complete
priority: Could
complexity: 1
created: 2026-03-03T17:00:00.000Z
implemented: true
---

# Story: Keyboard a11y on dropzone + auto-backup

## User Story
**As a** keyboard-only user importing data
**I want** the dropzone to be keyboard-accessible
**So that** I can import data without a mouse

## Scope
Make the file dropzone focusable (tabIndex) and trigger file picker on Enter/Space. Add "Download backup first" button in the import confirmation dialog.

## Acceptance Criteria
- [ ] Dropzone is focusable via Tab
- [ ] Enter/Space triggers file picker when focused
- [ ] Focus styling visible on dropzone
- [ ] Import confirmation offers "Download backup first" option
