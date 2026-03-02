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

interface TransactionWithAccount extends HistoryEntry {
	accountId: string;
	accountName: string;
	accountType: string;
}

interface MonthGroup {
	key: string;
	label: string;
	transactions: TransactionWithAccount[];
	totalInvestedPaise: number;
	totalWithdrawnPaise: number;
	netPaise: number;
	txCount: number;
}

interface MonthlyReport {
	key: string;
	label: string;
	investedPaise: number;
	withdrawnPaise: number;
	netPaise: number;
	txCount: number;
	byAccount: {
		name: string;
		type: string;
		investedPaise: number;
		withdrawnPaise: number;
	}[];
}

function getMonthKey(dateStr: string): string {
	return dateStr.slice(0, 7);
}

function getMonthLabel(key: string): string {
	const [year, month] = key.split("-");
	return `${MONTH_NAMES[Number.parseInt(month, 10) - 1]} ${year}`;
}

function groupByMonth(transactions: TransactionWithAccount[]): MonthGroup[] {
	const groups = new Map<string, TransactionWithAccount[]>();

	for (const tx of transactions) {
		const key = getMonthKey(tx.date);
		const list = groups.get(key) ?? [];
		list.push(tx);
		groups.set(key, list);
	}

	return [...groups.entries()]
		.sort(([a], [b]) => b.localeCompare(a))
		.map(([key, txns]) => {
			const totalInvestedPaise = txns
				.filter((t) => t.type === "investment")
				.reduce((s, t) => s + t.amountOrValuePaise, 0);
			const totalWithdrawnPaise = txns
				.filter((t) => t.type === "withdrawal")
				.reduce((s, t) => s + t.amountOrValuePaise, 0);
			return {
				key,
				label: getMonthLabel(key),
				transactions: txns,
				totalInvestedPaise,
				totalWithdrawnPaise,
				netPaise: totalInvestedPaise - totalWithdrawnPaise,
				txCount: txns.length,
			};
		});
}

function buildMonthlyReports(
	transactions: TransactionWithAccount[],
): MonthlyReport[] {
	const months = groupByMonth(transactions);
	return months.map((m) => {
		const byAccountMap = new Map<
			string,
			{
				name: string;
				type: string;
				investedPaise: number;
				withdrawnPaise: number;
			}
		>();
		for (const tx of m.transactions) {
			const entry = byAccountMap.get(tx.accountId) ?? {
				name: tx.accountName,
				type: tx.accountType,
				investedPaise: 0,
				withdrawnPaise: 0,
			};
			if (tx.type === "investment") {
				entry.investedPaise += tx.amountOrValuePaise;
			} else {
				entry.withdrawnPaise += tx.amountOrValuePaise;
			}
			byAccountMap.set(tx.accountId, entry);
		}
		return {
			key: m.key,
			label: m.label,
			investedPaise: m.totalInvestedPaise,
			withdrawnPaise: m.totalWithdrawnPaise,
			netPaise: m.netPaise,
			txCount: m.txCount,
			byAccount: [...byAccountMap.values()].sort(
				(a, b) => b.investedPaise - a.investedPaise,
			),
		};
	});
}

function TransactionRow({ tx }: { tx: TransactionWithAccount }) {
	return (
		<div className="flex items-center justify-between px-5 py-3">
			<div className="flex items-center gap-3">
				<span
					className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
						tx.type === "investment"
							? "bg-emerald-50 text-emerald-600"
							: "bg-red-50 text-red-500"
					}`}
				>
					{tx.type === "investment" ? "\u2191" : "\u2193"}
				</span>
				<div>
					<p className="text-sm font-medium text-slate-700 capitalize">
						{tx.type}
					</p>
					<div className="flex items-center gap-2 mt-0.5">
						<span
							className={`inline-flex h-4 w-4 items-center justify-center rounded text-white text-[8px] font-bold ${TYPE_COLORS[tx.accountType] ?? "bg-slate-400"}`}
						>
							{tx.accountName.slice(0, 2).toUpperCase()}
						</span>
						<span className="text-xs text-slate-400">{tx.accountName}</span>
						<span className="text-xs text-slate-300">&middot;</span>
						<span className="text-xs text-slate-400">{tx.date}</span>
					</div>
				</div>
			</div>
			<div className="text-right">
				<p
					className={`text-sm font-semibold ${
						tx.type === "investment" ? "text-emerald-600" : "text-red-500"
					}`}
				>
					{tx.type === "investment" ? "+" : "-"}
					{formatInr(tx.amountOrValuePaise)}
				</p>
				{tx.description && (
					<p className="text-xs text-slate-400 truncate max-w-[180px]">
						{tx.description}
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
				{group.txCount} transaction{group.txCount !== 1 ? "s" : ""}
			</span>
			<div className="flex items-center gap-4 text-xs font-semibold">
				<span className="text-emerald-600">
					+{formatInr(group.totalInvestedPaise)} invested
				</span>
				{group.totalWithdrawnPaise > 0 && (
					<span className="text-red-500">
						-{formatInr(group.totalWithdrawnPaise)} withdrawn
					</span>
				)}
				<span
					className={`rounded-full px-2.5 py-0.5 ${
						group.netPaise >= 0
							? "bg-emerald-50 text-emerald-700"
							: "bg-red-50 text-red-600"
					}`}
				>
					Net: {group.netPaise >= 0 ? "+" : ""}
					{formatInr(group.netPaise)}
				</span>
			</div>
		</div>
	);
}

function MonthlyReportView({
	reports,
}: {
	reports: MonthlyReport[];
}) {
	if (reports.length === 0) {
		return (
			<p className="text-sm text-slate-400 text-center py-8">
				No data for monthly report.
			</p>
		);
	}

	const totalInvested = reports.reduce((s, r) => s + r.investedPaise, 0);
	const totalWithdrawn = reports.reduce((s, r) => s + r.withdrawnPaise, 0);
	const avgMonthlyInvested =
		reports.length > 0 ? totalInvested / reports.length : 0;

	return (
		<div className="space-y-5">
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
						Total Invested
					</p>
					<p className="mt-1 text-xl font-bold text-emerald-600">
						{formatIndian(totalInvested)}
					</p>
				</div>
				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
						Total Withdrawn
					</p>
					<p className="mt-1 text-xl font-bold text-red-500">
						{formatIndian(totalWithdrawn)}
					</p>
				</div>
				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
						Avg Monthly Investment
					</p>
					<p className="mt-1 text-xl font-bold text-indigo-600">
						{formatIndian(Math.round(avgMonthlyInvested))}
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
							<th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-emerald-600">
								Invested
							</th>
							<th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-red-500">
								Withdrawn
							</th>
							<th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
								Net
							</th>
							<th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
								Txns
							</th>
						</tr>
					</thead>
					<tbody>
						{reports.map((r) => (
							<tr
								key={r.key}
								className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
							>
								<td className="px-5 py-3 font-medium text-slate-700">
									{r.label}
								</td>
								<td className="px-5 py-3 text-right text-emerald-600 font-medium">
									{r.investedPaise > 0 ? formatInr(r.investedPaise) : "\u2014"}
								</td>
								<td className="px-5 py-3 text-right text-red-500 font-medium">
									{r.withdrawnPaise > 0
										? formatInr(r.withdrawnPaise)
										: "\u2014"}
								</td>
								<td
									className={`px-5 py-3 text-right font-semibold ${r.netPaise >= 0 ? "text-emerald-600" : "text-red-500"}`}
								>
									{r.netPaise >= 0 ? "+" : ""}
									{formatInr(r.netPaise)}
								</td>
								<td className="px-5 py-3 text-right text-slate-400">
									{r.txCount}
								</td>
							</tr>
						))}
					</tbody>
					<tfoot>
						<tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
							<td className="px-5 py-3 text-slate-700">Total</td>
							<td className="px-5 py-3 text-right text-emerald-600">
								{formatInr(totalInvested)}
							</td>
							<td className="px-5 py-3 text-right text-red-500">
								{formatInr(totalWithdrawn)}
							</td>
							<td
								className={`px-5 py-3 text-right ${totalInvested - totalWithdrawn >= 0 ? "text-emerald-600" : "text-red-500"}`}
							>
								{totalInvested - totalWithdrawn >= 0 ? "+" : ""}
								{formatInr(totalInvested - totalWithdrawn)}
							</td>
							<td className="px-5 py-3 text-right text-slate-500">
								{reports.reduce((s, r) => s + r.txCount, 0)}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>

			{/* Per-account breakdown for each month */}
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
								<span className="text-emerald-600 text-xs font-semibold">
									+{formatInr(r.investedPaise)}
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
										{acct.investedPaise > 0 && (
											<span className="text-emerald-600">
												+{formatInr(acct.investedPaise)}
											</span>
										)}
										{acct.withdrawnPaise > 0 && (
											<span className="text-red-500">
												-{formatInr(acct.withdrawnPaise)}
											</span>
										)}
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

type TabView = "transactions" | "report";

function TransactionsContent() {
	const [activeTab, setActiveTab] = useState<TabView>("transactions");

	const { data: accountsData, isLoading: accLoading } =
		useSWR<AccountsResponse>("/api/v1/accounts", (url: string) =>
			apiJson<AccountsResponse>(url),
		);

	const allAccounts = accountsData?.accounts ?? [];

	const historyKey =
		allAccounts.length > 0
			? ["all-histories", allAccounts.map((a) => a.id).join(",")]
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

	const allTransactions: TransactionWithAccount[] = allAccounts
		.flatMap((a) =>
			(allHistories?.[a.id] ?? [])
				.filter((e) => e.type === "investment" || e.type === "withdrawal")
				.map((e) => ({
					...e,
					accountId: a.id,
					accountName: a.name,
					accountType: a.type,
				})),
		)
		.sort((a, b) => b.date.localeCompare(a.date));

	const monthGroups = groupByMonth(allTransactions);
	const monthlyReports = buildMonthlyReports(allTransactions);

	const isLoading = accLoading || histLoading;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
					<p className="text-sm text-slate-400 mt-1">
						{allTransactions.length} transaction
						{allTransactions.length !== 1 ? "s" : ""} across all accounts
					</p>
				</div>
				<Link
					href="/transactions/add"
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
					Add Transaction
				</Link>
			</div>

			{/* Tab switcher */}
			<div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
				<button
					type="button"
					onClick={() => setActiveTab("transactions")}
					className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "transactions"
							? "bg-white text-slate-800 shadow-sm"
							: "text-slate-500 hover:text-slate-700"
					}`}
				>
					All Transactions
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

			{!isLoading && allTransactions.length === 0 && (
				<div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
					<p className="text-slate-500">No transactions recorded yet.</p>
					<p className="text-sm text-slate-400 mt-1">
						{allAccounts.length === 0
							? "Create an account first, then add transactions."
							: 'Click "Add Transaction" to get started.'}
					</p>
				</div>
			)}

			{!isLoading &&
				allTransactions.length > 0 &&
				activeTab === "transactions" && (
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
										{group.txCount} txn{group.txCount !== 1 ? "s" : ""}
									</span>
								</div>
								<div className="divide-y divide-slate-100">
									{group.transactions.map((tx, i) => (
										<TransactionRow
											key={`${tx.accountId}-${tx.date}-${tx.type}-${i}`}
											tx={tx}
										/>
									))}
								</div>
								<MonthSummaryFooter group={group} />
							</div>
						))}
					</div>
				)}

			{!isLoading && allTransactions.length > 0 && activeTab === "report" && (
				<MonthlyReportView reports={monthlyReports} />
			)}
		</div>
	);
}

export default function TransactionsPage() {
	return (
		<RequireAuth>
			<TransactionsContent />
		</RequireAuth>
	);
}
