/**
 * Unit tests for bolt 022: buildRenderContext() addition to snapshot-formatter.
 */

import { buildRenderContext } from "@/application/insights/snapshot-formatter";
import type { PortfolioSnapshot } from "@/domain/insights/types";
import { describe, expect, it } from "vitest";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const minimalSnapshot: PortfolioSnapshot = {
	accounts: [
		{
			type: "ppf",
			name: "My PPF",
			currentValuePaise: 200000_00,
			totalContributionsPaise: 180000_00,
		},
		{
			type: "mutual_fund",
			name: "Axis MF",
			currentValuePaise: 300000_00,
			totalContributionsPaise: 250000_00,
		},
	],
	totalValuePaise: 500000_00,
	netInvestedPaise: 430000_00,
	profitLossPaise: 70000_00,
	percentReturn: 16.3,
	allocationByType: { ppf: 200000_00, mutual_fund: 300000_00 },
};

const snapshotWithProjections: PortfolioSnapshot = {
	...minimalSnapshot,
	snapshotAt: "2026-03-04T00:00:00.000Z",
	deterministicProjections: {
		monthly: [],
		quarterly: [],
		yearly: [
			{ label: "2027", totalValuePaise: 550000_00 },
			{ label: "2028", totalValuePaise: 605000_00 },
			{ label: "2029", totalValuePaise: 665500_00 },
		],
	},
};

const snapshotWithEmployment: PortfolioSnapshot = {
	...minimalSnapshot,
	employmentContext: {
		gratuityAccounts: [
			{
				accountId: "acct-1",
				accountName: "Gratuity Fund",
				basicSalaryInr: 80000,
				vpfAmountInr: null,
				joiningDate: "2010-01-15T00:00:00.000Z",
			},
		],
	},
};

// ── buildRenderContext ────────────────────────────────────────────────────────

describe("buildRenderContext — core financial fields", () => {
	it("should include totalValueINR formatted in INR", () => {
		const ctx = buildRenderContext(minimalSnapshot);
		expect(ctx.totalValueINR).toBe("5,00,000");
	});

	it("should include netInvestedINR, profitLossINR, percentReturn", () => {
		const ctx = buildRenderContext(minimalSnapshot);
		expect(ctx.netInvestedINR).toBe("4,30,000");
		expect(ctx.profitLossINR).toBe("70,000");
		expect(ctx.percentReturn).toBe("16.3%");
	});

	it("should include accountCount as string", () => {
		const ctx = buildRenderContext(minimalSnapshot);
		expect(ctx.accountCount).toBe("2");
	});

	it("should include accountSummary sorted by value descending", () => {
		const ctx = buildRenderContext(minimalSnapshot);
		// mutual_fund (3L) should appear before ppf (2L)
		expect(ctx.accountSummary.indexOf("Axis MF")).toBeLessThan(
			ctx.accountSummary.indexOf("My PPF"),
		);
	});

	it("should include allocationSummary and currentAllocationSummary with same value", () => {
		const ctx = buildRenderContext(minimalSnapshot);
		expect(ctx.allocationSummary).toBe(ctx.currentAllocationSummary);
		expect(ctx.allocationSummary).toContain("mutual_fund");
		expect(ctx.allocationSummary).toContain("ppf");
	});
});

describe("buildRenderContext — projections", () => {
	it("should set hasProjections=false and projectionsSummary=Not available when absent", () => {
		const ctx = buildRenderContext(minimalSnapshot);
		expect(ctx.hasProjections).toBe("false");
		expect(ctx.projectionsSummary).toBe("Not available");
	});

	it("should set hasProjections=true when deterministicProjections present", () => {
		const ctx = buildRenderContext(snapshotWithProjections);
		expect(ctx.hasProjections).toBe("true");
	});

	it("should summarise up to 3 yearly projection points", () => {
		const ctx = buildRenderContext(snapshotWithProjections);
		expect(ctx.projectionsSummary).toContain("2027");
		expect(ctx.projectionsSummary).toContain("5,50,000");
	});
});

describe("buildRenderContext — employment", () => {
	it("should set hasEmployment=false when employmentContext absent", () => {
		const ctx = buildRenderContext(minimalSnapshot);
		expect(ctx.hasEmployment).toBe("false");
		expect(ctx.basicSalaryINR).toBe("N/A");
		expect(ctx.joiningDate).toBe("N/A");
		expect(ctx.gratuityAccountName).toBe("N/A");
	});

	it("should set hasEmployment=true and populate fields when employmentContext present", () => {
		const ctx = buildRenderContext(snapshotWithEmployment);
		expect(ctx.hasEmployment).toBe("true");
		expect(ctx.basicSalaryINR).toBe("80000");
		expect(ctx.gratuityAccountName).toBe("Gratuity Fund");
	});

	it("should compute a numeric yearsOfService from joiningDate", () => {
		const ctx = buildRenderContext(snapshotWithEmployment);
		// joiningDate is 2010-01-15, so ~16 years from 2026
		const years = parseFloat(ctx.yearsOfService);
		expect(years).toBeGreaterThan(14);
		expect(years).toBeLessThan(20);
	});

	it("should set yearsOfService=N/A when joiningDate is absent", () => {
		const snap: PortfolioSnapshot = {
			...minimalSnapshot,
			employmentContext: {
				gratuityAccounts: [
					{
						accountId: "a1",
						accountName: "G",
						basicSalaryInr: null,
						vpfAmountInr: null,
						joiningDate: null,
					},
				],
			},
		};
		const ctx = buildRenderContext(snap);
		expect(ctx.yearsOfService).toBe("N/A");
	});
});

describe("buildRenderContext — params merging", () => {
	it("should merge params into the context", () => {
		const ctx = buildRenderContext(minimalSnapshot, { question: "What is XIRR?" });
		expect(ctx.question).toBe("What is XIRR?");
	});

	it("should allow params to override context keys", () => {
		const ctx = buildRenderContext(minimalSnapshot, { totalValueINR: "custom" });
		expect(ctx.totalValueINR).toBe("custom");
	});

	it("should return the same keys with and without empty params", () => {
		const ctx1 = buildRenderContext(minimalSnapshot);
		const ctx2 = buildRenderContext(minimalSnapshot, {});
		expect(Object.keys(ctx2)).toEqual(expect.arrayContaining(Object.keys(ctx1)));
	});
});

describe("buildRenderContext — snapshotAt fallback", () => {
	it("should use snapshotAt from snapshot when present", () => {
		const snap = { ...minimalSnapshot, snapshotAt: "2026-03-04T00:00:00.000Z" };
		const ctx = buildRenderContext(snap);
		expect(ctx.snapshotAt).toBe("2026-03-04T00:00:00.000Z");
	});

	it("should fall back to current ISO timestamp when snapshotAt is absent", () => {
		const ctx = buildRenderContext(minimalSnapshot);
		// Should be a valid ISO string close to now
		expect(() => new Date(ctx.snapshotAt)).not.toThrow();
		expect(ctx.snapshotAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
	});
});
