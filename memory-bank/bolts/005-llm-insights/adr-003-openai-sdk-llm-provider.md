---
bolt: 005-llm-insights
created: 2026-03-02T23:05:00Z
status: accepted
superseded_by: null
---

# ADR-003: Use OpenAI Node SDK Behind a Hexagonal LLM Port

## Context

The LLM Insights unit (003) requires an LLM to generate portfolio summaries, future value projections, and risk analysis. The project needs to choose a concrete AI provider and SDK, and decide how tightly to couple the application to it. The tech-stack standard (TypeScript + Next.js) does not specify an AI/LLM library. Two concerns arise: (1) which provider and SDK to use today, and (2) how to structure the integration so the choice is not irreversible.

## Decision

Use the official **OpenAI Node SDK** (`openai` npm package) as the concrete LLM inference implementation, accessed exclusively through an `LLMGateway` port (hexagonal / ports-and-adapters pattern). The application layer calls only the port interface; the infrastructure layer provides the OpenAI implementation.

Model tier strategy:
- **GPT-4o-mini**: Default for all three insights (summary, projections, risk). Cost-efficient; sufficient for structured prompt → structured response tasks.
- **GPT-4o**: Available as a configurable override (env var or per-request option) for complex or high-stakes analysis.

## Rationale

OpenAI is the de-facto standard for production LLM integration in Node.js projects. The official SDK handles authentication, retries, streaming (future use), and type safety out of the box. GPT-4o-mini offers a strong quality/cost balance for the relatively simple prompt patterns used here (portfolio snapshot → narrative or structured JSON).

The hexagonal port is the critical architectural guard: no application or domain code imports `openai` directly. This means the provider can be swapped (e.g. to Anthropic, Gemini, or a local model) by replacing the infrastructure adapter without touching business logic.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Direct `fetch` to OpenAI REST API | No dependency, full control | Reinvents retry/auth/type handling; error-prone | More maintenance burden than value gained |
| Vercel AI SDK (`ai` package) | Provider-agnostic, streaming support | Adds abstraction on top of another abstraction; overkill for current scope | Can be adopted in bolt 006 if streaming is needed |
| Anthropic SDK (Claude) | Strong reasoning; same port pattern applies | Higher cost per token at comparable quality for financial text; unfamiliar prompting conventions | Can be substituted via port in future without code changes |
| LangChain | Rich ecosystem, prompt chains | Heavy dependency, complex API surface, frequently breaking changes | Overcomplicated for 3 structured prompt patterns |

## Consequences

### Positive

- Official SDK: typed, maintained, handles auth headers, rate-limit retries, and request timeouts.
- Port boundary: provider swap requires only a new infrastructure class, no domain/application changes.
- GPT-4o-mini default keeps token costs low for the personal-use tracker scale.
- Model tier is configurable at runtime — cost vs quality tradeoff is externalized.

### Negative

- Direct OpenAI dependency in `package.json`; if OpenAI changes pricing or policy significantly, migration is necessary (mitigated by port boundary).
- GPT-4o-mini may occasionally produce less precise numerical projections than GPT-4o; prompts must be carefully structured to compensate.

### Risks

- **API key exposure**: Mitigated — key sourced from env var only; never logged, never included in client bundles; 503 returned if absent.
- **Latency spikes (>15s)**: Mitigated — SDK timeout configured at 15s; frontend shows loading state; 503 returned on timeout.
- **Token cost overrun**: Mitigated — portfolio snapshot summarized before prompt build (token optimization); GPT-4o-mini default; usage logged in bolt 006 audit trail.

## Related

- **Stories**: 001-portfolio-summary, 002-future-projections, 003-risk-analysis
- **Standards**: Consider adding LLM integration guidance to tech-stack.md after bolt 006
- **Previous ADRs**: ADR-001 (paise monetary amounts — snapshot values passed to LLM must use paise as internal representation, display formatting only in prompt text)
