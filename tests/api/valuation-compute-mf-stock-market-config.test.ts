import {
	GET as GET_MARKET_CONFIG,
	PUT as PUT_MARKET_CONFIG,
} from "@/app/api/v1/accounts/[id]/market-config/route";
import { POST as POST_ACCOUNT } from "@/app/api/v1/accounts/route";
import { POST as POST_MF_COMPUTE } from "@/app/api/v1/valuations/compute/mf/[accountId]/route";
import { POST as POST_STOCK_COMPUTE } from "@/app/api/v1/valuations/compute/stock/[accountId]/route";
import { prisma } from "@/infrastructure/prisma/client";
/**
 * Integration tests for bolt 004-valuation-engine: MF/stock compute and market-config APIs.
 * Mocks external fetchers (mfapi.in, Yahoo) for deterministic success/fallback/503 tests.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/infrastructure/market-data/mfapi-fetcher", () => ({
	fetchNav: vi.fn(),
}));
vi.mock("@/infrastructure/market-data/stock-fetcher", () => ({
	fetchPrice: vi.fn(),
}));

import { fetchNav } from "@/infrastructure/market-data/mfapi-fetcher";
import { fetchPrice } from "@/infrastructure/market-data/stock-fetcher";

async function createAccount(type: string, name: string, initialPaise: number) {
	const res = await POST_ACCOUNT(
		new Request("http://localhost/api/v1/accounts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ type, name, initialBalancePaise: initialPaise }),
		}),
	);
	expect(res.status).toBe(201);
	return (await res.json()) as { id: string };
}

describe("GET/PUT /api/v1/accounts/[id]/market-config", () => {
	it("should return 404 for non-existent account", async () => {
		const res = await GET_MARKET_CONFIG(
			new Request("http://localhost/api/v1/accounts/nonexistent/market-config"),
			{ params: Promise.resolve({ id: "nonexistent" }) },
		);
		expect(res.status).toBe(404);
	});

	it("should return 404 when account exists but has no market config", async () => {
		const account = await createAccount("mutual_fund", "MF No Config", 0);
		const res = await GET_MARKET_CONFIG(
			new Request(
				`http://localhost/api/v1/accounts/${account.id}/market-config`,
			),
			{ params: Promise.resolve({ id: account.id }) },
		);
		expect(res.status).toBe(404);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("NOT_FOUND");
	});

	it("should set and get market config for mutual_fund account", async () => {
		const account = await createAccount("mutual_fund", "MF With Config", 0);
		const putRes = await PUT_MARKET_CONFIG(
			new Request(
				`http://localhost/api/v1/accounts/${account.id}/market-config`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ schemeCode: "118834", units: 100.5 }),
				},
			),
			{ params: Promise.resolve({ id: account.id }) },
		);
		expect(putRes.status).toBe(200);
		const putData = (await putRes.json()) as {
			schemeCode: string;
			units: number;
		};
		expect(putData.schemeCode).toBe("118834");
		expect(putData.units).toBe(100.5);

		const getRes = await GET_MARKET_CONFIG(
			new Request(
				`http://localhost/api/v1/accounts/${account.id}/market-config`,
			),
			{ params: Promise.resolve({ id: account.id }) },
		);
		expect(getRes.status).toBe(200);
		const getData = (await getRes.json()) as {
			schemeCode: string;
			units: number;
		};
		expect(getData.schemeCode).toBe("118834");
		expect(getData.units).toBe(100.5);
	});

	it("should set and get market config for stocks account", async () => {
		const account = await createAccount("stocks", "Stock With Config", 0);
		const putRes = await PUT_MARKET_CONFIG(
			new Request(
				`http://localhost/api/v1/accounts/${account.id}/market-config`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ticker: "RELIANCE.NS", shares: 10 }),
				},
			),
			{ params: Promise.resolve({ id: account.id }) },
		);
		expect(putRes.status).toBe(200);
		const putData = (await putRes.json()) as { ticker: string; shares: number };
		expect(putData.ticker).toBe("RELIANCE.NS");
		expect(putData.shares).toBe(10);
	});

	it("should reject negative units with 400", async () => {
		const account = await createAccount("mutual_fund", "MF Bad Units", 0);
		const res = await PUT_MARKET_CONFIG(
			new Request(
				`http://localhost/api/v1/accounts/${account.id}/market-config`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ schemeCode: "118834", units: -1 }),
				},
			),
			{ params: Promise.resolve({ id: account.id }) },
		);
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should reject negative shares with 400", async () => {
		const account = await createAccount("stocks", "Stock Bad Shares", 0);
		const res = await PUT_MARKET_CONFIG(
			new Request(
				`http://localhost/api/v1/accounts/${account.id}/market-config`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ticker: "TCS.NS", shares: -5 }),
				},
			),
			{ params: Promise.resolve({ id: account.id }) },
		);
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});
});

describe("POST /api/v1/valuations/compute/mf/[accountId]", () => {
	beforeEach(() => {
		vi.mocked(fetchNav).mockReset();
	});

	it("should return 404 for non-existent account", async () => {
		const res = await POST_MF_COMPUTE(
			new Request("http://localhost/api/v1/valuations/compute/mf/nonexistent"),
			{ params: Promise.resolve({ accountId: "nonexistent" }) },
		);
		expect(res.status).toBe(404);
	});

	it("should return 409 when account is not mutual_fund", async () => {
		const account = await createAccount("stocks", "Stock Account", 0);
		const res = await POST_MF_COMPUTE(
			new Request(
				`http://localhost/api/v1/valuations/compute/mf/${account.id}`,
			),
			{ params: Promise.resolve({ accountId: account.id }) },
		);
		expect(res.status).toBe(409);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("ACCOUNT_TYPE_MISMATCH");
	});

	it("should return 400 when market config missing (no schemeCode/units)", async () => {
		const account = await createAccount("mutual_fund", "MF No Config", 0);
		const res = await POST_MF_COMPUTE(
			new Request(
				`http://localhost/api/v1/valuations/compute/mf/${account.id}`,
			),
			{ params: Promise.resolve({ accountId: account.id }) },
		);
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("MARKET_CONFIG_REQUIRED");
	});

	it("should compute MF and return 201 when fetchNav returns quote", async () => {
		vi.mocked(fetchNav).mockResolvedValue({
			navPerUnitPaise: 5500, // 55 INR in paise
			date: "2026-03-02",
		});
		const account = await createAccount("mutual_fund", "MF Compute Test", 0);
		await PUT_MARKET_CONFIG(
			new Request(
				`http://localhost/api/v1/accounts/${account.id}/market-config`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ schemeCode: "118834", units: 100 }),
				},
			),
			{ params: Promise.resolve({ id: account.id }) },
		);
		const res = await POST_MF_COMPUTE(
			new Request(
				`http://localhost/api/v1/valuations/compute/mf/${account.id}`,
			),
			{ params: Promise.resolve({ accountId: account.id }) },
		);
		expect(res.status).toBe(201);
		const data = (await res.json()) as {
			valuePaise: number;
			asOfDate: string;
			method: string;
			source: string;
		};
		expect(data.method).toBe("mf");
		expect(data.source).toBe("api");
		expect(data.valuePaise).toBe(550_000); // 100 units * 5500 paise
		expect(data.asOfDate).toBeDefined();

		const valuations = await prisma.valuation.findMany({
			where: { accountId: account.id },
			orderBy: { createdAt: "desc" },
			take: 1,
		});
		expect(valuations.length).toBe(1);
		expect(valuations[0].valuePaise).toBe(550_000);
	});

	it("should return 200 with fallback when fetchNav fails but previous valuation exists", async () => {
		vi.mocked(fetchNav).mockResolvedValue(null);
		const account = await createAccount("mutual_fund", "MF Fallback Test", 0);
		await PUT_MARKET_CONFIG(
			new Request(
				`http://localhost/api/v1/accounts/${account.id}/market-config`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ schemeCode: "118834", units: 100 }),
				},
			),
			{ params: Promise.resolve({ id: account.id }) },
		);
		// Create a valuation with a date later than account's initial valuation so it becomes "latest"
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		await prisma.valuation.create({
			data: { accountId: account.id, date: tomorrow, valuePaise: 500_000 },
		});
		const res = await POST_MF_COMPUTE(
			new Request(
				`http://localhost/api/v1/valuations/compute/mf/${account.id}`,
			),
			{ params: Promise.resolve({ accountId: account.id }) },
		);
		expect(res.status).toBe(200);
		const data = (await res.json()) as {
			valuePaise: number;
			source: string;
			warning: string;
		};
		expect(data.source).toBe("fallback");
		expect(data.valuePaise).toBe(500_000);
		expect(data.warning).toBeDefined();
	});

	it("should return 503 when fetchNav fails and no previous valuation", async () => {
		vi.mocked(fetchNav).mockResolvedValue(null);
		// Account without any valuation (create via Prisma so no initial valuation is added)
		const account = await prisma.account.create({
			data: {
				type: "mutual_fund",
				name: "MF No Previous",
				initialBalancePaise: 0,
			},
		});
		await PUT_MARKET_CONFIG(
			new Request(
				`http://localhost/api/v1/accounts/${account.id}/market-config`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ schemeCode: "118834", units: 100 }),
				},
			),
			{ params: Promise.resolve({ id: account.id }) },
		);
		const res = await POST_MF_COMPUTE(
			new Request(
				`http://localhost/api/v1/valuations/compute/mf/${account.id}`,
			),
			{ params: Promise.resolve({ accountId: account.id }) },
		);
		expect(res.status).toBe(503);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("FETCH_FAILED");
	});
});

describe("POST /api/v1/valuations/compute/stock/[accountId]", () => {
	beforeEach(() => {
		vi.mocked(fetchPrice).mockReset();
	});

	it("should return 404 for non-existent account", async () => {
		const res = await POST_STOCK_COMPUTE(
			new Request(
				"http://localhost/api/v1/valuations/compute/stock/nonexistent",
			),
			{ params: Promise.resolve({ accountId: "nonexistent" }) },
		);
		expect(res.status).toBe(404);
	});

	it("should return 409 when account is not stocks", async () => {
		const account = await createAccount("mutual_fund", "MF Account", 0);
		const res = await POST_STOCK_COMPUTE(
			new Request(
				`http://localhost/api/v1/valuations/compute/stock/${account.id}`,
			),
			{ params: Promise.resolve({ accountId: account.id }) },
		);
		expect(res.status).toBe(409);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("ACCOUNT_TYPE_MISMATCH");
	});

	it("should return 400 when market config missing (no ticker/shares)", async () => {
		const account = await createAccount("stocks", "Stock No Config", 0);
		const res = await POST_STOCK_COMPUTE(
			new Request(
				`http://localhost/api/v1/valuations/compute/stock/${account.id}`,
			),
			{ params: Promise.resolve({ accountId: account.id }) },
		);
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("MARKET_CONFIG_REQUIRED");
	});

	it("should compute stock and return 201 when fetchPrice returns quote", async () => {
		vi.mocked(fetchPrice).mockResolvedValue({
			pricePerSharePaise: 250000, // 2500 INR
			date: "2026-03-02",
		});
		const account = await createAccount("stocks", "Stock Compute Test", 0);
		await PUT_MARKET_CONFIG(
			new Request(
				`http://localhost/api/v1/accounts/${account.id}/market-config`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ticker: "RELIANCE.NS", shares: 5 }),
				},
			),
			{ params: Promise.resolve({ id: account.id }) },
		);
		const res = await POST_STOCK_COMPUTE(
			new Request(
				`http://localhost/api/v1/valuations/compute/stock/${account.id}`,
			),
			{ params: Promise.resolve({ accountId: account.id }) },
		);
		expect(res.status).toBe(201);
		const data = (await res.json()) as {
			valuePaise: number;
			asOfDate: string;
			method: string;
			source: string;
		};
		expect(data.method).toBe("stock");
		expect(data.source).toBe("api");
		expect(data.valuePaise).toBe(1_250_000); // 5 shares * 250000 paise
		expect(data.asOfDate).toBeDefined();

		const valuations = await prisma.valuation.findMany({
			where: { accountId: account.id },
			orderBy: { createdAt: "desc" },
			take: 1,
		});
		expect(valuations.length).toBe(1);
		expect(valuations[0].valuePaise).toBe(1_250_000);
	});

	it("should return 503 when fetchPrice fails and no previous valuation", async () => {
		vi.mocked(fetchPrice).mockResolvedValue(null);
		const account = await prisma.account.create({
			data: {
				type: "stocks",
				name: "Stock No Previous",
				initialBalancePaise: 0,
			},
		});
		await PUT_MARKET_CONFIG(
			new Request(
				`http://localhost/api/v1/accounts/${account.id}/market-config`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ticker: "RELIANCE.NS", shares: 5 }),
				},
			),
			{ params: Promise.resolve({ id: account.id }) },
		);
		const res = await POST_STOCK_COMPUTE(
			new Request(
				`http://localhost/api/v1/valuations/compute/stock/${account.id}`,
			),
			{ params: Promise.resolve({ accountId: account.id }) },
		);
		expect(res.status).toBe(503);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("FETCH_FAILED");
	});
});
