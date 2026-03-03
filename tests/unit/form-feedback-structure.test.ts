import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const txAddPage = readFileSync("src/app/transactions/add/page.tsx", "utf-8");
const valAddPage = readFileSync("src/app/valuations/add/page.tsx", "utf-8");
const dataPage = readFileSync("src/app/data/page.tsx", "utf-8");
const chartsPage = readFileSync("src/app/charts/page.tsx", "utf-8");

describe("account preselection from URL (011)", () => {
	it("transactions add uses useSearchParams and accountId", () => {
		expect(txAddPage).toContain("useSearchParams");
		expect(txAddPage).toContain("searchParams.get(\"accountId\")");
		expect(txAddPage).toContain("setSelectedAccountId");
	});

	it("valuations add uses useSearchParams and accountId", () => {
		expect(valAddPage).toContain("useSearchParams");
		expect(valAddPage).toContain("searchParams.get(\"accountId\")");
		expect(valAddPage).toContain("setSelectedAccountId");
	});
});

describe("form reset after submit (012)", () => {
	it("transactions add resets amountInr and keeps account", () => {
		expect(txAddPage).toContain("reset(");
		expect(txAddPage).toContain("amountInr");
	});

	it("valuations add resets valueInr", () => {
		expect(valAddPage).toContain("reset(");
		expect(valAddPage).toContain("valueInr");
	});
});

describe("themed confirmation dialog for import (013)", () => {
	it("data page uses Dialog not window.confirm", () => {
		expect(dataPage).not.toContain("window.confirm");
		expect(dataPage).toContain("Dialog");
		expect(dataPage).toContain("DialogContent");
	});

	it("has confirm and cancel flow", () => {
		expect(dataPage).toContain("importConfirmOpen");
		expect(dataPage).toContain("pendingFile");
		expect(dataPage).toContain("onConfirmImport");
		expect(dataPage).toContain("onCancelImport");
	});
});

describe("charts error handling (014)", () => {
	it("charts page handles SWR error and shows Retry", () => {
		expect(chartsPage).toContain("error");
		expect(chartsPage).toContain("Failed to load charts");
		expect(chartsPage).toContain("Retry");
		expect(chartsPage).toContain("mutateAccounts");
		expect(chartsPage).toContain("mutateHistories");
	});
});

describe("shadcn Select for transaction type (015)", () => {
	it("transactions add uses Select component", () => {
		expect(txAddPage).toContain("Select");
		expect(txAddPage).toContain("SelectTrigger");
		expect(txAddPage).toContain("SelectContent");
		expect(txAddPage).toContain("SelectItem");
	});

	it("transaction type uses Controller with Select", () => {
		expect(txAddPage).toContain("Controller");
		expect(txAddPage).toContain("name=\"type\"");
	});
});
