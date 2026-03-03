import { cn } from "@/lib/utils";
import { describe, expect, it } from "vitest";

describe("cn() utility", () => {
	it("merges class names", () => {
		expect(cn("px-2", "py-1")).toBe("px-2 py-1");
	});

	it("handles conditional classes", () => {
		expect(cn("base", false && "hidden", "extra")).toBe("base extra");
	});

	it("resolves tailwind conflicts with last-wins", () => {
		expect(cn("px-2", "px-4")).toBe("px-4");
	});

	it("handles undefined and null inputs", () => {
		expect(cn("base", undefined, null, "end")).toBe("base end");
	});

	it("handles empty input", () => {
		expect(cn()).toBe("");
	});

	it("resolves complex tailwind conflicts", () => {
		expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
	});

	it("preserves non-conflicting classes", () => {
		expect(cn("rounded-lg", "bg-primary", "text-white")).toBe(
			"rounded-lg bg-primary text-white",
		);
	});
});
