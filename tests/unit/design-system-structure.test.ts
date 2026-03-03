import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const resolve = (...segments: string[]) => path.resolve(root, ...segments);

describe("Design System Structure", () => {
	const requiredComponents = [
		"card",
		"button",
		"input",
		"select",
		"badge",
		"table",
		"tabs",
		"dialog",
		"tooltip",
		"alert",
		"skeleton",
	];

	for (const component of requiredComponents) {
		it(`shadcn component exists: ${component}`, () => {
			const filePath = resolve(`src/components/ui/${component}.tsx`);
			expect(fs.existsSync(filePath)).toBe(true);
		});
	}

	it("components.json exists with cssVariables enabled", () => {
		const configPath = resolve("components.json");
		expect(fs.existsSync(configPath)).toBe(true);
		const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
		expect(config.tailwind.cssVariables).toBe(true);
	});

	it("tailwind.config.js has darkMode class", () => {
		const configPath = resolve("tailwind.config.js");
		const content = fs.readFileSync(configPath, "utf-8");
		expect(content).toContain('darkMode: "class"');
	});

	it("globals.css contains light theme variables", () => {
		const cssPath = resolve("src/app/globals.css");
		const content = fs.readFileSync(cssPath, "utf-8");
		expect(content).toContain(":root");
		expect(content).toContain("--background:");
		expect(content).toContain("--primary:");
		expect(content).toContain("--sidebar:");
	});

	it("globals.css contains dark theme variables", () => {
		const cssPath = resolve("src/app/globals.css");
		const content = fs.readFileSync(cssPath, "utf-8");
		expect(content).toContain(".dark");
		expect(content).toContain("--sidebar-accent:");
	});

	it("ThemeProvider component exists", () => {
		expect(fs.existsSync(resolve("src/components/ThemeProvider.tsx"))).toBe(
			true,
		);
	});

	it("ThemeToggle component exists", () => {
		expect(fs.existsSync(resolve("src/components/ThemeToggle.tsx"))).toBe(true);
	});

	it("cn utility exists", () => {
		expect(fs.existsSync(resolve("src/lib/utils.ts"))).toBe(true);
	});

	it("layout.tsx wraps with ThemeProvider", () => {
		const layoutPath = resolve("src/app/layout.tsx");
		const content = fs.readFileSync(layoutPath, "utf-8");
		expect(content).toContain("ThemeProvider");
		expect(content).toContain("suppressHydrationWarning");
	});

	it("Layout.tsx uses Lucide icons", () => {
		const layoutPath = resolve("src/components/Layout.tsx");
		const content = fs.readFileSync(layoutPath, "utf-8");
		expect(content).toContain("lucide-react");
		expect(content).not.toContain("NavIcon");
	});
});
