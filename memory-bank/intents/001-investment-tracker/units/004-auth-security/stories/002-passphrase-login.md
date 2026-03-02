---
id: 002-passphrase-login
unit: 004-auth-security
intent: 001-investment-tracker
status: complete
priority: should
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 007-auth-security
implemented: true
---

# Story: 002-passphrase-login

## User Story

**As a** returning user
**I want** to unlock the app by entering my passphrase
**So that** my data remains secure between sessions

## Acceptance Criteria

- [ ] **Given** a passphrase is configured, **When** I enter the correct passphrase, **Then** a session is created and I can access the app
- [ ] **Given** I enter an incorrect passphrase, **When** I submit, **Then** I see an error message and the attempt is logged
- [ ] **Given** I have a valid session, **When** I navigate the app, **Then** API routes are accessible without re-entering the passphrase

## Technical Notes

- Use iron-session for encrypted cookie-based sessions
- Session duration: configurable (default 24 hours)
- API route: POST /api/v1/auth/login
- Next.js middleware to protect all /api/v1/* routes except /api/v1/auth/*

## Dependencies

### Requires
- 001-passphrase-setup

### Enables
- All protected API routes

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Session expired | Redirect to login |
| Multiple browser tabs | Session shared across tabs |
| Brute force attempts | Rate limit (5 attempts per minute) |

## Out of Scope

- Remember me / persistent sessions
- Session management UI (view active sessions)
