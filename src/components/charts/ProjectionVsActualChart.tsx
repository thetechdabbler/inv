"use client";

import type { HistoryEntry, ProjectionPoint } from "@/types/api";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { paiseToInr } from "@/lib/format";

interface Props {
	history: HistoryEntry[];
	projections: ProjectionPoint[];
}

export function ProjectionVsActualChart({ history, projections }: Props) {
	const valuationEntries = history
		.filter((e) => e.type === "valuation")
		.sort((a, b) => a.date.localeCompare(b.date));

	if (valuationEntries.length === 0 && projections.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center text-gray-400 text-sm">
				No valuation or projection data to display
			</div>
		);
	}

	const allDates = new Set<string>();
	for (const v of valuationEntries) allDates.add(v.date);
	for (const p of projections) {
		// projections.periodEndDate is ISO; use date-only for axis label consistency
		allDates.add(p.periodEndDate.slice(0, 10));
	}
	const sortedDates = [...allDates].sort();

	const data = sortedDates.map((date) => {
		const lastVal = [...valuationEntries]
			.filter((e) => e.date <= date && e.type === "valuation")
			.sort((a, b) => a.date.localeCompare(b.date))
			.at(-1);

		const projForDate = projections.find(
			(p) => p.periodEndDate.slice(0, 10) === date,
		);

		return {
			date,
			Actual:
				lastVal != null ? Math.round(paiseToInr(lastVal.amountOrValuePaise)) : null,
			Projected:
				projForDate != null
					? Math.round(paiseToInr(projForDate.totalValuePaise))
					: null,
		};
	});

	const fmt = (v: number) =>
		new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			maximumFractionDigits: 0,
		}).format(v);

	return (
		<ResponsiveContainer width="100%" height={300}>
			<LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
				<CartesianGrid strokeDasharray="3 3" vertical={false} />
				<XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={40} />
				<YAxis
					tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
					tick={{ fontSize: 11 }}
				/>
				<Tooltip
					formatter={(value, name) =>
						[fmt(Number(value)), name === "Actual" ? "Actual" : "Projected"]
					}
				/>
				<Legend />
				<Line
					type="monotone"
					dataKey="Actual"
					stroke="#3b82f6"
					dot={false}
					connectNulls
					strokeWidth={2}
				/>
				<Line
					type="monotone"
					dataKey="Projected"
					stroke="#f97316"
					dot={false}
					connectNulls
					strokeWidth={2}
					strokeDasharray="5 3"
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}

