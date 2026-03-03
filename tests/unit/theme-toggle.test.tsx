// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockSetTheme = vi.fn();
let mockTheme = "system";

vi.mock("next-themes", () => ({
	useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}));

import { ThemeToggle } from "@/components/ThemeToggle";

afterEach(() => {
	cleanup();
	mockSetTheme.mockClear();
	mockTheme = "system";
});

describe("ThemeToggle", () => {
	it("renders three mode buttons", () => {
		render(<ThemeToggle />);
		expect(screen.getByLabelText("Switch to Light theme")).toBeDefined();
		expect(screen.getByLabelText("Switch to Dark theme")).toBeDefined();
		expect(screen.getByLabelText("Switch to System theme")).toBeDefined();
	});

	it("calls setTheme when clicking light button", async () => {
		const user = userEvent.setup();
		render(<ThemeToggle />);
		await user.click(screen.getByLabelText("Switch to Light theme"));
		expect(mockSetTheme).toHaveBeenCalledWith("light");
	});

	it("calls setTheme when clicking dark button", async () => {
		const user = userEvent.setup();
		render(<ThemeToggle />);
		await user.click(screen.getByLabelText("Switch to Dark theme"));
		expect(mockSetTheme).toHaveBeenCalledWith("dark");
	});

	it("calls setTheme when clicking system button", async () => {
		const user = userEvent.setup();
		render(<ThemeToggle />);
		await user.click(screen.getByLabelText("Switch to System theme"));
		expect(mockSetTheme).toHaveBeenCalledWith("system");
	});

	it("highlights the active theme button", () => {
		mockTheme = "dark";
		render(<ThemeToggle />);
		const darkBtn = screen.getByLabelText("Switch to Dark theme");
		expect(darkBtn.className).toContain("bg-background");
	});
});
