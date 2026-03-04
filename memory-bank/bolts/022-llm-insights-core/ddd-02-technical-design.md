---
unit: 001-llm-insights-core
bolt: 022-llm-insights-core
stage: design
status: complete
updated: 2026-03-04T00:30:00Z
---

# Technical Design — LLM Insights Core: Snapshot Builder & Template Registry

## Architecture Pattern

**Hexagonal Architecture** (Ports & Adapters) — consistent with the existing insights unit (ADR-003, ADR-004).

The snapshot builder and template registry are **pure application/domain primitives** — no new ports or adapters are needed. They slot into the existing hexagonal structure:

- `PortfolioSnapshot` and `InsightTemplate` live in the **domain layer** (`src/domain/insights/`)
- `buildPortfolioSnapshot()` and `renderTemplate()` live in the **application layer** (`src/application/insights/`)
- Existing routes (`/api/v1/insights/*`) remain untouched — they continue to call use-case functions; those functions are updated to call `renderTemplate()` internally

No new API endpoints are introduced in this bolt. No new infrastructure adapters are needed.

---

## Layer Structure

```text
┌─────────────────────────────────────────────────────┐
│  Presentation  (unchanged)                          │
│  src/app/api/v1/insights/{summary,projections,...}  │
├─────────────────────────────────────────────────────┤
│  Application  (extended)                            │
│  snapshot-builder.ts  ← enriched buildSnapshot()   │
│  generate-summary.ts  ← renderTemplate() migration │
│  generate-projections.ts  ← renderTemplate()       │
│  analyze-risk.ts  ← renderTemplate()               │
│  recommend-rebalancing.ts  ← renderTemplate()      │
│  process-nl-query.ts  ← renderTemplate()           │
├─────────────────────────────────────────────────────┤
│  Domain  (new + extended)                           │
│  types.ts  ← PortfolioSnapshot enrichment          │
│  template-registry.ts  ← NEW (InsightTemplate,     │
│              TEMPLATE_REGISTRY, renderTemplate(),   │
│              getTemplate(), UnknownInsightTypeError)│
│  prompt-templates.ts  ← superseded (not deleted)   │
│  llm-gateway.ts  ← unchanged                       │
├─────────────────────────────────────────────────────┤
│  Infrastructure  (unchanged)                        │
│  openai-llm-gateway.ts                              │
│  auditing-llm-gateway.ts  (ADR-004 decorator)      │
└─────────────────────────────────────────────────────┘
```

---

## Files to Create / Modify

### New

1 - **`src/domain/insights/template-registry.ts`**
   - `InsightTemplate` interface
   - `TEMPLATE_REGISTRY` constant (all 7 templates, keyed by `InsightType`)
   - `getTemplate(type: InsightType): InsightTemplate` — throws `UnknownInsightTypeError` if not found
   - `renderTemplate(template: InsightTemplate, snapshot: PortfolioSnapshot, params?: Record<string, string>): string` — resolves `{{variable}}` placeholders
   - `UnknownInsightTypeError` class

### Modified

2 - **`src/domain/insights/types.ts`**
   - Extend `InsightType` union to include full-slug names for existing types plus 2 new types
   - Enrich `PortfolioSnapshot` with `snapshotAt`, per-account `lastValuationAt` and `isStale` fields

3 - **`src/application/insights/snapshot-builder.ts`**
   - Populate `snapshotAt` (current Date)
   - Populate `lastValuationAt` and `isStale` per account (>30 days)

4 - **`src/application/insights/generate-summary.ts`** — swap `PROMPT_TEMPLATES.summary()` for `renderTemplate()`

5 - **`src/application/insights/generate-projections.ts`** — swap for `renderTemplate()`

6 - **`src/application/insights/analyze-risk.ts`** — swap for `renderTemplate()`

7 - **`src/application/insights/recommend-rebalancing.ts`** — swap for `renderTemplate()`

8 - **`src/application/insights/process-nl-query.ts`** — swap for `renderTemplate()`

### Deprecated (keep, no delete)

9 - **`src/domain/insights/prompt-templates.ts`** — marked `@deprecated`; kept until all use cases migrated, then deleted in a follow-up

---

## Domain Type Changes

### InsightType (extended)

```typescript
export type InsightType =
  // Existing 5 (renamed to full slugs for clarity)
  | "portfolio-summary"
  | "future-projections"
  | "risk-analysis"
  | "rebalancing"
  | "natural-language-query"
  // New 2 (bolt 022)
  | "projection-quality-review"
  | "retirement-readiness";
```

**Migration note**: The short-form keys (`"summary"`, `"projections"`, etc.) stored in existing `LLMQuery` audit records are plain strings — unaffected by this type change. New audit records written after this bolt will use full slugs.

### PortfolioSnapshot (enriched)

```typescript
export interface PortfolioSnapshot {
  // --- Existing fields (unchanged, for backwards compat) ---
  accounts: Array<{
    type: string;
    name: string;
    currentValuePaise: number;
    totalContributionsPaise: number;
    // NEW ↓
    lastValuationAt: string | null;   // ISO date string
    isStale: boolean;                 // true if >30 days since last valuation
  }>;
  totalValuePaise: number;
  netInvestedPaise: number;
  profitLossPaise: number;
  percentReturn: number | null;
  allocationByType: Record<string, number>;

  // --- New metadata field ---
  snapshotAt: string;  // ISO timestamp when snapshot was built

  // --- Existing optional enrichments (already added in previous session) ---
  deterministicProjections?: {
    monthly: Array<{ label: string; totalValuePaise: number }>;
    quarterly: Array<{ label: string; totalValuePaise: number }>;
    yearly: Array<{ label: string; totalValuePaise: number }>;
  };
  employmentContext?: {
    gratuityAccounts: Array<{
      accountId: string;
      accountName: string;
      basicSalaryInr: number | null;
      vpfAmountInr: number | null;
      joiningDate: string | null;
    }>;
  };
}
```

---

## Template Registry Design

### InsightTemplate interface

```typescript
export interface InsightTemplate {
  /** Unique insight type this template handles. */
  id: InsightType;
  /** SemVer template version — allows multi-version registry in future. */
  version: string;
  /** Whether this is the active (default) version for this type. */
  isActive: boolean;
  /** System role message for the LLM. */
  systemPrompt: string;
  /**
   * User prompt template. Supports {{variable}} placeholders.
   * Resolved against a SnapshotRenderContext built from PortfolioSnapshot.
   */
  userPromptTemplate: string;
  /** Human-readable description of expected LLM output shape. Not enforced at runtime. */
  outputSchema: Record<string, string>;
}
```

### SnapshotRenderContext

`renderTemplate()` builds a flat `Record<string, string>` from the snapshot before substitution. This avoids templates needing to traverse nested objects and keeps placeholder names human-readable:

```text
{{totalValueINR}}           → paiseToINR(snapshot.totalValuePaise)
{{netInvestedINR}}          → paiseToINR(snapshot.netInvestedPaise)
{{profitLossINR}}           → paiseToINR(snapshot.profitLossPaise)
{{percentReturn}}           → formatPercent(snapshot.percentReturn)
{{accountCount}}            → String(snapshot.accounts.length)
{{accountSummary}}          → buildAccountSummary(snapshot.accounts)
{{allocationSummary}}       → buildAllocationSummary(snapshot.allocationByType)
{{snapshotAt}}              → snapshot.snapshotAt
{{hasProjections}}          → "true" | "false"
{{projectionsSummary}}      → first 3 yearly points, or "Not available"
{{hasEmployment}}           → "true" | "false"
{{basicSalaryINR}}          → from employmentContext[0] or "N/A"
{{joiningDate}}             → from employmentContext[0] or "N/A"
{{gratuityAccountName}}     → from employmentContext[0] or "N/A"
```

Additional `params` passed to `renderTemplate()` override context keys (for runtime values like `{{question}}` in NL query).

### TEMPLATE_REGISTRY structure

```typescript
// Keyed by InsightType — one active template per type at v1
export const TEMPLATE_REGISTRY: Record<InsightType, InsightTemplate> = {
  "portfolio-summary": { id: "portfolio-summary", version: "1.0.0", isActive: true, ... },
  "future-projections": { ... },
  "risk-analysis": { ... },
  "rebalancing": { ... },
  "natural-language-query": { ... },
  "projection-quality-review": { ... },  // NEW
  "retirement-readiness": { ... },        // NEW
};
```

### getTemplate() behaviour

```typescript
function getTemplate(type: InsightType): InsightTemplate {
  const template = TEMPLATE_REGISTRY[type];
  if (!template) throw new UnknownInsightTypeError(type);
  return template;
}
```

### renderTemplate() behaviour

```typescript
function renderTemplate(
  template: InsightTemplate,
  snapshot: PortfolioSnapshot,
  params?: Record<string, string>,
): string {
  const ctx = buildRenderContext(snapshot, params);
  // Replace all {{key}} occurrences; unresolved → "" with console.warn
  return template.userPromptTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (key in ctx) return ctx[key];
    console.warn(`[template-registry] Unresolved placeholder: {{${key}}} in template ${template.id}@${template.version}`);
    return "";
  });
}
```

The full prompt sent to the gateway is: `template.systemPrompt + "\n\n" + renderedUserPrompt`

---

## Use Case Migration Pattern

Each existing use case migrates from:

```typescript
// Before
const prompt = PROMPT_TEMPLATES.summary({ totalValueINR: paiseToINR(snapshot.totalValuePaise), ... });
const response = await gateway.complete(prompt);
```

To:

```typescript
// After
const template = getTemplate("portfolio-summary");
const prompt = renderTemplate(template, snapshot);
const response = await gateway.complete(
  template.systemPrompt + "\n\n" + prompt,
  { insightType: "portfolio-summary" }
);
```

The API response shape (e.g. `{ summary: string, modelUsed: string }`) is **unchanged**. Consumers of the routes see no difference.

---

## API Design

No new endpoints in this bolt. Existing endpoints remain:

1 - `POST /api/v1/insights/summary` — unchanged externally; internally uses `renderTemplate()`
2 - `POST /api/v1/insights/projections` — unchanged externally
3 - `POST /api/v1/insights/risk-analysis` — unchanged externally
4 - `POST /api/v1/insights/rebalancing` — unchanged externally
5 - `POST /api/v1/insights/query` — unchanged externally
6 - `GET /api/v1/insights/history` — unchanged

The two new insight types (`projection-quality-review`, `retirement-readiness`) have templates registered but **no routes yet** — their routes are planned for bolt 023/024.

---

## Data Persistence

No DB schema changes in this bolt. The template registry is entirely in-memory TypeScript.

The existing `LLMQuery` / `LLMResponse` Prisma tables are not modified. The `insightType` column is a plain string — new records will use full slugs; old records retain short names.

---

## Security Design

1 - **No PII to LLM** (existing constraint, ADR-003): The `SnapshotRenderContext` strips `employer` from employment context before building render variables — consistent with existing behaviour
2 - **Auth unchanged** (ADR-002): All insight routes remain behind the existing iron-session middleware
3 - **Template injection**: Template placeholders are string-interpolated, not eval'd. LLM input is not HTML — XSS risk is not applicable. Raw user strings (NL query) pass through as-is (acceptable: they go to the LLM, not an HTML renderer)

---

## NFR Implementation

1 - **Performance**: `buildPortfolioSnapshot()` already runs sub-service calls in parallel. No regressions expected; template rendering is purely synchronous string manipulation
2 - **Reliability**: Snapshot builder continues to use `null` fallbacks for failing sub-services. Template registry throws at startup for unknown types (fail-fast), not at request time
3 - **Maintainability**: Centralising all 7 prompts in one file (`template-registry.ts`) eliminates scattered `PROMPT_TEMPLATES` calls and makes prompt iteration faster
4 - **Token efficiency**: Existing `paiseToINR`, `buildAccountSummary` formatters are reused via `buildRenderContext()` — no regression in token footprint

---

## Error Handling

1 - **`UnknownInsightTypeError`**: Thrown by `getTemplate()` if an unregistered type is requested. Should be a startup-time error (all types are registered at module load); caught defensively in routes and returned as 500
2 - **Unresolved placeholder**: Logs a warning and resolves to empty string (non-fatal)
3 - **Snapshot sub-service failure**: Already handled — field set to null, builder continues

---

## External Dependencies

No new external dependencies. This bolt uses only existing internal services and the existing OpenAI gateway.

---

## Test Plan (for Stage 5)

1 - **`snapshot-builder.test.ts`**: `snapshotAt` present, `isStale` computed correctly, `employment: null` when none, projections null on timeout mock
2 - **`template-registry.test.ts`**: All 7 types registered, `getTemplate()` returns correct template, `renderTemplate()` resolves all known placeholders, warns + empty-string on unknown, `UnknownInsightTypeError` thrown for bad type
3 - **Use case smoke tests**: `generateSummary`, `generateProjections` etc. still produce the same response shape after migration
