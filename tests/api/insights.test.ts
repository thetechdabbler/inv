/**
 * Integration tests for bolt 005-llm-insights API routes.
 * Mocks snapshot-builder and OpenAI gateway to keep tests fast and deterministic.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── Module mocks (hoisted) ────────────────────────────────────────────────────

vi.mock("@/application/insights/snapshot-builder");
vi.mock("@/infrastructure/openai/openai-gateway");
vi.mock("@/application/insights/llm-audit-service");
vi.mock("@/infrastructure/prisma/llm-query-repository");

import { GET as GET_HISTORY } from "@/app/api/v1/insights/history/route";
import { POST as POST_PROJECTIONS } from "@/app/api/v1/insights/projections/route";
import { POST as POST_QUERY } from "@/app/api/v1/insights/query/route";
import { POST as POST_REBALANCING } from "@/app/api/v1/insights/rebalancing/route";
import { GET as GET_RISK } from "@/app/api/v1/insights/risk-analysis/route";
import { GET as GET_SUMMARY } from "@/app/api/v1/insights/summary/route";
import { LLMAuditService } from "@/application/insights/llm-audit-service";
import { buildPortfolioSnapshot } from "@/application/insights/snapshot-builder";
import { LLMUnavailableError } from "@/domain/insights/llm-gateway";
import type { PortfolioSnapshot } from "@/domain/insights/types";
import { OpenAIGateway } from "@/infrastructure/openai/openai-gateway";
import { findAllLLMQueries } from "@/infrastructure/prisma/llm-query-repository";
import type { LLMQueryWithResponse } from "@/infrastructure/prisma/llm-query-repository";

// ── Helpers ───────────────────────────────────────────────────────────────────

const populatedSnapshot: PortfolioSnapshot = {
	accounts: [
		{
			type: "ppf",
			name: "My PPF",
			currentValuePaise: 200000_00,
			totalContributionsPaise: 180000_00,
		},
	],
	totalValuePaise: 200000_00,
	netInvestedPaise: 180000_00,
	profitLossPaise: 20000_00,
	percentReturn: 11.1,
	allocationByType: { ppf: 200000_00 },
};

const emptySnapshot: PortfolioSnapshot = {
	accounts: [],
	totalValuePaise: 0,
	netInvestedPaise: 0,
	profitLossPaise: 0,
	percentReturn: null,
	allocationByType: {},
};

function mockSnapshot(s: PortfolioSnapshot) {
	vi.mocked(buildPortfolioSnapshot).mockResolvedValue(s);
}

function mockGateway(response: { text: string; modelUsed?: string }) {
	const mockComplete = vi
		.fn()
		.mockResolvedValue({ modelUsed: "gpt-4o-mini", ...response });
	vi.mocked(OpenAIGateway).mockImplementation(
		() => ({ complete: mockComplete }) as unknown as OpenAIGateway,
	);
	return mockComplete;
}

function mockGatewayError(error: Error) {
	vi.mocked(OpenAIGateway).mockImplementation(
		() =>
			({
				complete: vi.fn().mockRejectedValue(error),
			}) as unknown as OpenAIGateway,
	);
}

function postProjections(body: unknown) {
	return POST_PROJECTIONS(
		new Request("http://localhost/api/v1/insights/projections", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		}),
	);
}

function postRebalancing(body: unknown) {
	return POST_REBALANCING(
		new Request("http://localhost/api/v1/insights/rebalancing", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		}),
	);
}

function postQuery(body: unknown) {
	return POST_QUERY(
		new Request("http://localhost/api/v1/insights/query", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		}),
	);
}

// ── Setup / Teardown ──────────────────────────────────────────────────────────

const ORIGINAL_API_KEY = process.env.OPENAI_API_KEY;

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(LLMAuditService).mockImplementation(
		() =>
			({
				logQuery: vi.fn().mockResolvedValue({ id: "q-audit-1" }),
				logResponse: vi.fn().mockResolvedValue(undefined),
			}) as unknown as LLMAuditService,
	);
});

afterEach(() => {
	if (ORIGINAL_API_KEY === undefined) {
		process.env.OPENAI_API_KEY = "";
	} else {
		process.env.OPENAI_API_KEY = ORIGINAL_API_KEY;
	}
});

// ── GET /api/v1/insights/summary ──────────────────────────────────────────────

describe("GET /api/v1/insights/summary", () => {
	it("should return 503 when OPENAI_API_KEY is not set", async () => {
		process.env.OPENAI_API_KEY = "";
		const res = await GET_SUMMARY();
		expect(res.status).toBe(503);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("SERVICE_UNAVAILABLE");
	});

	it("should return 400 for empty portfolio", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(emptySnapshot);
		const res = await GET_SUMMARY();
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 200 with summary on success", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(populatedSnapshot);
		mockGateway({
			text: "Your portfolio is healthy.",
			modelUsed: "gpt-4o-mini",
		});

		const res = await GET_SUMMARY();
		expect(res.status).toBe(200);
		const data = (await res.json()) as { summary: string; modelUsed: string };
		expect(data.summary).toBe("Your portfolio is healthy.");
		expect(data.modelUsed).toBe("gpt-4o-mini");
	});

	it("should return 503 when LLM is unavailable", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(populatedSnapshot);
		mockGatewayError(new LLMUnavailableError("OpenAI API error (429)"));

		const res = await GET_SUMMARY();
		expect(res.status).toBe(503);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("SERVICE_UNAVAILABLE");
	});
});

// ── POST /api/v1/insights/projections ────────────────────────────────────────

const validProjectionsResponse = JSON.stringify({
	optimistic: { narrative: "Optimistic: ₹40L in 10 years." },
	expected: { narrative: "Expected: ₹30L in 10 years." },
	conservative: { narrative: "Conservative: ₹20L in 10 years." },
});

describe("POST /api/v1/insights/projections", () => {
	it("should return 503 when OPENAI_API_KEY is not set", async () => {
		process.env.OPENAI_API_KEY = "";
		const res = await postProjections({ timeHorizonYears: 10 });
		expect(res.status).toBe(503);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("SERVICE_UNAVAILABLE");
	});

	it("should return 400 for missing timeHorizonYears", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		const res = await postProjections({});
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 400 for timeHorizonYears = 0", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		const res = await postProjections({ timeHorizonYears: 0 });
		expect(res.status).toBe(400);
	});

	it("should return 400 for timeHorizonYears = 31", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		const res = await postProjections({ timeHorizonYears: 31 });
		expect(res.status).toBe(400);
	});

	it("should return 400 for fractional timeHorizonYears", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		const res = await postProjections({ timeHorizonYears: 5.5 });
		expect(res.status).toBe(400);
	});

	it("should return 400 for empty portfolio", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(emptySnapshot);
		const res = await postProjections({ timeHorizonYears: 10 });
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 200 with all three scenarios on success", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(populatedSnapshot);
		mockGateway({ text: validProjectionsResponse });

		const res = await postProjections({ timeHorizonYears: 10 });
		expect(res.status).toBe(200);
		const data = (await res.json()) as {
			timeHorizonYears: number;
			optimistic: { label: string; narrative: string };
			expected: { label: string };
			conservative: { label: string };
		};
		expect(data.timeHorizonYears).toBe(10);
		expect(data.optimistic.label).toBe("optimistic");
		expect(data.optimistic.narrative).toContain("₹40L");
		expect(data.expected.label).toBe("expected");
		expect(data.conservative.label).toBe("conservative");
	});

	it("should return 503 when LLM is unavailable", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(populatedSnapshot);
		mockGatewayError(new LLMUnavailableError("timeout"));

		const res = await postProjections({ timeHorizonYears: 10 });
		expect(res.status).toBe(503);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("SERVICE_UNAVAILABLE");
	});
});

// ── GET /api/v1/insights/risk-analysis ───────────────────────────────────────

const validRiskResponse = JSON.stringify({
	riskFactors: [
		{
			severity: "high",
			description: "Concentration in PPF",
			mitigation: "Add equity exposure",
		},
	],
});

describe("GET /api/v1/insights/risk-analysis", () => {
	it("should return 503 when OPENAI_API_KEY is not set", async () => {
		process.env.OPENAI_API_KEY = "";
		const res = await GET_RISK();
		expect(res.status).toBe(503);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("SERVICE_UNAVAILABLE");
	});

	it("should return 400 for empty portfolio", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(emptySnapshot);
		const res = await GET_RISK();
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 200 with risk factors on success", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(populatedSnapshot);
		mockGateway({ text: validRiskResponse });

		const res = await GET_RISK();
		expect(res.status).toBe(200);
		const data = (await res.json()) as {
			riskFactors: Array<{ severity: string; description: string }>;
		};
		expect(data.riskFactors).toHaveLength(1);
		expect(data.riskFactors[0].severity).toBe("high");
		expect(data.riskFactors[0].description).toBe("Concentration in PPF");
	});

	it("should return 503 when LLM is unavailable", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(populatedSnapshot);
		mockGatewayError(new LLMUnavailableError("rate limit"));

		const res = await GET_RISK();
		expect(res.status).toBe(503);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("SERVICE_UNAVAILABLE");
	});
});

// ── POST /api/v1/insights/rebalancing ─────────────────────────────────────────

const validRebalancingResponse = JSON.stringify({
	actions: [
		{
			accountType: "ppf",
			action: "maintain",
			suggestion: "Keep current PPF contributions.",
		},
		{
			accountType: "mutual_fund",
			action: "increase",
			suggestion: "Increase SIP by ₹5,000/month.",
		},
	],
	narrative:
		"Portfolio is well-structured but could benefit from more equity exposure.",
});

describe("POST /api/v1/insights/rebalancing", () => {
	it("should return 503 when OPENAI_API_KEY is not set", async () => {
		process.env.OPENAI_API_KEY = "";
		const res = await postRebalancing({});
		expect(res.status).toBe(503);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("SERVICE_UNAVAILABLE");
	});

	it("should return 400 for non-object targetAllocation", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		const res = await postRebalancing({ targetAllocation: [0.5, 0.5] });
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 400 when targetAllocation values don't sum to 1.0", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(populatedSnapshot);
		const res = await postRebalancing({
			targetAllocation: { equity: 0.5, debt: 0.3 },
		});
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 400 for empty portfolio", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(emptySnapshot);
		const res = await postRebalancing({});
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 200 with actions on success (no target)", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(populatedSnapshot);
		mockGateway({ text: validRebalancingResponse });

		const res = await postRebalancing({});
		expect(res.status).toBe(200);
		const data = (await res.json()) as {
			actions: Array<{ accountType: string; action: string }>;
			narrative: string;
		};
		expect(data.actions).toHaveLength(2);
		expect(data.actions[0].action).toBe("maintain");
		expect(data.narrative).toContain("equity exposure");
	});

	it("should return 200 with valid targetAllocation", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(populatedSnapshot);
		mockGateway({ text: validRebalancingResponse });
		const res = await postRebalancing({
			targetAllocation: { ppf: 0.4, mutual_fund: 0.6 },
		});
		expect(res.status).toBe(200);
	});

	it("should return 503 when LLM is unavailable", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(populatedSnapshot);
		mockGatewayError(new LLMUnavailableError("rate limit"));

		const res = await postRebalancing({});
		expect(res.status).toBe(503);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("SERVICE_UNAVAILABLE");
	});
});

// ── POST /api/v1/insights/query ───────────────────────────────────────────────

describe("POST /api/v1/insights/query", () => {
	it("should return 503 when OPENAI_API_KEY is not set", async () => {
		process.env.OPENAI_API_KEY = "";
		const res = await postQuery({ question: "What is my return?" });
		expect(res.status).toBe(503);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("SERVICE_UNAVAILABLE");
	});

	it("should return 400 for missing question field", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		const res = await postQuery({});
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 400 for empty question string", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		const res = await postQuery({ question: "   " });
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 400 for question exceeding max length", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		const res = await postQuery({ question: "a".repeat(1001) });
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 400 for empty portfolio", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(emptySnapshot);
		const res = await postQuery({ question: "What is my return?" });
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 200 with answer on success", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(populatedSnapshot);
		mockGateway({
			text: "Your portfolio return is 11.1%.",
			modelUsed: "gpt-4o-mini",
		});

		const res = await postQuery({ question: "What is my return?" });
		expect(res.status).toBe(200);
		const data = (await res.json()) as { answer: string; modelUsed: string };
		expect(data.answer).toBe("Your portfolio return is 11.1%.");
		expect(data.modelUsed).toBe("gpt-4o-mini");
	});

	it("should return 503 when LLM is unavailable", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		mockSnapshot(populatedSnapshot);
		mockGatewayError(new LLMUnavailableError("API error"));

		const res = await postQuery({ question: "What is my return?" });
		expect(res.status).toBe(503);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("SERVICE_UNAVAILABLE");
	});
});

// ── GET /api/v1/insights/history ──────────────────────────────────────────────

const sampleHistoryRecord: LLMQueryWithResponse = {
	id: "clm1234",
	insightType: "summary",
	prompt: "You are a financial advisor...",
	modelRequested: "gpt-4o-mini",
	createdAt: new Date("2026-03-03T00:00:00Z"),
	response: {
		responseText: "Your portfolio looks healthy.",
		modelUsed: "gpt-4o-mini",
		tokensUsed: 120,
		success: true,
		errorMessage: null,
		createdAt: new Date("2026-03-03T00:00:00Z"),
	},
};

describe("GET /api/v1/insights/history", () => {
	it("should return 200 with interactions and total", async () => {
		vi.mocked(findAllLLMQueries).mockResolvedValue({
			records: [sampleHistoryRecord],
			total: 1,
		});

		const res = await GET_HISTORY(
			new Request("http://localhost/api/v1/insights/history"),
		);
		expect(res.status).toBe(200);
		const data = (await res.json()) as {
			interactions: Array<{
				id: string;
				insightType: string;
				response: string;
				success: boolean;
			}>;
			total: number;
		};
		expect(data.total).toBe(1);
		expect(data.interactions).toHaveLength(1);
		expect(data.interactions[0].id).toBe("clm1234");
		expect(data.interactions[0].insightType).toBe("summary");
		expect(data.interactions[0].response).toBe("Your portfolio looks healthy.");
		expect(data.interactions[0].success).toBe(true);
	});

	it("should use default limit=20 and offset=0", async () => {
		vi.mocked(findAllLLMQueries).mockResolvedValue({ records: [], total: 0 });

		await GET_HISTORY(new Request("http://localhost/api/v1/insights/history"));
		expect(findAllLLMQueries).toHaveBeenCalledWith({ limit: 20, offset: 0 });
	});

	it("should pass parsed limit and offset query params", async () => {
		vi.mocked(findAllLLMQueries).mockResolvedValue({ records: [], total: 0 });

		await GET_HISTORY(
			new Request("http://localhost/api/v1/insights/history?limit=5&offset=10"),
		);
		expect(findAllLLMQueries).toHaveBeenCalledWith({ limit: 5, offset: 10 });
	});

	it("should return empty interactions for empty history", async () => {
		vi.mocked(findAllLLMQueries).mockResolvedValue({ records: [], total: 0 });

		const res = await GET_HISTORY(
			new Request("http://localhost/api/v1/insights/history"),
		);
		expect(res.status).toBe(200);
		const data = (await res.json()) as {
			interactions: unknown[];
			total: number;
		};
		expect(data.interactions).toHaveLength(0);
		expect(data.total).toBe(0);
	});
});
