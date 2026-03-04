---
stage: model
bolt: 022-llm-insights-core
created: 2026-03-04T00:01:00Z
---

## Static Model: LLM Insights Core — Snapshot Builder & Template Registry

### Entities

- **PortfolioSnapshot**: Aggregated, immutable point-in-time view of the entire portfolio assembled for LLM prompt grounding.
  - Properties: `snapshotAt` (DateTime), `totalContributions` (paise integer, ADR-001), `totalCurrentValue` (paise integer, ADR-001), `allocationByType` (map of AccountType → paise), `accounts` (list of AccountSummary), `recentPerformance` (PerformanceSummary), `projections` (ProjectionSeries | null), `employment` (EmploymentContext | null), `gratuity` (GratuityContext | null)
  - Business Rules: Must be serialisable to deterministic JSON (no circular references, no undefined values). Monetary fields are always paise integers. If any sub-service fails, that field is `null` rather than propagating the error.

- **AccountSummary**: Compressed, LLM-readable summary of a single account's state.
  - Properties: `id`, `name`, `type` (AccountType), `currentValue` (paise), `totalInvested` (paise), `totalWithdrawn` (paise), `lastValuationAt` (DateTime | null), `isStale` (boolean, >30 days since last valuation)
  - Business Rules: Derived from account + latest valuation; not persisted independently.

- **PerformanceSummary**: Aggregate P&L and return metrics across the entire portfolio.
  - Properties: `absoluteReturn` (paise), `percentReturn` (number, 2dp), `xirr` (number | null), `sinceDate` (DateTime)
  - Business Rules: `xirr` may be null if insufficient data. Computed by existing performance service.

- **ProjectionSeries**: Deterministic projection output for portfolio or account scope.
  - Properties: `scope` (`portfolio` | `account`), `accountId` (string | null), `monthly` (list of {date, expectedValue}), `annualSummary` (list of {year, expectedValue}), `horizon` (years), `assumedRatePercent` (number)
  - Business Rules: Sourced from existing projections engine (bolts 020+). May be null if no contribution rates are set.

- **EmploymentContext**: Employment data relevant to LLM prompting for retirement/gratuity insights.
  - Properties: `basicSalaryPaise` (paise), `joiningDate` (Date), `yearsOfService` (number, 2dp computed), `employer` (string | null — not sent to OpenAI if set, see Constraints)
  - Business Rules: Derived from employment data store. `employer` is stripped before prompt serialisation (ADR-003 — no PII beyond financial aggregates to OpenAI).

- **GratuityContext**: Computed gratuity suggestion for the snapshot.
  - Properties: `suggestedAmountPaise` (paise), `computedAt` (DateTime), `formula` (string — human-readable formula used)
  - Business Rules: Computed by the gratuity calculation service (bolt 020). Null if joining date or salary not available.

- **InsightTemplate**: A versioned prompt template for a specific insight type.
  - Properties: `id` (InsightType), `version` (string, semver), `systemPrompt` (string), `userPromptTemplate` (string with `{{variable}}` placeholders), `outputSchema` (object describing expected LLM output shape), `isActive` (boolean)
  - Business Rules: Exactly one template per (id, version) pair — duplicate registration is a startup error. Placeholders reference keys in `PortfolioSnapshot` or passed params.

- **InsightResult**: Parsed, validated output from a single LLM call.
  - Properties: `type` (InsightType), `templateId`, `templateVersion`, `narrative` (string), `assumptions` (string[]), `disclaimer` (string — always present), `rawResponse` (string — stored for audit only)
  - Business Rules: `disclaimer` is always appended from the centralised `INSIGHT_DISCLAIMER` constant. `rawResponse` is never returned to the UI — audit only.

---

### Value Objects

- **InsightType**: Enumeration of all supported insight types.
  - Values: `portfolio-summary`, `future-projections`, `risk-analysis`, `rebalancing`, `natural-language-query`, `projection-quality-review`, `retirement-readiness`
  - Constraints: Finite closed set. Adding a new type requires a template registration.

- **TemplateKey**: Unique identifier for a specific template version.
  - Properties: `id` (InsightType), `version` (string)
  - Equality: By value — two keys with same id+version are equal.

- **PromptVariable**: A named value substituted into a template placeholder.
  - Properties: `name` (string), `value` (string | number | object)
  - Constraints: `name` must match a `{{name}}` placeholder in the template. Unresolved placeholders resolve to empty string with a warning.

- **InsightDisclaimer**: Centralised disclaimer text constant.
  - Value: Fixed string. Includes: data horizon, assumption notice, and "not financial advice" statement.
  - Constraints: Immutable. All insight types use the same disclaimer.

---

### Aggregates

- **PortfolioSnapshotAggregate**: Root is `PortfolioSnapshot`.
  - Members: `PortfolioSnapshot`, `AccountSummary[]`, `PerformanceSummary`, `ProjectionSeries?`, `EmploymentContext?`, `GratuityContext?`
  - Invariants: (1) All monetary fields are paise integers. (2) `snapshotAt` is always set. (3) Null fields indicate unavailable data — never omitted. (4) `employer` is always stripped before serialisation to external services.

- **TemplateRegistryAggregate**: Root is the registry itself (a singleton map).
  - Members: `InsightTemplate[]` (keyed by `TemplateKey`)
  - Invariants: (1) No two templates share the same (id, version). (2) At least one active template per InsightType at startup. (3) Template rendering resolves all `{{variable}}` placeholders.

---

### Domain Events

- **SnapshotBuilt**: Emitted when `buildSnapshot()` completes successfully.
  - Trigger: Successful aggregation of all available data sources
  - Payload: `snapshotAt`, `accountCount`, `projectionsAvailable` (bool), `employmentAvailable` (bool)
  - Usage: Logged to structured logger (Pino, info level); not persisted.

- **SnapshotSourceFailed**: Emitted when a sub-service fails during snapshot build.
  - Trigger: Any individual data source throws or times out
  - Payload: `sourceName` (e.g., `projections`, `gratuity`), `error` (message only, not stack)
  - Usage: Logged at warn level; snapshot continues with that field set to null.

- **TemplateRendered**: Emitted when `renderTemplate()` successfully produces a prompt.
  - Trigger: Template hydration succeeds
  - Payload: `insightType`, `templateVersion`, `unresolvedPlaceholders` (string[] — empty if all resolved)
  - Usage: Logged at debug level.

- **UnresolvedPlaceholderDetected**: Emitted when a placeholder cannot be resolved.
  - Trigger: `{{variable}}` key not found in snapshot or params
  - Payload: `templateId`, `placeholderName`
  - Usage: Logged at warn level; placeholder resolves to empty string.

---

### Domain Services

- **SnapshotBuilderService**: Orchestrates data aggregation into `PortfolioSnapshot`.
  - Operations: `buildSnapshot(userId: string, scope: SnapshotScope): Promise<PortfolioSnapshot>`
  - Dependencies: `AccountRepository`, `PerformanceService`, `ProjectionService`, `EmploymentService`, `GratuityService`
  - Behaviour: Calls each dependency in parallel where possible; tolerates individual failures (null fields).

- **TemplateRegistryService**: Manages and renders insight templates.
  - Operations:
    - `getTemplate(type: InsightType, version?: string): InsightTemplate` — returns active version if no version specified
    - `renderTemplate(template: InsightTemplate, snapshot: PortfolioSnapshot, params: PromptVariable[]): string`
    - `listTemplates(): InsightTemplate[]`
  - Dependencies: None (in-memory registry, registered at startup)
  - Behaviour: `getTemplate` throws `UnknownInsightTypeError` if type not registered. `renderTemplate` resolves `{{variable}}` placeholders; emits `UnresolvedPlaceholderDetected` for any missing.

- **SnapshotSerialisationService**: Converts `PortfolioSnapshot` to a deterministic JSON string safe for LLM prompt embedding.
  - Operations: `serialise(snapshot: PortfolioSnapshot): string`
  - Behaviour: Sorts object keys, strips undefined/null at top level only (nested nulls preserved), strips `employer` from `EmploymentContext`.

---

### Repository Interfaces

- **AccountRepository** (existing — referenced, not redefined):
  - Methods: `findAll(): Promise<Account[]>`, `findById(id): Promise<Account | null>`

- **PerformanceService** (existing — referenced):
  - Methods: `computePortfolioPerformance(): Promise<PerformanceSummary>`

- **ProjectionService** (existing — referenced, from bolt 020+):
  - Methods: `computePortfolioProjections(horizon: number): Promise<ProjectionSeries | null>`

- **EmploymentService** (existing — referenced):
  - Methods: `getEmploymentInfo(): Promise<EmploymentInfo | null>`

- **GratuityService** (existing — referenced, from bolt 020):
  - Methods: `computeGratuitySuggestion(salary, joiningDate, valuationDate): Promise<GratuityContext | null>`

---

### Ubiquitous Language

| Term | Definition |
|------|-----------|
| **PortfolioSnapshot** | A point-in-time aggregation of all portfolio data assembled specifically to ground an LLM prompt |
| **InsightType** | A named category of AI insight (e.g., `portfolio-summary`, `retirement-readiness`) |
| **InsightTemplate** | A versioned, named prompt template with variable placeholders and an expected output schema |
| **Template Registry** | The in-memory, startup-time catalogue of all `InsightTemplate` instances keyed by type+version |
| **Placeholder** | A `{{variable}}` token in a template string that is resolved at render time |
| **Grounding** | The act of embedding structured, deterministic portfolio data in an LLM prompt to reduce hallucination |
| **Paise** | The smallest monetary unit used in this system (1 INR = 100 paise); all monetary snapshot fields use paise integers (ADR-001) |
| **Stale account** | An account whose most recent valuation is older than 30 days |
| **Active template** | The current default template version for a given insight type; used when no version is specified |
| **SnapshotScope** | Whether a snapshot covers the whole portfolio (`portfolio`) or a single account (`account`) |
| **Disclaimer** | A fixed, centralised string appended to every AI insight indicating data assumptions and non-advisory nature |
| **UnknownInsightTypeError** | Thrown when the template registry is queried for an insight type that has no registered template |
