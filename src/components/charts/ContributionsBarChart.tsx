"use client";

import { buildBarChartData } from "@/lib/chart-data";
import type { AccountListItem } from "@/types/api";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface Props {
	accounts: AccountListItem[];
}

export function ContributionsBarChart({ accounts }: Props) {
	if (accounts.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center text-gray-400 text-sm">
				No account data to display
			</div>
		);
	}

	const data = buildBarChartData(accounts);

	const fmt = (v: number) =>
		new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			maximumFractionDigits: 0,
		}).format(v);

	return (
		<ResponsiveContainer width="100%" height={280}>
			<BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
				<CartesianGrid strokeDasharray="3 3" vertical={false} />
				<XAxis dataKey="name" tick={{ fontSize: 12 }} />
				<YAxis
					tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
					tick={{ fontSize: 11 }}
				/>
				<Tooltip formatter={(value) => fmt(Number(value))} />
				<Legend />
				<Bar dataKey="Invested" fill="#3b82f6" radius={[3, 3, 0, 0]} />
				<Bar dataKey="Current value" fill="#10b981" radius={[3, 3, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	);
}
