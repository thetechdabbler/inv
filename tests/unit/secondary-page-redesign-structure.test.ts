import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const chartsPage = readFileSync("src/app/charts/page.tsx", "utf-8");
const insightChat = readFileSync("src/components/InsightChat.tsx", "utf-8");
const dataPage = readFileSync("src/app/data/page.tsx", "utf-8");
const filterComponent = readFileSync(
	"src/components/filters/AccountDateFilter.tsx",
	"utf-8",
);

describe("009 — Charts page redesign", () => {
	it("imports shadcn Card components", () => {
		expect(chartsPage).toMatch(/from\s+["']@\/components\/ui\/card["']/);
	});

	it("imports shadcn Skeleton", () => {
		expect(chartsPage).toMatch(/from\s+["']@\/components\/ui\/skeleton["']/);
	});

	it("imports shadcn Button", () => {
		expect(chartsPage).toMatch(/from\s+["']@\/components\/ui\/button["']/);
	});

	it("uses Card component", () => {
		expect(chartsPage).toContain("<Card");
	});

	it("uses CardHeader component", () => {
		expect(chartsPage).toContain("<CardHeader");
	});

	it("uses CardContent component", () => {
		expect(chartsPage).toContain("<CardContent");
	});

	it("uses CardTitle component", () => {
		expect(chartsPage).toContain("<CardTitle");
	});

	it("uses Skeleton for loading state", () => {
		expect(chartsPage).toContain("<Skeleton");
	});

	it("uses Button for filter clear", () => {
		expect(chartsPage).toContain("<Button");
	});

	it("imports Lucide icons", () => {
		expect(chartsPage).toMatch(/from\s+["']lucide-react["']/);
	});

	it("uses dark:glow-border for chart cards", () => {
		expect(chartsPage).toContain("dark:glow-border");
	});

	it("uses semantic text-foreground token", () => {
		expect(chartsPage).toContain("text-foreground");
	});

	it("uses semantic text-muted-foreground token", () => {
		expect(chartsPage).toContain("text-muted-foreground");
	});

	it("does not use hardcoded bg-white", () => {
		expect(chartsPage).not.toMatch(/bg-white/);
	});

	it("does not use hardcoded text-slate-800", () => {
		expect(chartsPage).not.toMatch(/text-slate-800/);
	});
});

describe("010 — InsightChat redesign", () => {
	it("imports shadcn Button", () => {
		expect(insightChat).toMatch(/from\s+["']@\/components\/ui\/button["']/);
	});

	it("imports shadcn Input", () => {
		expect(insightChat).toMatch(/from\s+["']@\/components\/ui\/input["']/);
	});

	it("imports shadcn Card", () => {
		expect(insightChat).toMatch(/from\s+["']@\/components\/ui\/card["']/);
	});

	it("imports shadcn Alert", () => {
		expect(insightChat).toMatch(/from\s+["']@\/components\/ui\/alert["']/);
	});

	it("imports Lucide icons", () => {
		expect(insightChat).toMatch(/from\s+["']lucide-react["']/);
	});

	it("uses Button for quick actions", () => {
		expect(insightChat).toContain("<Button");
	});

	it("uses Input for chat input", () => {
		expect(insightChat).toContain("<Input");
	});

	it("uses Card for chat container", () => {
		expect(insightChat).toContain("<Card");
	});

	it("uses Alert for unavailable warning", () => {
		expect(insightChat).toContain("<Alert");
	});

	it("uses bg-primary for user bubbles", () => {
		expect(insightChat).toContain("bg-primary");
	});

	it("uses bg-muted for assistant bubbles", () => {
		expect(insightChat).toContain("bg-muted");
	});

	it("uses destructive styling for error bubbles", () => {
		expect(insightChat).toContain("bg-destructive/10");
	});

	it("has animated thinking dots", () => {
		expect(insightChat).toContain("animate-bounce");
	});

	it("uses Lightbulb icon for empty state", () => {
		expect(insightChat).toContain("Lightbulb");
	});

	it("uses semantic text-foreground token", () => {
		expect(insightChat).toContain("text-foreground");
	});

	it("uses semantic text-muted-foreground token", () => {
		expect(insightChat).toContain("text-muted-foreground");
	});

	it("does not use hardcoded bg-white", () => {
		expect(insightChat).not.toMatch(/bg-white/);
	});

	it("does not use hardcoded text-slate-800", () => {
		expect(insightChat).not.toMatch(/text-slate-800/);
	});
});

describe("011 — Data page redesign", () => {
	it("imports shadcn Card components", () => {
		expect(dataPage).toMatch(/from\s+["']@\/components\/ui\/card["']/);
	});

	it("imports shadcn Alert components", () => {
		expect(dataPage).toMatch(/from\s+["']@\/components\/ui\/alert["']/);
	});

	it("imports shadcn Button", () => {
		expect(dataPage).toMatch(/from\s+["']@\/components\/ui\/button["']/);
	});

	it("imports Lucide icons", () => {
		expect(dataPage).toMatch(/from\s+["']lucide-react["']/);
	});

	it("uses Card for export section", () => {
		expect(dataPage).toContain("<Card");
	});

	it("uses CardHeader", () => {
		expect(dataPage).toContain("<CardHeader");
	});

	it("uses CardContent", () => {
		expect(dataPage).toContain("<CardContent");
	});

	it("uses Alert for warning", () => {
		expect(dataPage).toContain("<Alert");
	});

	it("uses AlertTitle", () => {
		expect(dataPage).toContain("<AlertTitle");
	});

	it("uses AlertDescription", () => {
		expect(dataPage).toContain("<AlertDescription");
	});

	it("uses Button for import action", () => {
		expect(dataPage).toContain("<Button");
	});

	it("uses Lucide Download icon", () => {
		expect(dataPage).toContain("Download");
	});

	it("uses Lucide Upload icon", () => {
		expect(dataPage).toContain("Upload");
	});

	it("uses Lucide AlertTriangle icon", () => {
		expect(dataPage).toContain("AlertTriangle");
	});

	it("uses Lucide FileJson icon", () => {
		expect(dataPage).toContain("FileJson");
	});

	it("uses Lucide CheckCircle2 icon", () => {
		expect(dataPage).toContain("CheckCircle2");
	});

	it("has drag-and-drop support", () => {
		expect(dataPage).toContain("onDrop");
		expect(dataPage).toContain("onDragOver");
		expect(dataPage).toContain("onDragLeave");
	});

	it("uses dark:glow-border on cards", () => {
		expect(dataPage).toContain("dark:glow-border");
	});

	it("uses semantic text-foreground token", () => {
		expect(dataPage).toContain("text-foreground");
	});

	it("uses semantic text-muted-foreground token", () => {
		expect(dataPage).toContain("text-muted-foreground");
	});

	it("does not use hardcoded bg-white", () => {
		expect(dataPage).not.toMatch(/bg-white/);
	});

	it("does not use hardcoded text-slate-800", () => {
		expect(dataPage).not.toMatch(/text-slate-800/);
	});

	it("does not use inline SVGs", () => {
		expect(dataPage).not.toContain("<svg");
	});
});

describe("AccountDateFilter redesign", () => {
	it("imports shadcn Button", () => {
		expect(filterComponent).toMatch(/from\s+["']@\/components\/ui\/button["']/);
	});

	it("imports shadcn Card", () => {
		expect(filterComponent).toMatch(/from\s+["']@\/components\/ui\/card["']/);
	});

	it("imports shadcn Input", () => {
		expect(filterComponent).toMatch(/from\s+["']@\/components\/ui\/input["']/);
	});

	it("imports Lucide icons", () => {
		expect(filterComponent).toMatch(/from\s+["']lucide-react["']/);
	});

	it("uses Card as wrapper", () => {
		expect(filterComponent).toContain("<Card");
	});

	it("uses Button component", () => {
		expect(filterComponent).toContain("<Button");
	});

	it("uses Input for date fields", () => {
		expect(filterComponent).toContain("<Input");
	});

	it("uses semantic tokens", () => {
		expect(filterComponent).toContain("text-foreground");
		expect(filterComponent).toContain("text-muted-foreground");
	});

	it("does not use hardcoded bg-white", () => {
		expect(filterComponent).not.toMatch(/bg-white/);
	});
});
