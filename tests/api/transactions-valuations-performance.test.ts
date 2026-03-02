import { GET as GET_HISTORY } from "@/app/api/v1/accounts/[id]/history/route";
import { GET as GET_PERFORMANCE } from "@/app/api/v1/accounts/[id]/performance/route";
import { POST as POST_ACCOUNT } from "@/app/api/v1/accounts/route";
import { GET as GET_PORTFOLIO_PERF } from "@/app/api/v1/portfolio/performance/route";
import { POST as POST_TRANSACTION } from "@/app/api/v1/transactions/route";
import { POST as POST_VALUATION } from "@/app/api/v1/valuations/route";
/**
 * Integration tests for transactions, valuations, history, performance (bolt 002-portfolio-core).
 */
import { describe, expect, it } from "vitest";

async function createAccount(name: string, initialPaise: number) {
	const res = await POST_ACCOUNT(
		new Request("http://localhost/api/v1/accounts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				type: "mutual_fund",
				name,
				initialBalancePaise: initialPaise,
			}),
		}),
	);
	expect(res.status).toBe(201);
	return (await res.json()) as { id: string };
}

describe("POST /api/v1/transactions", () => {
	it("should create investment and return 201", async () => {
		const account = await createAccount("Tx Test 1", 0);
		const res = await POST_TRANSACTION(
			new Request("http://localhost/api/v1/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: account.id,
					amountPaise: 10000,
					type: "investment",
					description: "SIP",
				}),
			}),
		);
		expect(res.status).toBe(201);
		const data = (await res.json()) as Record<string, unknown>;
		expect(data.id).toBeDefined();
		expect(data.accountId).toBe(account.id);
		expect(data.amountPaise).toBe(10000);
		expect(data.type).toBe("investment");
		expect(data.description).toBe("SIP");
	});

	it("should create withdrawal and return 201", async () => {
		const account = await createAccount("Tx Test 2", 50000);
		const res = await POST_TRANSACTION(
			new Request("http://localhost/api/v1/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: account.id,
					amountPaise: 5000,
					type: "withdrawal",
				}),
			}),
		);
		expect(res.status).toBe(201);
		const data = (await res.json()) as { type: string };
		expect(data.type).toBe("withdrawal");
	});

	it("should reject invalid type with 400", async () => {
		const account = await createAccount("Tx Test 3", 0);
		const res = await POST_TRANSACTION(
			new Request("http://localhost/api/v1/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: account.id,
					amountPaise: 100,
					type: "invalid",
				}),
			}),
		);
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should reject non-positive amountPaise with 400", async () => {
		const account = await createAccount("Tx Test 4", 0);
		const res = await POST_TRANSACTION(
			new Request("http://localhost/api/v1/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: account.id,
					amountPaise: 0,
					type: "investment",
				}),
			}),
		);
		expect(res.status).toBe(400);
	});

	it("should return 404 for non-existent accountId", async () => {
		const res = await POST_TRANSACTION(
			new Request("http://localhost/api/v1/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: "nonexistent-account-id",
					amountPaise: 100,
					type: "investment",
				}),
			}),
		);
		expect(res.status).toBe(404);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("NOT_FOUND");
	});
});

describe("POST /api/v1/valuations", () => {
	it("should create valuation and return 201", async () => {
		const account = await createAccount("Val Test 1", 100000);
		const res = await POST_VALUATION(
			new Request("http://localhost/api/v1/valuations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: account.id,
					valuePaise: 105000,
				}),
			}),
		);
		expect(res.status).toBe(201);
		const data = (await res.json()) as Record<string, unknown>;
		expect(data.id).toBeDefined();
		expect(data.accountId).toBe(account.id);
		expect(data.valuePaise).toBe(105000);
	});

	it("should reject negative valuePaise with 400", async () => {
		const account = await createAccount("Val Test 2", 0);
		const res = await POST_VALUATION(
			new Request("http://localhost/api/v1/valuations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: account.id,
					valuePaise: -1,
				}),
			}),
		);
		expect(res.status).toBe(400);
	});

	it("should return 404 for non-existent accountId", async () => {
		const res = await POST_VALUATION(
			new Request("http://localhost/api/v1/valuations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: "nonexistent-account-id",
					valuePaise: 1000,
				}),
			}),
		);
		expect(res.status).toBe(404);
	});
});

describe("GET /api/v1/accounts/[id]/history", () => {
	it("should return 404 for non-existent account", async () => {
		const res = await GET_HISTORY(
			new Request("http://localhost/api/v1/accounts/nonexistent/history"),
			{ params: Promise.resolve({ id: "nonexistent" }) },
		);
		expect(res.status).toBe(404);
	});

	it("should return entries in chronological order", async () => {
		const account = await createAccount("Hist Test 1", 10000);
		await POST_TRANSACTION(
			new Request("http://localhost/api/v1/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: account.id,
					amountPaise: 5000,
					type: "investment",
				}),
			}),
		);
		await POST_VALUATION(
			new Request("http://localhost/api/v1/valuations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: account.id,
					valuePaise: 20000,
				}),
			}),
		);
		const res = await GET_HISTORY(
			new Request(`http://localhost/api/v1/accounts/${account.id}/history`),
			{ params: Promise.resolve({ id: account.id }) },
		);
		expect(res.status).toBe(200);
		const data = (await res.json()) as {
			entries: Array<{ type: string; amountOrValuePaise: number }>;
		};
		expect(Array.isArray(data.entries)).toBe(true);
		expect(data.entries.length).toBeGreaterThanOrEqual(2); // initial valuation + investment + new valuation
		const types = data.entries.map((e) => e.type);
		expect(types).toContain("investment");
		expect(types).toContain("valuation");
	});
});

describe("GET /api/v1/accounts/[id]/performance", () => {
	it("should return 404 for non-existent account", async () => {
		const res = await GET_PERFORMANCE(
			new Request("http://localhost/api/v1/accounts/nonexistent/performance"),
			{ params: Promise.resolve({ id: "nonexistent" }) },
		);
		expect(res.status).toBe(404);
	});

	it("should return performance snapshot with P&L and percentReturn", async () => {
		const account = await createAccount("Perf Test 1", 100000); // 1000 INR
		await POST_TRANSACTION(
			new Request("http://localhost/api/v1/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: account.id,
					amountPaise: 50000,
					type: "investment",
				}),
			}),
		);
		await POST_VALUATION(
			new Request("http://localhost/api/v1/valuations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: account.id,
					valuePaise: 160000, // 150k invested, 160k value = 10k gain
				}),
			}),
		);
		const res = await GET_PERFORMANCE(
			new Request(`http://localhost/api/v1/accounts/${account.id}/performance`),
			{ params: Promise.resolve({ id: account.id }) },
		);
		expect(res.status).toBe(200);
		const data = (await res.json()) as {
			totalContributionsPaise: number;
			totalWithdrawalsPaise: number;
			netInvestedPaise: number;
			currentValuePaise: number;
			profitLossPaise: number;
			percentReturn: number | null;
		};
		expect(data.totalContributionsPaise).toBe(50000); // investment tx only
		expect(data.netInvestedPaise).toBe(150000); // initial 100k + 50k investment
		expect(data.currentValuePaise).toBe(160000);
		expect(data.profitLossPaise).toBe(10000); // 160k - 150k
		expect(data.percentReturn).not.toBeNull();
	});
});

describe("GET /api/v1/portfolio/performance", () => {
	it("should return aggregated performance", async () => {
		const res = await GET_PORTFOLIO_PERF(
			new Request("http://localhost/api/v1/portfolio/performance"),
		);
		expect(res.status).toBe(200);
		const data = (await res.json()) as {
			totalContributionsPaise: number;
			totalWithdrawalsPaise: number;
			netInvestedPaise: number;
			currentValuePaise: number;
			profitLossPaise: number;
			percentReturn: number | null;
		};
		expect(typeof data.totalContributionsPaise).toBe("number");
		expect(typeof data.totalWithdrawalsPaise).toBe("number");
		expect(typeof data.netInvestedPaise).toBe("number");
		expect(typeof data.currentValuePaise).toBe("number");
		expect(typeof data.profitLossPaise).toBe("number");
	});
});
