import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const txPage = readFileSync("src/app/transactions/page.tsx", "utf-8");
const valPage = readFileSync("src/app/valuations/page.tsx", "utf-8");
const txRepo = readFileSync(
	"src/infrastructure/prisma/transaction-repository.ts",
	"utf-8",
);
const valRepo = readFileSync(
	"src/infrastructure/prisma/valuation-repository.ts",
	"utf-8",
);
const domainTypes = readFileSync("src/domain/portfolio/types.ts", "utf-8");
const apiTypes = readFileSync("src/types/api.ts", "utf-8");
const historyUseCase = readFileSync(
	"src/application/portfolio/get-account-history.ts",
	"utf-8",
);

describe("API routes exist", () => {
	it("transactions PATCH/DELETE route exists", () => {
		expect(
			existsSync("src/app/api/v1/transactions/[id]/route.ts"),
		).toBe(true);
	});

	it("valuations PATCH/DELETE route exists", () => {
		expect(
			existsSync("src/app/api/v1/valuations/[id]/route.ts"),
		).toBe(true);
	});
});

describe("application use cases exist", () => {
	it("update-transaction.ts exists", () => {
		expect(
			existsSync("src/application/portfolio/update-transaction.ts"),
		).toBe(true);
	});

	it("delete-transaction.ts exists", () => {
		expect(
			existsSync("src/application/portfolio/delete-transaction.ts"),
		).toBe(true);
	});

	it("update-valuation.ts exists", () => {
		expect(
			existsSync("src/application/portfolio/update-valuation.ts"),
		).toBe(true);
	});

	it("delete-valuation.ts exists", () => {
		expect(
			existsSync("src/application/portfolio/delete-valuation.ts"),
		).toBe(true);
	});
});

describe("repository update/delete functions", () => {
	it("transaction repo has updateTransaction", () => {
		expect(txRepo).toContain("export async function updateTransaction");
	});

	it("transaction repo has deleteTransaction", () => {
		expect(txRepo).toContain("export async function deleteTransaction");
	});

	it("valuation repo has updateValuation", () => {
		expect(valRepo).toContain("export async function updateValuation");
	});

	it("valuation repo has deleteValuation", () => {
		expect(valRepo).toContain("export async function deleteValuation");
	});
});

describe("HistoryEntry includes id", () => {
	it("domain HistoryEntry has id field", () => {
		expect(domainTypes).toMatch(/interface HistoryEntry[\s\S]*?id:\s*string/);
	});

	it("api HistoryEntry has id field", () => {
		expect(apiTypes).toMatch(/interface HistoryEntry[\s\S]*?id:\s*string/);
	});
});

describe("AccountHistoryResponse includes total", () => {
	it("api type has total field", () => {
		expect(apiTypes).toMatch(
			/interface AccountHistoryResponse[\s\S]*?total:\s*number/,
		);
	});
});

describe("history use case supports offset and returns total", () => {
	it("input interface has offset", () => {
		expect(historyUseCase).toContain("offset?: number");
	});

	it("returns AccountHistoryResult with total", () => {
		expect(historyUseCase).toContain("interface AccountHistoryResult");
		expect(historyUseCase).toContain("total: number");
	});
});

describe("transactions page inline edit/delete", () => {
	it("imports Pencil and Trash2 icons", () => {
		expect(txPage).toContain("Pencil");
		expect(txPage).toContain("Trash2");
	});

	it("imports apiFetch for mutations", () => {
		expect(txPage).toContain("apiFetch");
	});

	it("imports toast from sonner", () => {
		expect(txPage).toContain('from "sonner"');
	});

	it("imports useSWRConfig for cache invalidation", () => {
		expect(txPage).toContain("useSWRConfig");
	});

	it("has editing state in TransactionRow", () => {
		expect(txPage).toContain("useState(false)");
		expect(txPage).toContain("setEditing");
	});

	it("has delete confirmation state", () => {
		expect(txPage).toContain("setDeleting");
	});

	it("calls PATCH endpoint for update", () => {
		expect(txPage).toContain("method: \"PATCH\"");
	});

	it("calls DELETE endpoint for delete", () => {
		expect(txPage).toContain("method: \"DELETE\"");
	});

	it("has onMutate callback prop", () => {
		expect(txPage).toContain("onMutate");
	});
});

describe("valuations page inline edit/delete", () => {
	it("imports Pencil and Trash2 icons", () => {
		expect(valPage).toContain("Pencil");
		expect(valPage).toContain("Trash2");
	});

	it("imports apiFetch for mutations", () => {
		expect(valPage).toContain("apiFetch");
	});

	it("calls PATCH endpoint for update", () => {
		expect(valPage).toContain("method: \"PATCH\"");
	});

	it("calls DELETE endpoint for delete", () => {
		expect(valPage).toContain("method: \"DELETE\"");
	});

	it("has onMutate callback prop", () => {
		expect(valPage).toContain("onMutate");
	});
});

describe("pagination", () => {
	it("transactions page defines PAGE_SIZE", () => {
		expect(txPage).toContain("PAGE_SIZE");
	});

	it("transactions page has Load more button", () => {
		expect(txPage).toContain("Load more");
	});

	it("transactions page shows count status", () => {
		expect(txPage).toContain("Showing");
	});

	it("valuations page defines PAGE_SIZE", () => {
		expect(valPage).toContain("PAGE_SIZE");
	});

	it("valuations page has Load more button", () => {
		expect(valPage).toContain("Load more");
	});

	it("valuations page shows count status", () => {
		expect(valPage).toContain("Showing");
	});
});
