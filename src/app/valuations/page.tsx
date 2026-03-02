"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { apiJson } from "@/lib/api";
import { formatIndian, formatInr } from "@/lib/format";
import type {
	AccountHistoryResponse,
	AccountsResponse,
	HistoryEntry,
} from "@/types/api";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

const TYPE_COLORS: Record<string, string> = {
	stocks: "bg-blue-500",
	mutual_fund: "bg-violet-500",
	ppf: "bg-emerald-500",
	epf: "bg-teal-500",
	nps: "bg-amber-500",
	bank_deposit: "bg-cyan-500",
	gratuity: "bg-rose-500",
};

const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

interface ValuationWithAccount extends HistoryEntry {
	accountId: string;
	accountName: string;
	accountType: string;
}

interface MonthGroup {
	key: string;
	label: string;
	valuations: ValuationWithAccount[];
	totalValuePaise: number;
	count: number;
}

interface MonthlyReport {
	key: string;
	label: string;
	totalValuePaise: number;
	count: number;
	byAccount: {
		name: string;
		type: string;
		latestValuePaise: number;
		count: number;
	}[];
}

function getMonthKey(dateStr: string): string {
	return dateStr.slice(0, 7);
}

function getMonthLabel(key: string): string {
	const [year, month] = key.split("-");
	return `${MONTH_NAMES[Number.parseInt(month, 10) - 1]} ${year}`;
}

function groupByMonth(valuations: ValuationWithAccount[]): MonthGroup[] {
	const groups = new Map<string, ValuationWithAccount[]>();

	for (const v of valuations) {
		const key = getMonthKey(v.date);
		const list = groups.get(key) ?? [];
		list.push(v);
		groups.set(key, list);
	}

	return [...groups.entries()]
		.sort(([a], [b]) => b.localeCompare(a))
		.map(([key, vals]) => {
			const latestPerAccount = new Map<string, number>();
			for (const v of vals) {
				const existing = latestPerAccount.get(v.accountId);
				if (
					existing === undefined ||
					v.date >
						(vals.find(
							(x) =>
								x.accountId === v.accountId &&
								x.amountOrValuePaise === existing,
						)?.date ?? "")
				) {
					latestPerAccount.set(v.accountId, v.amountOrValuePaise);
				}
			}
			const totalValuePaise = [...latestPerAccount.values()].reduce(
				(s, v) => s + v,
				0,
			);
			return {
				key,
				label: getMonthLabel(key),
				valuations: vals,
				totalValuePaise,
				count: vals.length,
			};
		});
}

function buildMonthlyReports(
	valuations: ValuationWithAccount[],
): MonthlyReport[] {
	const months = groupByMonth(valuations);
	return months.map((m) => {
		const byAccountMap = new Map<
			string,
			{
				name: string;
				type: string;
				latestValuePaise: number;
				latestDate: string;
				count: number;
			}
		>();
		for (const v of m.valuations) {
			const entry = byAccountMap.get(v.accountId);
			if (!entry || v.date > entry.latestDate) {
				byAccountMap.set(v.accountId, {
					name: v.accountName,
					type: v.accountType,
					latestValuePaise: v.amountOrValuePaise,
					latestDate: v.date,
					count: (entry?.count ?? 0) + 1,
				});
			} else {
				entry.count += 1;
			}
		}
		return {
			key: m.key,
			label: m.label,
			totalValuePaise: m.totalValuePaise,
			count: m.count,
			byAccount: [...byAccountMap.values()]
				.sort((a, b) => b.latestValuePaise - a.latestValuePaise)
				.map(({ latestDate: _, ...rest }) => rest),
		};
	});
}

function ValuationRow({ v }: { v: ValuationWithAccount }) {
	return (
		<div className="flex items-center justify-between px-5 py-3">
			<div className="flex items-center gap-3">
				<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
					&#x2139;
				</span>
				<div>
					<p className="text-sm font-medium text-slate-700">Valuation</p>
					<div className="flex items-center gap-2 mt-0.5">
						<span
							className={`inline-flex h-4 w-4 items-center justify-center rounded text-white text-[8px] font-bold ${TYPE_COLORS[v.accountType] ?? "bg-slate-400"}`}
						>
							{v.accountName.slice(0, 2).toUpperCase()}
						</span>
						<span className="text-xs text-slate-400">{v.accountName}</span>
						<span className="text-xs text-slate-300">&middot;</span>
						<span className="text-xs text-slate-400">{v.date}</span>
					</div>
				</div>
			</div>
			<div className="text-right">
				<p className="text-sm font-semibold text-indigo-600">
					{formatInr(v.amountOrValuePaise)}
				</p>
				{v.description && (
					<p className="text-xs text-slate-400 truncate max-w-[180px]">
						{v.description}
					</p>
				)}
			</div>
		</div>
	);
}

function MonthSummaryFooter({ group }: { group: MonthGroup }) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-b-xl bg-slate-50 border-t border-slate-200 px-5 py-3">
			<span className="text-xs font-medium text-slate-500">
				{group.count} valuation{group.count !== 1 ? "s" : ""}
			</span>
			<span className="rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-xs font-semibold">
				Portfolio: {formatInr(group.totalValuePaise)}
			</span>
		</div>
	);
}

function MonthlyReportView({ reports }: { reports: MonthlyReport[] }) {
	if (reports.length === 0) {
		return (
			<p className="text-sm text-slate-400 text-center py-8">
				No data for monthly report.
			</p>
		);
	}

	const latestReport = reports[0];
	const prevReport = reports.length > 1 ? reports[1] : null;
	const changePaise = prevReport
		? latestReport.totalValuePaise - prevReport.totalValuePaise
		: 0;

	return (
		<div className="space-y-5">
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
						Latest Portfolio Value
					</p>
					<p className="mt-1 text-xl font-bold text-indigo-600">
						{formatIndian(latestReport.totalValuePaise)}
					</p>
					<p className="text-xs text-slate-400 mt-0.5">{latestReport.label}</p>
				</div>
				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
						Month-over-Month
					</p>
					{prevReport ? (
						<p
							className={`mt-1 text-xl font-bold ${changePaise >= 0 ? "text-emerald-600" : "text-red-500"}`}
						>
							{changePaise >= 0 ? "+" : ""}
							{formatIndian(changePaise)}
						</p>
					) : (
						<p className="mt-1 text-xl font-bold text-slate-300">&mdash;</p>
					)}
				</div>
				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
						Total Valuations
					</p>
					<p className="mt-1 text-xl font-bold text-slate-700">
						{reports.reduce((s, r) => s + r.count, 0)}
					</p>
				</div>
			</div>

			<div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-slate-200 bg-slate-50">
							<th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
								Month
							</th>
							<th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-indigo-600">
								Portfolio Value
							</th>
							<th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
								Change
							</th>
							<th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
								Entries
							</th>
						</tr>
					</thead>
					<tbody>
						{reports.map((r, idx) => {
							const prev = idx < reports.length - 1 ? reports[idx + 1] : null;
							const change = prev
								? r.totalValuePaise - prev.totalValuePaise
								: null;
							return (
								<tr
									key={r.key}
									className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
								>
									<td className="px-5 py-3 font-medium text-slate-700">
										{r.label}
									</td>
									<td className="px-5 py-3 text-right text-indigo-600 font-medium">
										{formatInr(r.totalValuePaise)}
									</td>
									<td
										className={`px-5 py-3 text-right font-semibold ${
											change === null
												? "text-slate-300"
												: change >= 0
													? "text-emerald-600"
													: "text-red-500"
										}`}
									>
										{change === null
											? "\u2014"
											: `${change >= 0 ? "+" : ""}${formatInr(change)}`}
									</td>
									<td className="px-5 py-3 text-right text-slate-400">
										{r.count}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<div className="space-y-3">
				<h3 className="font-semibold text-slate-700">
					Monthly Breakdown by Account
				</h3>
				{reports.map((r) => (
					<details
						key={r.key}
						className="rounded-xl border border-slate-200 bg-white shadow-sm group"
					>
						<summary className="flex cursor-pointer items-center justify-between px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
							<span>{r.label}</span>
							<div className="flex items-center gap-3">
								<span className="text-indigo-600 text-xs font-semibold">
									{formatInr(r.totalValuePaise)}
								</span>
								<svg
									className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>Expand</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</div>
						</summary>
						<div className="border-t border-slate-100 px-5 py-3 space-y-2">
							{r.byAccount.map((acct) => (
								<div
									key={acct.name}
									className="flex items-center justify-between text-sm"
								>
									<div className="flex items-center gap-2">
										<span
											className={`inline-flex h-5 w-5 items-center justify-center rounded text-white text-[8px] font-bold ${TYPE_COLORS[acct.type] ?? "bg-slate-400"}`}
										>
											{acct.name.slice(0, 2).toUpperCase()}
										</span>
										<span className="text-slate-600">{acct.name}</span>
									</div>
									<div className="flex items-center gap-3 text-xs font-medium">
										<span className="text-indigo-600">
											{formatInr(acct.latestValuePaise)}
										</span>
										<span className="text-slate-400">
											({acct.count} entr{acct.count !== 1 ? "ies" : "y"})
										</span>
									</div>
								</div>
							))}
						</div>
					</details>
				))}
			</div>
		</div>
	);
}

type TabView = "valuations" | "report";

function ValuationsContent() {
	const [activeTab, setActiveTab] = useState<TabView>("valuations");

	const { data: accountsData, isLoading: accLoading } =
		useSWR<AccountsResponse>("/api/v1/accounts", (url: string) =>
			apiJson<AccountsResponse>(url),
		);

	const allAccounts = accountsData?.accounts ?? [];

	const historyKey =
		allAccounts.length > 0
			? ["all-val-histories", allAccounts.map((a) => a.id).join(",")]
			: null;

	const { data: allHistories, isLoading: histLoading } = useSWR<
		Record<string, HistoryEntry[]>
	>(historyKey, async () => {
		const results = await Promise.all(
			allAccounts.map((a) =>
				apiJson<AccountHistoryResponse>(
					`/api/v1/accounts/${a.id}/history?limit=500`,
				),
			),
		);
		return Object.fromEntries(
			allAccounts.map((a, i) => [a.id, results[i].entries]),
		);
	});

	const allValuations: ValuationWithAccount[] = allAccounts
		.flatMap((a) =>
			(allHistories?.[a.id] ?? [])
				.filter((e) => e.type === "valuation")
				.map((e) => ({
					...e,
					accountId: a.id,
					accountName: a.name,
					accountType: a.type,
				})),
		)
		.sort((a, b) => b.date.localeCompare(a.date));

	const monthGroups = groupByMonth(allValuations);
	const monthlyReports = buildMonthlyReports(allValuations);

	const isLoading = accLoading || histLoading;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-800">Valuations</h1>
					<p className="text-sm text-slate-400 mt-1">
						{allValuations.length} valuation
						{allValuations.length !== 1 ? "s" : ""} across all accounts
					</p>
				</div>
				<Link
					href="/valuations/add"
					className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
				>
					<svg
						className="h-4 w-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<title>Add</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
					Add Valuation
				</Link>
			</div>

			<div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
				<button
					type="button"
					onClick={() => setActiveTab("valuations")}
					className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "valuations"
							? "bg-white text-slate-800 shadow-sm"
							: "text-slate-500 hover:text-slate-700"
					}`}
				>
					All Valuations
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("report")}
					className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "report"
							? "bg-white text-slate-800 shadow-sm"
							: "text-slate-500 hover:text-slate-700"
					}`}
				>
					Monthly Report
				</button>
			</div>

			{isLoading && (
				<div className="space-y-2">
					{[1, 2, 3, 4, 5].map((i) => (
						<div
							key={i}
							className="h-16 animate-pulse rounded-xl bg-slate-200"
						/>
					))}
				</div>
			)}

			{!isLoading && allValuations.length === 0 && (
				<div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
					<p className="text-slate-500">No valuations recorded yet.</p>
					<p className="text-sm text-slate-400 mt-1">
						{allAccounts.length === 0
							? "Create an account first, then add valuations."
							: 'Click "Add Valuation" to get started.'}
					</p>
				</div>
			)}

			{!isLoading && allValuations.length > 0 && activeTab === "valuations" && (
				<div className="space-y-5">
					{monthGroups.map((group) => (
						<div
							key={group.key}
							className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
						>
							<div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-5 py-3">
								<h2 className="font-semibold text-slate-700 text-sm">
									{group.label}
								</h2>
								<span className="text-xs text-slate-400">
									{group.count} entr{group.count !== 1 ? "ies" : "y"}
								</span>
							</div>
							<div className="divide-y divide-slate-100">
								{group.valuations.map((v, i) => (
									<ValuationRow key={`${v.accountId}-${v.date}-${i}`} v={v} />
								))}
							</div>
							<MonthSummaryFooter group={group} />
						</div>
					))}
				</div>
			)}

			{!isLoading && allValuations.length > 0 && activeTab === "report" && (
				<MonthlyReportView reports={monthlyReports} />
			)}
		</div>
	);
}

export default function ValuationsPage() {
	return (
		<RequireAuth>
			<ValuationsContent />
		</RequireAuth>
	);
}
