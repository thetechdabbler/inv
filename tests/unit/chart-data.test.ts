import { describe, expect, it } from "vitest";
import {
  buildBarChartData,
  buildLineChartData,
  buildPieChartData,
} from "@/lib/chart-data";
import type { AccountListItem, HistoryEntry } from "@/types/api";

function makeAccount(
  overrides: Partial<AccountListItem> & { id: string; name: string },
): AccountListItem {
  return {
    type: "stocks",
    description: null,
    initialBalancePaise: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeValuation(date: string, paise: number): HistoryEntry {
  return {
    date,
    type: "valuation",
    amountOrValuePaise: paise,
    createdAt: `${date}T00:00:00Z`,
  };
}

describe("buildLineChartData", () => {
  it("returns empty array when no valuations exist", () => {
    const accounts = [makeAccount({ id: "a1", name: "Acc1" })];
    const histories: Record<string, HistoryEntry[]> = {
      a1: [
        {
          date: "2026-01-01",
          type: "investment",
          amountOrValuePaise: 100000,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
    };
    const data = buildLineChartData(accounts, histories);
    expect(data).toHaveLength(0);
  });

  it("builds data points from valuation entries sorted by date", () => {
    const accounts = [makeAccount({ id: "a1", name: "Savings" })];
    const histories = {
      a1: [
        makeValuation("2026-01-01", 100000),
        makeValuation("2026-02-01", 150000),
      ],
    };
    const data = buildLineChartData(accounts, histories);
    expect(data).toHaveLength(2);
    expect(data[0]).toEqual({ date: "2026-01-01", Savings: 1000 });
    expect(data[1]).toEqual({ date: "2026-02-01", Savings: 1500 });
  });

  it("carries forward last known valuation for gaps", () => {
    const accounts = [
      makeAccount({ id: "a1", name: "A" }),
      makeAccount({ id: "a2", name: "B" }),
    ];
    const histories = {
      a1: [
        makeValuation("2026-01-01", 100000),
        makeValuation("2026-03-01", 200000),
      ],
      a2: [makeValuation("2026-02-01", 50000)],
    };
    const data = buildLineChartData(accounts, histories);
    expect(data).toHaveLength(3);
    expect(data[0]).toEqual({ date: "2026-01-01", A: 1000, B: null });
    expect(data[1]).toEqual({ date: "2026-02-01", A: 1000, B: 500 });
    expect(data[2]).toEqual({ date: "2026-03-01", A: 2000, B: 500 });
  });

  it("handles missing account history gracefully", () => {
    const accounts = [makeAccount({ id: "a1", name: "X" })];
    const data = buildLineChartData(accounts, {});
    expect(data).toHaveLength(0);
  });
});

describe("buildPieChartData", () => {
  it("groups accounts by type sorted by value descending", () => {
    const accounts = [
      makeAccount({
        id: "a1",
        name: "PPF",
        type: "ppf",
        currentValuePaise: 200000,
      }),
      makeAccount({
        id: "a2",
        name: "PPF2",
        type: "ppf",
        currentValuePaise: 100000,
      }),
      makeAccount({
        id: "a3",
        name: "Stocks",
        type: "stocks",
        currentValuePaise: 500000,
      }),
    ];
    const slices = buildPieChartData(accounts);
    expect(slices).toHaveLength(2);
    expect(slices[0].name).toBe("stocks");
    expect(slices[0].value).toBe(5000);
    expect(slices[1].name).toBe("ppf");
    expect(slices[1].value).toBe(3000);
  });

  it("groups excess types into Other when exceeding maxSlices", () => {
    const types = [
      "stocks",
      "ppf",
      "epf",
      "nps",
      "gratuity",
      "bank_deposit",
      "mutual_fund",
      "other_type",
    ];
    const accounts = types.map((type, i) =>
      makeAccount({
        id: `a${i}`,
        name: `Acc ${i}`,
        type,
        currentValuePaise: (types.length - i) * 10000,
      }),
    );
    const slices = buildPieChartData(accounts, 7);
    expect(slices).toHaveLength(7);
    expect(slices[slices.length - 1].name).toBe("Other");
  });

  it("does not create Other slice when types fit within maxSlices", () => {
    const accounts = [
      makeAccount({
        id: "a1",
        name: "A",
        type: "stocks",
        currentValuePaise: 100000,
      }),
      makeAccount({
        id: "a2",
        name: "B",
        type: "ppf",
        currentValuePaise: 50000,
      }),
    ];
    const slices = buildPieChartData(accounts, 7);
    expect(slices).toHaveLength(2);
    expect(slices.every((s) => s.name !== "Other")).toBe(true);
  });

  it("computes percentage strings that sum to ~100", () => {
    const accounts = [
      makeAccount({
        id: "a1",
        name: "A",
        type: "stocks",
        currentValuePaise: 50000,
      }),
      makeAccount({
        id: "a2",
        name: "B",
        type: "ppf",
        currentValuePaise: 50000,
      }),
    ];
    const slices = buildPieChartData(accounts);
    const totalPct = slices.reduce((s, sl) => s + Number.parseFloat(sl.pct), 0);
    expect(totalPct).toBeCloseTo(100, 0);
  });

  it("replaces underscores with spaces in type names", () => {
    const accounts = [
      makeAccount({
        id: "a1",
        name: "A",
        type: "bank_deposit",
        currentValuePaise: 100000,
      }),
    ];
    const slices = buildPieChartData(accounts);
    expect(slices[0].name).toBe("bank deposit");
  });

  it("falls back to initialBalancePaise when currentValuePaise is missing", () => {
    const accounts = [
      makeAccount({
        id: "a1",
        name: "A",
        type: "stocks",
        initialBalancePaise: 50000,
      }),
    ];
    const slices = buildPieChartData(accounts);
    expect(slices[0].value).toBe(500);
  });
});

describe("buildBarChartData", () => {
  it("returns invested and current value per account in INR", () => {
    const accounts = [
      makeAccount({
        id: "a1",
        name: "Growth Fund",
        totalContributionsPaise: 100000,
        currentValuePaise: 120000,
      }),
    ];
    const data = buildBarChartData(accounts);
    expect(data).toHaveLength(1);
    expect(data[0].Invested).toBe(1000);
    expect(data[0]["Current value"]).toBe(1200);
    expect(data[0].name).toBe("Growth Fund");
  });

  it("truncates long account names", () => {
    const accounts = [
      makeAccount({
        id: "a1",
        name: "Very Long Account Name Here",
        totalContributionsPaise: 10000,
        currentValuePaise: 20000,
      }),
    ];
    const data = buildBarChartData(accounts);
    expect(data[0].name.length).toBeLessThanOrEqual(13);
    expect(data[0].name).toContain("…");
  });

  it("uses initialBalancePaise when currentValuePaise is missing", () => {
    const accounts = [
      makeAccount({
        id: "a1",
        name: "FD",
        initialBalancePaise: 50000,
      }),
    ];
    const data = buildBarChartData(accounts);
    expect(data[0]["Current value"]).toBe(500);
    expect(data[0].Invested).toBe(0);
  });
});
