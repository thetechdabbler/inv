import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		globalSetup: ["./tests/global-setup.ts"],
		setupFiles: ["./tests/setup.ts"],
		include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json-summary"],
			include: ["src/**/*.ts"],
			exclude: ["src/**/*.test.ts", "**/node_modules/**"],
		},
	},
	resolve: {
		alias: { "@": path.resolve(__dirname, "./src") },
	},
});
