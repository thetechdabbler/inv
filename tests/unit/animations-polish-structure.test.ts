import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync("src/app/globals.css", "utf-8");
const tailwindConfig = readFileSync("tailwind.config.js", "utf-8");
const useCountUp = readFileSync("src/hooks/useCountUp.ts", "utf-8");
const pageTransition = readFileSync(
	"src/components/PageTransition.tsx",
	"utf-8",
);
const buttonComponent = readFileSync("src/components/ui/button.tsx", "utf-8");

const dashboardPage = readFileSync("src/app/dashboard/page.tsx", "utf-8");
const accountsPage = readFileSync("src/app/accounts/page.tsx", "utf-8");
const chartsPage = readFileSync("src/app/charts/page.tsx", "utf-8");
const dataPage = readFileSync("src/app/data/page.tsx", "utf-8");
const transactionsPage = readFileSync("src/app/transactions/page.tsx", "utf-8");
const transactionsAddPage = readFileSync(
	"src/app/transactions/add/page.tsx",
	"utf-8",
);
const valuationsPage = readFileSync("src/app/valuations/page.tsx", "utf-8");
const valuationsAddPage = readFileSync(
	"src/app/valuations/add/page.tsx",
	"utf-8",
);
const insightChat = readFileSync("src/components/InsightChat.tsx", "utf-8");

describe("CSS animation foundations", () => {
	it("globals.css defines stagger-item utility", () => {
		expect(globalsCss).toContain(".stagger-item");
		expect(globalsCss).toContain("animation-delay");
		expect(globalsCss).toContain("--stagger");
	});

	it("globals.css has prefers-reduced-motion reset", () => {
		expect(globalsCss).toContain("prefers-reduced-motion: reduce");
		expect(globalsCss).toContain("animation-duration: 0.01ms");
	});

	it("tailwind config defines fade-in keyframe", () => {
		expect(tailwindConfig).toContain('"fade-in"');
		expect(tailwindConfig).toContain("translateY(8px)");
	});

	it("tailwind config defines slide-up keyframe", () => {
		expect(tailwindConfig).toContain('"slide-up"');
		expect(tailwindConfig).toContain("translateY(16px)");
	});

	it("tailwind config defines fade-in animation class", () => {
		expect(tailwindConfig).toContain('"fade-in": "fade-in 0.4s ease-out"');
	});

	it("tailwind config defines slide-up animation class", () => {
		expect(tailwindConfig).toContain('"slide-up": "slide-up 0.5s ease-out"');
	});

	it("preserves existing accordion keyframes", () => {
		expect(tailwindConfig).toContain('"accordion-down"');
		expect(tailwindConfig).toContain('"accordion-up"');
	});
});

describe("useCountUp hook", () => {
	it("exports useCountUp function", () => {
		expect(useCountUp).toContain("export function useCountUp");
	});

	it("uses requestAnimationFrame", () => {
		expect(useCountUp).toContain("requestAnimationFrame");
	});

	it("implements ease-out cubic easing", () => {
		expect(useCountUp).toContain("easeOutCubic");
	});

	it("respects prefers-reduced-motion", () => {
		expect(useCountUp).toContain("prefers-reduced-motion");
	});

	it("uses cancelAnimationFrame for cleanup", () => {
		expect(useCountUp).toContain("cancelAnimationFrame");
	});

	it("has configurable duration parameter", () => {
		expect(useCountUp).toMatch(/duration\s*=\s*800/);
	});
});

describe("PageTransition component", () => {
	it("exports PageTransition component", () => {
		expect(pageTransition).toContain("export function PageTransition");
	});

	it("uses motion-safe:animate-fade-in", () => {
		expect(pageTransition).toContain("motion-safe:animate-fade-in");
	});

	it("accepts className prop", () => {
		expect(pageTransition).toContain("className");
	});
});

describe("Button press feedback", () => {
	it("includes active:scale for press feedback", () => {
		expect(buttonComponent).toContain("active:scale");
	});

	it("uses motion-safe prefix for press feedback", () => {
		expect(buttonComponent).toContain("motion-safe:active:scale");
	});
});

describe("012 — Page-level fade-in transitions", () => {
	const pages = [
		{ name: "dashboard", content: dashboardPage },
		{ name: "accounts", content: accountsPage },
		{ name: "charts", content: chartsPage },
		{ name: "data", content: dataPage },
		{ name: "transactions", content: transactionsPage },
		{ name: "transactions/add", content: transactionsAddPage },
		{ name: "valuations", content: valuationsPage },
		{ name: "valuations/add", content: valuationsAddPage },
	];

	for (const page of pages) {
		it(`${page.name} imports PageTransition`, () => {
			expect(page.content).toMatch(
				/from\s+["']@\/components\/PageTransition["']/,
			);
		});

		it(`${page.name} uses <PageTransition`, () => {
			expect(page.content).toContain("<PageTransition");
		});
	}

	it("InsightChat has animate-fade-in", () => {
		expect(insightChat).toContain("animate-fade-in");
	});
});

describe("013 — Micro-interactions", () => {
	it("dashboard imports useCountUp hook", () => {
		expect(dashboardPage).toMatch(/from\s+["']@\/hooks\/useCountUp["']/);
	});

	it("dashboard uses useCountUp", () => {
		expect(dashboardPage).toContain("useCountUp");
	});

	it("dashboard stat cards have stagger animation", () => {
		expect(dashboardPage).toContain("stagger-item");
		expect(dashboardPage).toContain("animate-slide-up");
	});

	it("dashboard stat cards pass rawValue for count-up", () => {
		expect(dashboardPage).toContain("rawValue=");
	});

	it("dashboard top accounts have stagger animation", () => {
		expect(dashboardPage).toContain('"--stagger"');
	});

	it("accounts page has stagger animation on tiles", () => {
		expect(accountsPage).toContain("stagger-item");
		expect(accountsPage).toContain("animate-slide-up");
	});

	it("accounts page cards have hover lift", () => {
		expect(accountsPage).toContain("hover:-translate-y");
	});

	it("charts page has stagger animation on chart cards", () => {
		expect(chartsPage).toContain("stagger-item");
		expect(chartsPage).toContain("animate-slide-up");
	});

	it("all stagger animations use motion-safe prefix", () => {
		expect(dashboardPage).toContain("motion-safe:animate-slide-up");
		expect(accountsPage).toContain("motion-safe:animate-slide-up");
		expect(chartsPage).toContain("motion-safe:animate-slide-up");
	});
});
