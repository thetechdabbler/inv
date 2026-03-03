import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const formatTs = readFileSync("src/lib/format.ts", "utf-8");
const constantsTs = readFileSync("src/lib/constants.ts", "utf-8");
const filterComponent = readFileSync(
	"src/components/filters/AccountDateFilter.tsx",
	"utf-8",
);
const layoutComponent = readFileSync("src/components/Layout.tsx", "utf-8");

const dashboardPage = readFileSync("src/app/dashboard/page.tsx", "utf-8");
const accountsPage = readFileSync("src/app/accounts/page.tsx", "utf-8");
const transactionsPage = readFileSync(
	"src/app/transactions/page.tsx",
	"utf-8",
);
const transactionsAddPage = readFileSync(
	"src/app/transactions/add/page.tsx",
	"utf-8",
);
const valuationsPage = readFileSync("src/app/valuations/page.tsx", "utf-8");
const valuationsAddPage = readFileSync(
	"src/app/valuations/add/page.tsx",
	"utf-8",
);

describe("formatDate utility", () => {
	it("format.ts exports formatDate", () => {
		expect(formatTs).toContain("export function formatDate");
	});

	it("uses Intl.DateTimeFormat", () => {
		expect(formatTs).toContain("Intl.DateTimeFormat");
	});

	it("handles null/undefined gracefully", () => {
		expect(formatTs).toMatch(/if\s*\(\s*!iso\s*\)/);
	});

	it("handles invalid dates", () => {
		expect(formatTs).toContain("isNaN");
	});

	it("uses en-IN locale", () => {
		expect(formatTs).toContain('"en-IN"');
	});
});

describe("shared constants", () => {
	it("exports TYPE_COLORS", () => {
		expect(constantsTs).toContain("export const TYPE_COLORS");
	});

	it("exports TYPE_GRADIENTS", () => {
		expect(constantsTs).toContain("export const TYPE_GRADIENTS");
	});

	it("TYPE_COLORS includes all investment types", () => {
		for (const t of [
			"stocks",
			"mutual_fund",
			"ppf",
			"epf",
			"nps",
			"bank_deposit",
			"gratuity",
		]) {
			expect(constantsTs).toContain(t);
		}
	});

	it("TYPE_COLORS uses solid bg-* classes", () => {
		expect(constantsTs).toMatch(/TYPE_COLORS[\s\S]*bg-blue-500/);
	});

	it("TYPE_GRADIENTS uses from-* to-* classes", () => {
		expect(constantsTs).toMatch(/TYPE_GRADIENTS[\s\S]*from-blue-500/);
	});
});

describe("pages import from shared constants (no local TYPE_COLORS)", () => {
	const pages = [
		{ name: "dashboard", src: dashboardPage },
		{ name: "transactions", src: transactionsPage },
		{ name: "transactions/add", src: transactionsAddPage },
		{ name: "valuations", src: valuationsPage },
		{ name: "valuations/add", src: valuationsAddPage },
	];

	for (const { name, src } of pages) {
		it(`${name} imports TYPE_COLORS from @/lib/constants`, () => {
			expect(src).toContain('@/lib/constants"');
		});

		it(`${name} does not define local TYPE_COLORS`, () => {
			expect(src).not.toMatch(
				/const TYPE_COLORS:\s*Record<string,\s*string>\s*=/,
			);
		});
	}

	it("accounts imports TYPE_GRADIENTS from @/lib/constants", () => {
		expect(accountsPage).toContain('@/lib/constants"');
	});

	it("accounts does not define local TYPE_COLORS", () => {
		expect(accountsPage).not.toMatch(
			/const TYPE_COLORS:\s*Record<string,\s*string>\s*=/,
		);
	});
});

describe("pages use formatDate for date display", () => {
	const pages = [
		{ name: "transactions", src: transactionsPage },
		{ name: "transactions/add", src: transactionsAddPage },
		{ name: "valuations", src: valuationsPage },
		{ name: "valuations/add", src: valuationsAddPage },
	];

	for (const { name, src } of pages) {
		it(`${name} imports formatDate`, () => {
			expect(src).toContain("formatDate");
		});

		it(`${name} calls formatDate()`, () => {
			expect(src).toMatch(/formatDate\(/);
		});
	}
});

describe("AccountDateFilter click-outside and Escape", () => {
	it("adds mousedown event listener", () => {
		expect(filterComponent).toContain('"mousedown"');
	});

	it("adds keydown event listener for Escape", () => {
		expect(filterComponent).toContain('"keydown"');
		expect(filterComponent).toContain('"Escape"');
	});

	it("uses useEffect for event listeners", () => {
		expect(filterComponent).toMatch(/useEffect\s*\(/);
	});

	it("cleans up event listeners on unmount", () => {
		expect(filterComponent).toContain("removeEventListener");
	});

	it("checks dropdownRef.current.contains for click-outside", () => {
		expect(filterComponent).toContain(".contains(");
	});
});

describe("Layout sidebar active state for nested routes", () => {
	it("uses startsWith for non-dashboard routes", () => {
		expect(layoutComponent).toContain("pathname.startsWith(l.href)");
	});

	it("special-cases /dashboard for exact match", () => {
		expect(layoutComponent).toContain('l.href === "/dashboard"');
	});
});
