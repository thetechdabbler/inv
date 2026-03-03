import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const accountDetailPage = existsSync("src/app/accounts/[id]/page.tsx")
	? readFileSync("src/app/accounts/[id]/page.tsx", "utf-8")
	: "";
const accountsPage = readFileSync("src/app/accounts/page.tsx", "utf-8");
const dashboardPage = readFileSync("src/app/dashboard/page.tsx", "utf-8");
const txPage = readFileSync("src/app/transactions/page.tsx", "utf-8");
const valPage = readFileSync("src/app/valuations/page.tsx", "utf-8");

describe("account detail page exists", () => {
	it("src/app/accounts/[id]/page.tsx exists", () => {
		expect(existsSync("src/app/accounts/[id]/page.tsx")).toBe(true);
	});

	it("exports default AccountDetailPage", () => {
		expect(accountDetailPage).toContain("export default function");
	});
});

describe("account detail page tabs", () => {
	it("has Overview tab", () => {
		expect(accountDetailPage).toContain('value="overview"');
	});

	it("has Transactions tab", () => {
		expect(accountDetailPage).toContain('value="transactions"');
	});

	it("has Valuations tab", () => {
		expect(accountDetailPage).toContain('value="valuations"');
	});

	it("has History tab", () => {
		expect(accountDetailPage).toContain('value="history"');
	});
});

describe("account detail page features", () => {
	it("shows account name", () => {
		expect(accountDetailPage).toContain("account.name");
	});

	it("shows performance stats", () => {
		expect(accountDetailPage).toContain("Current Value");
		expect(accountDetailPage).toContain("Net Invested");
		expect(accountDetailPage).toContain("P&L");
	});

	it("has Edit button linking to /edit", () => {
		expect(accountDetailPage).toContain("/edit");
		expect(accountDetailPage).toContain("Settings");
	});

	it("has back link to /accounts", () => {
		expect(accountDetailPage).toContain('href="/accounts"');
	});

	it("has inline edit/delete for transactions", () => {
		expect(accountDetailPage).toContain("TransactionItem");
		expect(accountDetailPage).toContain("Pencil");
		expect(accountDetailPage).toContain("Trash2");
	});

	it("has inline edit/delete for valuations", () => {
		expect(accountDetailPage).toContain("ValuationItem");
	});

	it("has history chart", () => {
		expect(accountDetailPage).toContain("HistoryChart");
		expect(accountDetailPage).toContain("LineChart");
	});
});

describe("account listing links to detail page (not edit)", () => {
	it("account tile links to /accounts/{id}", () => {
		expect(accountsPage).toContain("`/accounts/${account.id}`");
		expect(accountsPage).not.toContain("`/accounts/${account.id}/edit`");
	});

	it("shows 'View' instead of 'Edit'", () => {
		expect(accountsPage).toContain("View");
	});
});

describe("dashboard links to detail page (not edit)", () => {
	it("top account card links to /accounts/{id}", () => {
		expect(dashboardPage).toContain("`/accounts/${account.id}`");
		expect(dashboardPage).not.toContain("`/accounts/${account.id}/edit`");
	});
});

describe("transactions page has AccountDateFilter", () => {
	it("imports AccountDateFilter", () => {
		expect(txPage).toContain("AccountDateFilter");
	});

	it("renders AccountDateFilter component", () => {
		expect(txPage).toContain("<AccountDateFilter");
	});

	it("reads filter params from URL", () => {
		expect(txPage).toContain("useSearchParams");
		expect(txPage).toContain("filterAccountIds");
	});

	it("filters transactions by account and date", () => {
		expect(txPage).toContain("filteredTransactions");
	});

	it("shows filtered indicator", () => {
		expect(txPage).toContain("(filtered)");
	});
});

describe("valuations page has AccountDateFilter", () => {
	it("imports AccountDateFilter", () => {
		expect(valPage).toContain("AccountDateFilter");
	});

	it("renders AccountDateFilter component", () => {
		expect(valPage).toContain("<AccountDateFilter");
	});

	it("reads filter params from URL", () => {
		expect(valPage).toContain("useSearchParams");
		expect(valPage).toContain("filterAccountIds");
	});

	it("filters valuations by account and date", () => {
		expect(valPage).toContain("filteredValuations");
	});

	it("shows filtered indicator", () => {
		expect(valPage).toContain("(filtered)");
	});
});
