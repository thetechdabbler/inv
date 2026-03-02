import type { AccountListItem, HistoryEntry } from "@/types/api";
import { paiseToInr } from "./format";

export type LineDataPoint = Record<string, string | number | null>;

/**
 * Build unified line-chart data with carry-forward logic:
 * for each date, use the most recent valuation at-or-before that date.
 */
export function buildLineChartData(
	accounts: AccountListItem[],
	histories: Record<string, HistoryEntry[]>,
): LineDataPoint[] {
	const allDates = new Set<string>();
	for (const acc of accounts) {
		for (const e of histories[acc.id] ?? []) {
			if (e.type === "valuation") allDates.add(e.date);
		}
	}

	const sortedDates = [...allDates].sort();

	return sortedDates.map((date) => {
		const point: LineDataPoint = { date };
		for (const acc of accounts) {
			const entries = (histories[acc.id] ?? [])
				.filter((e) => e.type === "valuation" && e.date <= date)
				.sort((a, b) => a.date.localeCompare(b.date));
			if (entries.length > 0) {
				const latest = entries[entries.length - 1];
				point[acc.name] = Math.round(paiseToInr(latest.amountOrValuePaise));
			} else {
				point[acc.name] = null;
			}
		}
		return point;
	});
}

export interface PieSlice {
	name: string;
	value: number;
	pct: string;
}

/**
 * Group accounts by type and produce pie slices.
 * Shows up to maxSlices types; groups the rest into "Other".
 */
export function buildPieChartData(
	accounts: AccountListItem[],
	maxSlices = 7,
): PieSlice[] {
	const byType: Record<string, number> = {};
	for (const a of accounts) {
		const val = a.currentValuePaise ?? a.initialBalancePaise;
		byType[a.type] = (byType[a.type] ?? 0) + val;
	}

	const sorted = Object.entries(byType).sort(([, a], [, b]) => b - a);
	const total = sorted.reduce((s, [, v]) => s + v, 0);

	let slices =
		sorted.length > maxSlices ? sorted.slice(0, maxSlices - 1) : sorted;

	if (sorted.length > maxSlices) {
		const otherVal = sorted.slice(maxSlices - 1).reduce((s, [, v]) => s + v, 0);
		slices = [...slices, ["Other", otherVal]];
	}

	return slices.map(([name, value]) => ({
		name: name.replace(/_/g, " "),
		value: Math.round(paiseToInr(value)),
		pct: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
	}));
}

export interface BarDataPoint {
	name: string;
	Invested: number;
	"Current value": number;
}

/**
 * Build bar chart data comparing invested vs current value per account.
 */
export function buildBarChartData(
	accounts: AccountListItem[],
	maxLabelLen = 12,
): BarDataPoint[] {
	return accounts.map((a) => ({
		name:
			a.name.length > maxLabelLen ? `${a.name.slice(0, maxLabelLen)}…` : a.name,
		Invested: Math.round(paiseToInr(a.totalContributionsPaise ?? 0)),
		"Current value": Math.round(
			paiseToInr(a.currentValuePaise ?? a.initialBalancePaise),
		),
	}));
}
