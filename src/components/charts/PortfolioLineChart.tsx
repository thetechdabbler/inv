"use client";

import { buildLineChartData } from "@/lib/chart-data";
import type { AccountListItem, HistoryEntry } from "@/types/api";
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

const LINE_COLORS = [
	"#3b82f6",
	"#10b981",
	"#f59e0b",
	"#ef4444",
	"#8b5cf6",
	"#06b6d4",
	"#f97316",
	"#ec4899",
];

interface Props {
	accounts: AccountListItem[];
	histories: Record<string, HistoryEntry[]>;
}

export function PortfolioLineChart({ accounts, histories }: Props) {
	if (accounts.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center text-gray-400 text-sm">
				No account data to display
			</div>
		);
	}

	const data = buildLineChartData(accounts, histories);

	if (data.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center text-gray-400 text-sm">
				No valuation history yet — add valuations to see the chart
			</div>
		);
	}

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
				<Tooltip formatter={(value) => fmt(Number(value))} />
				<Legend />
				{accounts.map((acc, i) => (
					<Line
						key={acc.id}
						type="monotone"
						dataKey={acc.name}
						stroke={LINE_COLORS[i % LINE_COLORS.length]}
						dot={false}
						connectNulls
						strokeWidth={2}
					/>
				))}
			</LineChart>
		</ResponsiveContainer>
	);
}
