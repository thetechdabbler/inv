import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const resolve = (...segments: string[]) => path.resolve(root, ...segments);

const PAGES = [
	{ path: "src/app/dashboard/page.tsx", name: "dashboard" },
	{ path: "src/app/accounts/page.tsx", name: "accounts" },
	{ path: "src/app/transactions/page.tsx", name: "transactions" },
	{ path: "src/app/transactions/add/page.tsx", name: "transactions/add" },
	{ path: "src/app/valuations/page.tsx", name: "valuations" },
	{ path: "src/app/valuations/add/page.tsx", name: "valuations/add" },
];

describe("Page Redesign: shadcn component usage", () => {
	for (const page of PAGES) {
		describe(page.name, () => {
			const content = fs.readFileSync(resolve(page.path), "utf-8");

			it("imports from @/components/ui/", () => {
				expect(content).toMatch(/@\/components\/ui\//);
			});

			it("uses semantic foreground token", () => {
				expect(content).toMatch(/text-foreground|text-card-foreground/);
			});

			it("uses semantic muted-foreground token", () => {
				expect(content).toContain("text-muted-foreground");
			});

			it("does not use hardcoded bg-white for containers", () => {
				const bgWhiteUsages = (content.match(/bg-white/g) || []).length;
				expect(bgWhiteUsages).toBe(0);
			});
		});
	}
});

describe("Page Redesign: shadcn Card usage", () => {
	for (const page of PAGES) {
		it(`${page.name} imports Card`, () => {
			const content = fs.readFileSync(resolve(page.path), "utf-8");
			expect(content).toContain("Card");
		});
	}
});

describe("Page Redesign: Skeleton loading states", () => {
	const pagesWithSkeleton = PAGES.filter((p) => !p.name.includes("/add"));

	for (const page of pagesWithSkeleton) {
		it(`${page.name} uses Skeleton component`, () => {
			const content = fs.readFileSync(resolve(page.path), "utf-8");
			expect(content).toContain("Skeleton");
		});
	}
});

describe("Page Redesign: Tabs usage on listing pages", () => {
	const tabPages = ["transactions", "valuations"];

	for (const name of tabPages) {
		it(`${name} listing uses shadcn Tabs`, () => {
			const content = fs.readFileSync(
				resolve(`src/app/${name}/page.tsx`),
				"utf-8",
			);
			expect(content).toContain("TabsList");
			expect(content).toContain("TabsTrigger");
			expect(content).toContain("TabsContent");
		});
	}
});

describe("Page Redesign: Table usage in reports", () => {
	const tablePages = ["transactions", "valuations"];

	for (const name of tablePages) {
		it(`${name} report uses shadcn Table`, () => {
			const content = fs.readFileSync(
				resolve(`src/app/${name}/page.tsx`),
				"utf-8",
			);
			expect(content).toContain("TableHeader");
			expect(content).toContain("TableRow");
			expect(content).toContain("TableCell");
		});
	}
});

describe("Page Redesign: Badge usage", () => {
	it("dashboard uses Badge for P&L indicators", () => {
		const content = fs.readFileSync(
			resolve("src/app/dashboard/page.tsx"),
			"utf-8",
		);
		expect(content).toContain("Badge");
	});

	it("accounts uses Badge for type labels", () => {
		const content = fs.readFileSync(
			resolve("src/app/accounts/page.tsx"),
			"utf-8",
		);
		expect(content).toContain("Badge");
	});
});

describe("Page Redesign: Button usage", () => {
	const addPages = [
		"src/app/transactions/add/page.tsx",
		"src/app/valuations/add/page.tsx",
	];

	for (const pagePath of addPages) {
		it(`${pagePath} uses shadcn Button`, () => {
			const content = fs.readFileSync(resolve(pagePath), "utf-8");
			expect(content).toContain("Button");
			expect(content).toContain("@/components/ui/button");
		});
	}
});

describe("Page Redesign: Input usage in forms", () => {
	const formPages = [
		"src/app/transactions/add/page.tsx",
		"src/app/valuations/add/page.tsx",
	];

	for (const pagePath of formPages) {
		it(`${pagePath} uses shadcn Input`, () => {
			const content = fs.readFileSync(resolve(pagePath), "utf-8");
			expect(content).toContain("Input");
			expect(content).toContain("@/components/ui/input");
		});
	}
});

describe("Page Redesign: Lucide icon usage", () => {
	it("dashboard uses Lucide icons", () => {
		const content = fs.readFileSync(
			resolve("src/app/dashboard/page.tsx"),
			"utf-8",
		);
		expect(content).toContain("lucide-react");
	});

	it("accounts uses Lucide icons", () => {
		const content = fs.readFileSync(
			resolve("src/app/accounts/page.tsx"),
			"utf-8",
		);
		expect(content).toContain("lucide-react");
	});

	it("add pages use ArrowLeft from Lucide", () => {
		for (const p of [
			"src/app/transactions/add/page.tsx",
			"src/app/valuations/add/page.tsx",
		]) {
			const content = fs.readFileSync(resolve(p), "utf-8");
			expect(content).toContain("ArrowLeft");
		}
	});
});

describe("Page Redesign: dark mode support", () => {
	for (const page of PAGES) {
		it(`${page.name} supports dark mode via tokens or explicit classes`, () => {
			const content = fs.readFileSync(resolve(page.path), "utf-8");
			const usesSemanticTokens =
				content.includes("text-foreground") ||
				content.includes("bg-card") ||
				content.includes("text-muted-foreground") ||
				content.includes("bg-primary");
			const hasExplicitDark = /dark:/.test(content);
			expect(usesSemanticTokens || hasExplicitDark).toBe(true);
		});
	}
});
