---
id: 007-auth-security
unit: 004-auth-security
intent: 001-investment-tracker
type: ddd-construction-bolt
status: complete
stories:
  - 001-passphrase-setup
  - 002-passphrase-login
  - 003-field-encryption
created: 2026-03-02T10:35:00.000Z
started: 2026-03-02T20:00:00.000Z
completed: "2026-03-02T15:54:09Z"
current_stage: null
stages_completed:
  - domain_model
  - design
  - adr
  - implement
  - test
requires_bolts: []
enables_bolts:
  - 008-auth-security
  - 009-investment-tracker-ui
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 007-auth-security

## Overview

First bolt for auth and security. Implements passphrase-based authentication and AES-256 field encryption for sensitive financial data.

## Objective

Secure the application with passphrase authentication and encrypt sensitive data at rest.

## Stories Included

- **001-passphrase-setup**: First-time passphrase creation (Should)
- **002-passphrase-login**: Session-based passphrase verification (Should)
- **003-field-encryption**: AES-256-GCM encryption for sensitive fields (Should)

## Bolt Type

**Type**: DDD Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [x] **1. Domain Model**: Complete → ddd-01-domain-model.md
- [x] **2. Technical Design**: Complete → ddd-02-technical-design.md
- [x] **3. ADR Analysis**: Complete → adr-002-passphrase-auth-iron-session.md
- [x] **4. Implementation**: Complete → src/
- [x] **5. Testing**: Complete → ddd-03-test-report.md

## Dependencies

### Requires
- None (independent — can be built in parallel with portfolio-core)

### Enables
- 008-auth-security (data management features)
- 009-investment-tracker-ui (login screen and protected routes)

## Success Criteria

- [ ] Passphrase setup flow works on first launch
- [ ] Login with correct passphrase creates session
- [ ] Incorrect passphrase shows error and logs attempt
- [ ] Sensitive fields encrypted with AES-256-GCM
- [ ] Encryption key derived from passphrase via PBKDF2
- [ ] Next.js middleware protects all API routes except /api/v1/auth/*
- [ ] Tests passing (bcrypt, encryption round-trip)

## Notes

- Use iron-session for encrypted cookie-based sessions
- bcrypt cost factor: 12
- AES-256-GCM with random IV per operation
- PBKDF2 with stored salt for key derivation
