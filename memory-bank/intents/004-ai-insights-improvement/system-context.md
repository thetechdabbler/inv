---
intent: 004-ai-insights-improvement
phase: inception
status: in-progress
created: 2026-03-03T10:45:00.000Z
updated: 2026-03-03T10:45:00.000Z
---

# System Context: AI Insights Improvement

## Overview

This intent refines the AI Insights capability within the existing Investment Tracker system. It assumes the core portfolio, valuation engine, employment/gratuity modules, and UI are already in place. The focus is on how the LLM-based insights service consumes data from those modules and returns grounded, actionable narratives to the frontend.

## Context Diagram (Logical)

```text
User
  │
  ▼
Investment Tracker UI (Next.js)
  │       ▲
  │ REST  │ JSON (insights, history)
  ▼       │
LLM Insights Service (/api/v1/insights/*)
  │
  ├──► Portfolio Core (accounts, transactions, performance)
  │
  ├──► Valuation Engine (deterministic valuations & projections)
  │
  ├──► Employment & Gratuity Module (salary, tenure, gratuity suggestions)
  │
  └──► OpenAI API (GPT-4o / GPT-4o-mini)
```

## Upstream Systems (Data Providers)

- **Portfolio Core (001-portfolio-core)**  
  Accounts, transactions, valuations, performance snapshots, allocation data.

- **Valuation Engine (002-valuation-engine)**  
  Deterministic valuations for PPF/EPF/deposits, MF/stock market data, deterministic projection engine.

- **LLM Insights (003-llm-insights)**  
  Existing insight flows and audit trail tables (to be enhanced, not replaced).

- **Employment & Gratuity Module**  
  Employment info (basic salary, joining date), gratuity suggestion engine and related valuations.

## Downstream Consumers

- **Investment Tracker UI (005-investment-tracker-ui)**  
  - AI Insights page (chat + insight cards).
  - Dashboard / Projections pages that may surface LLM narratives alongside charts.

## External Dependencies

- **OpenAI API**  
  - Models: GPT-4o / GPT-4o-mini.
  - Used for narrative summaries, explanations, and scenario analysis.

## Data Contracts (High-Level)

- **Portfolio Snapshot → LLM**  
  - Aggregated financial data (by account, by type).
  - Projection series (monthly/QoQ/YoY) for relevant scopes.
  - Employment and gratuity context when needed.

- **LLM Response → UI**  
  - Structured JSON sections (e.g., `summary`, `risks`, `actions`) plus narrative text.
  - Metadata (model, tokens, latency, success flag).

## Non-Goals for This Intent

- Changing core portfolio, valuation or employment domain models.
- Redesigning the entire AI Insights UI layout (only incremental improvements).
- Introducing new external AI providers beyond OpenAI.

