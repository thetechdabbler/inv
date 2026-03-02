/**
 * Unit tests for bolt 009: format helpers (paise → INR display).
 */
import { describe, expect, it } from "vitest";
import { formatIndian, formatInr, paiseToInr } from "@/lib/format";

describe("paiseToInr", () => {
  it("should convert paise to rupees", () => {
    expect(paiseToInr(100)).toBe(1);
    expect(paiseToInr(10050)).toBe(100.5);
    expect(paiseToInr(0)).toBe(0);
  });
});

describe("formatIndian", () => {
  it("should format small amounts as currency", () => {
    const s = formatIndian(100000); // 1000 INR
    expect(s).toContain("₹");
    expect(s).toMatch(/1,?000/);
  });

  it("should format lakhs with L suffix", () => {
    const s = formatIndian(10_00_00_000); // 10 lakh paise = 1 L INR
    expect(s).toContain("₹");
    expect(s).toContain("L");
    expect(s).toMatch(/₹[\d.]+ L/);
  });

  it("should format crores with Cr suffix", () => {
    const s = formatIndian(1_00_00_00_000); // 1 Cr paise = 1 Cr INR
    expect(s).toContain("₹");
    expect(s).toContain("Cr");
    expect(s).toMatch(/₹[\d.]+ Cr/);
  });
});

describe("formatInr", () => {
  it("should format paise as INR currency", () => {
    const s = formatInr(10050);
    expect(s).toContain("₹");
    expect(s).toMatch(/100\.5/);
  });

  it("should handle zero", () => {
    const s = formatInr(0);
    expect(s).toContain("₹");
  });
});
