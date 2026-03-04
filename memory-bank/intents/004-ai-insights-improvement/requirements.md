---
intent: 004-ai-insights-improvement
phase: inception
status: inception-complete
created: 2026-03-03T10:45:00.000Z
updated: 2026-03-03T10:45:00.000Z
---

# Requirements: AI Insights Improvement

## Intent Overview

Improve the existing AI Insights module so that it can fully leverage all available data and features in the system (accounts, transactions, valuations, projections, employment info, gratuity engine, UI context) to deliver richer, more accurate, and more actionable insights. This includes better prompt engineering, tighter integration with deterministic engines (valuation, projections), smarter use of historical data, and UX wiring that makes AI outputs feel trustworthy and useful for decision-making.

Next.js full-stack application with an OpenAI-backed insights service. This intent focuses on enhancements to the `llm-insights` backend unit and its integration points with the UI and deterministic engines, not on core CRUD or valuation logic already delivered by other intents.

Single-user personal deployment with existing auth and storage; no new auth requirements.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Make AI insights more accurate and grounded | LLM prompts always include structured portfolio, projections, and employment context | Must |
| Improve usefulness of AI recommendations | Users can act on at least 3 concrete recommendations per session | Must |
| Reduce noise and hallucinations | All insights clearly show assumptions, data sources and limitations | Must |
| Expose more insight types | Add at least 3 new insight patterns using existing data (e.g., cashflow, goal alignment, retirement readiness) | Should |
| Improve insight UX | AI section in UI shows history, categories and quick actions | Should |

---

## Functional Requirements

### AFR-1: Ground LLM Prompts in Full System Context
- **Description**: Ensure all AI insight prompts are grounded in the richest possible structured data from the system: portfolio state, deterministic projections, employment & gratuity context, and recent user interactions.
- **Acceptance Criteria**:
  1. For portfolio-level insights, prompts include: aggregated contributions, current values, allocation by type, recent performance, and deterministic projections (expected path).
  2. For account-specific insights, prompts include that account’s history (investments, withdrawals, valuations), expected rate & contributions, and projection vs actual comparison.
  3. For retirement/tenure-related insights, prompts include employment info (basic salary, joining date), gratuity suggestions, and relevant projections.
  4. A unified "portfolio snapshot" structure is defined and reused across all prompt templates.
- **Priority**: Must

### AFR-2: Insight Types and Templates
- **Description**: Extend and refine insight types (summary, projections, risk, rebalancing, NL query) with explicit prompt templates and output schemas.
- **Acceptance Criteria**:
  1. Each existing insight type (summary, projections, risk, rebalancing, NL query) has a named prompt template with documented inputs and expected JSON-like output shape.
  2. Templates are versioned and can be switched without code changes (e.g., via configuration or template registry).
  3. At least one new insight type is added that uses projections (e.g., "projection quality review" comparing deterministic vs LLM view).
  4. At least one new insight type is added that uses employment/gratuity context (e.g., "retirement/gratuity readiness").
- **Priority**: Must

### AFR-3: Deterministic + LLM Hybrid Projections
- **Description**: Combine deterministic projection engine outputs with LLM narratives to provide hybrid projections that are both numerically grounded and narratively rich.
- **Acceptance Criteria**:
  1. LLM projection prompts always include deterministic projection series (Monthly/QoQ/YoY) for the selected scope.
  2. LLM responses clearly distinguish between "deterministic baseline" and "LLM-adjusted scenario" when applicable.
  3. For projection vs valuation contexts, LLM can comment on whether the user is ahead or behind plan and why.
  4. The API returns both structured deterministic data and LLM narrative in a single response for projection-related endpoints.
- **Priority**: Should

### AFR-4: Insight Quality and Safety Controls
- **Description**: Introduce guardrails and evaluation hooks to keep AI insights safe, non-prescriptive, and traceable.
- **Acceptance Criteria**:
  1. All user-visible AI insights include a consistent disclaimer and highlight assumptions (rates, horizons, instruments covered).
  2. Responses are post-processed to remove explicit investment product recommendations and replace them with general, non-prescriptive guidance.
  3. Key metrics per insight (tokens used, model, latency, success/failure) are captured in the audit trail.
  4. There is a simple internal "debug" view or log format that surfaces raw prompts and responses for developer inspection (behind auth).
- **Priority**: Should

### AFR-5: Insight UX Enhancements
- **Description**: Improve the AI Insights UI so that users can see history, categories, and act on insights more easily.
- **Acceptance Criteria**:
  1. Insights history is grouped by type (summary, projection, risk, rebalancing, Q&A) with timestamps and short titles.
  2. Each insight card offers at least one quick action (e.g., "re-run with different horizon", "open related account", "view projection chart").
  3. Users can filter insights by account, type, and date range.
  4. The AI Insights page clearly differentiates between "data-driven" elements (numbers/charts) and "LLM narrative" text.
- **Priority**: Should

---

## Non-Functional Requirements

### Performance & Cost
| Requirement | Metric | Target |
|-------------|--------|--------|
| LLM response latency | p95 | ≤ 15s |
| Token usage | Average tokens per insight | Documented per insight type |
| API overhead | Additional latency from deterministic data fetching | ≤ 150ms |

### Reliability & Safety
| Requirement | Metric | Target |
|-------------|--------|--------|
| Prompt failures | Error rate | < 2% (graceful fallbacks) |
| Hallucination risk | Qualitative | Minimized via grounding & disclaimers |
| Audit coverage | % insights logged with metadata | 100% |

---

## Constraints

- Must continue to use OpenAI API (GPT-4o / GPT-4o-mini) as per existing standards.
- No PII beyond current financial aggregates and employment metadata; no raw employer identifiers sent to OpenAI.
- Changes should not break existing `003-llm-insights` flows; improvements should be backward compatible or feature-flagged.

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Which new insight types deliver the highest value for the primary user? | Product/Developer | During AFR-2 design | Pending |
| How aggressively should deterministic vs LLM projections diverge in messaging? | Developer | During AFR-3 design | Pending |
| Do we need a separate "evaluation harness" for insight quality, or is manual review sufficient initially? | Developer | During operations rollout | Pending |

