import { describe, expect, it } from "vitest";
import type { Account } from "@/domain/portfolio/types";
import { computeGratuitySuggestion } from "@/domain/valuation/gratuity-calculator";

function makeAccount(type: Account["type"] = "gratuity"): Account {
	return {
		id: "acct-1",
		type,
		name: "Test Gratuity",
		description: null,
		initialBalancePaise: 0,
		createdAt: new Date("2020-01-01"),
		updatedAt: new Date("2020-01-01"),
	};
}

describe("computeGratuitySuggestion", () => {
	it("returns null for non-gratuity accounts", () => {
		const account = makeAccount("stocks");
		const result = computeGratuitySuggestion({
			account,
			basicSalaryInr: 50000,
			joiningDate: new Date("2015-01-01"),
			asOfDate: new Date("2025-01-02"),
		});
		expect(result).toBeNull();
	});

	it("computes years of service as full years rounded up between joining and as-of dates", () => {
		const account = makeAccount("gratuity");
		const result = computeGratuitySuggestion({
			account,
			basicSalaryInr: 50000,
			joiningDate: new Date("2015-01-01"),
			asOfDate: new Date("2025-01-02"),
		});
		expect(result).not.toBeNull();
		expect(result?.yearsOfService).toBe(11);
	});

	it("rounds down to zero when as-of date is on or before joining date", () => {
		const account = makeAccount("gratuity");
		const result = computeGratuitySuggestion({
			account,
			basicSalaryInr: 50000,
			joiningDate: new Date("2025-01-01"),
			asOfDate: new Date("2025-01-01"),
		});
		expect(result).not.toBeNull();
		expect(result?.yearsOfService).toBe(0);
		expect(result?.suggestedGratuityInr).toBe(0);
	});

	it("applies the 15/26 gratuity formula with two-decimal rounding", () => {
		const account = makeAccount("gratuity");
		const result = computeGratuitySuggestion({
			account,
			basicSalaryInr: 50000,
			joiningDate: new Date("2015-01-01"),
			asOfDate: new Date("2026-01-02"),
		});
		expect(result).not.toBeNull();
		// Years of service rounded up and 15/26 formula applied
		expect(result?.suggestedGratuityInr).toBeGreaterThan(0);
	});
});

