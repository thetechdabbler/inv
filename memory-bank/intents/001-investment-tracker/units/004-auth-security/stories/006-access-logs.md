---
id: 006-access-logs
unit: 004-auth-security
intent: 001-investment-tracker
status: complete
priority: should
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 008-auth-security
implemented: true
---

# Story: 006-access-logs

## User Story

**As a** user
**I want** login attempts and critical data changes to be logged
**So that** I can detect unauthorized access and audit important changes

## Acceptance Criteria

- [ ] **Given** a login attempt (success or failure), **When** it occurs, **Then** it is recorded with timestamp, success flag, and IP address
- [ ] **Given** a critical data change (account created/deleted, transaction deleted), **When** it occurs, **Then** it is recorded with entity type, action, old value, new value, and timestamp
- [ ] **Given** I want to review logs, **When** I access the audit trail, **Then** I see a chronological list with filtering options

## Technical Notes

- AccessLog table: id, action, ipAddress, success, timestamp
- AuditLog table: id, entityType, entityId, action, oldValue, newValue, timestamp
- API route: GET /api/v1/audit/access-logs and GET /api/v1/audit/change-logs
- Implement as middleware/hooks on critical Prisma operations

## Dependencies

### Requires
- 002-passphrase-login (login events to log)
- portfolio-core unit (data changes to log)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| High volume of logs | Paginated retrieval, consider log rotation |
| Sensitive data in old/new values | Encrypt or redact sensitive fields in logs |
| Log storage growing large | Auto-purge access logs older than 90 days |

## Out of Scope

- Real-time alerting on suspicious activity
- Log export
- Log analysis dashboard
