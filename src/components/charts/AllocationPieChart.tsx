"use client";

import { buildPieChartData } from "@/lib/chart-data";
import type { AccountListItem } from "@/types/api";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

const COLORS = [
	"#3b82f6",
	"#10b981",
	"#f59e0b",
	"#ef4444",
	"#8b5cf6",
	"#06b6d4",
	"#f97316",
];

interface Props {
	accounts: AccountListItem[];
}

export function AllocationPieChart({ accounts }: Props) {
	if (accounts.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center text-gray-400 text-sm">
				No account data to display
			</div>
		);
	}

	const data = buildPieChartData(accounts);

	return (
		<ResponsiveContainer width="100%" height={280}>
			<PieChart>
				<Pie
					data={data}
					dataKey="value"
					nameKey="name"
					cx="50%"
					cy="50%"
					outerRadius={90}
					label={(props) => {
						const entry = data.find((d) => d.name === props.name);
						return `${props.name} ${entry?.pct ?? 0}%`;
					}}
					labelLine={false}
				>
					{data.map((entry, i) => (
						<Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
					))}
				</Pie>
				<Tooltip
					formatter={(value) =>
						new Intl.NumberFormat("en-IN", {
							style: "currency",
							currency: "INR",
							maximumFractionDigits: 0,
						}).format(Number(value))
					}
				/>
				<Legend />
			</PieChart>
		</ResponsiveContainer>
	);
}
