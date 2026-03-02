---
version: v0.1.0-c06a710
commit: c06a710
built: 2026-03-03T01:00:00Z
status: success
---

## Build: v0.1.0-c06a710

### Artifact

- **Type**: Next.js production build (`.next/`)
- **Builder**: Next.js 16.1.6 (Turbopack)
- **Runtime**: Node.js (local)

### Build Summary

- **Compilation**: ✅ Compiled in 2.9s (zero TypeScript/build errors)
- **Static pages**: ✅ 30/30 generated
- **Routes**: 39 total (7 static, 32 dynamic API/page routes)

### Routes Verified

**LLM Insights (bolts 005 + 006) — all 6 registered:**

- `ƒ /api/v1/insights/history`
- `ƒ /api/v1/insights/projections`
- `ƒ /api/v1/insights/query`
- `ƒ /api/v1/insights/rebalancing`
- `ƒ /api/v1/insights/risk-analysis`
- `ƒ /api/v1/insights/summary`

### Warnings (pre-existing, non-blocking)

- `url.parse()` deprecation — Node.js DEP0169, not caused by bolt work
- `middleware` → `proxy` convention deprecation — Next.js upgrade note

### Build Environment

- OS: macOS Darwin 25.3.0
- Next.js: 16.1.6
- Node.js: system default
- Prisma: 5.22.0 (migration 20260302180534 applied)
