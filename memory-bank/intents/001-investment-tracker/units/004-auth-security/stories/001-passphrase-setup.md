---
id: 001-passphrase-setup
unit: 004-auth-security
intent: 001-investment-tracker
status: draft
priority: should
created: 2026-03-02T10:30:00Z
assigned_bolt: 007-auth-security
implemented: false
---

# Story: 001-passphrase-setup

## User Story

**As a** first-time user
**I want** to set a passphrase to protect my financial data
**So that** unauthorized people cannot access my investment tracker

## Acceptance Criteria

- [ ] **Given** no passphrase exists (first launch), **When** I access the app, **Then** I am prompted to create a passphrase
- [ ] **Given** I enter a passphrase (min 8 characters), **When** I confirm it, **Then** it is hashed with bcrypt (cost 12) and stored
- [ ] **Given** the passphrase is set, **When** I access the app next time, **Then** I am prompted to enter the passphrase

## Technical Notes

- Store hashed passphrase in UserConfig table
- bcrypt cost factor: 12
- API route: POST /api/v1/auth/setup
- Derive encryption key from passphrase using PBKDF2 for field encryption

## Dependencies

### Requires
- None (first security story)

### Enables
- 002-passphrase-login
- 003-field-encryption

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Passphrase too short (< 8 chars) | Validation error |
| Passphrase with special characters | Allowed |
| Try to set passphrase when one exists | Error — passphrase already configured |

## Out of Scope

- Passphrase recovery / reset mechanism
- Passphrase strength meter
- Multi-factor authentication
