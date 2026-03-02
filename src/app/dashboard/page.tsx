"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { apiJson } from "@/lib/api";
import { formatIndian, formatInr } from "@/lib/format";
import type { AccountListItem, PerformanceSnapshot } from "@/types/api";
import type { AccountsResponse } from "@/types/api";
import Link from "next/link";
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

function StatCard({
	label,
	value,
	accent,
	sub,
}: {
	label: string;
	value: string;
	accent?: string;
	sub?: React.ReactNode;
}) {
	return (
		<div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
			<div
				className={`absolute left-0 top-0 h-full w-1 ${accent ?? "bg-indigo-500"}`}
			/>
			<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
				{label}
			</p>
			<p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
			{sub && <div className="mt-1">{sub}</div>}
		</div>
	);
}

function AllocationBar({
	entries,
	total,
}: {
	entries: [string, number][];
	total: number;
}) {
	if (total === 0) return null;
	return (
		<div className="space-y-3">
			<div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
				{entries.map(([type, paise]) => (
					<div
						key={type}
						className={`${TYPE_COLORS[type] ?? "bg-slate-400"} transition-all`}
						style={{ width: `${(paise / total) * 100}%` }}
					/>
				))}
			</div>
			<div className="flex flex-wrap gap-x-4 gap-y-1">
				{entries.map(([type, paise]) => (
					<div key={type} className="flex items-center gap-1.5 text-sm">
						<span
							className={`inline-block h-2.5 w-2.5 rounded-full ${TYPE_COLORS[type] ?? "bg-slate-400"}`}
						/>
						<span className="capitalize text-slate-600">
							{type.replace(/_/g, " ")}
						</span>
						<span className="text-slate-400">
							{((paise / total) * 100).toFixed(0)}%
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function TopAccountCard({ account }: { account: AccountListItem }) {
	const currentValue = account.currentValuePaise ?? account.initialBalancePaise;
	const invested =
		account.initialBalancePaise + (account.totalContributionsPaise ?? 0);
	const pl = currentValue - invested;
	const pctReturn = invested > 0 ? (pl / invested) * 100 : 0;

	return (
		<Link
			href={`/accounts/${account.id}/edit`}
			className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
		>
			<div className="flex items-center gap-3">
				<span
					className={`flex h-9 w-9 items-center justify-center rounded-lg text-white text-xs font-bold ${TYPE_COLORS[account.type] ?? "bg-slate-400"}`}
				>
					{account.name.slice(0, 2).toUpperCase()}
				</span>
				<div>
					<p className="font-medium text-slate-800 text-sm">{account.name}</p>
					<p className="text-xs capitalize text-slate-400">
						{account.type.replace(/_/g, " ")}
					</p>
				</div>
			</div>
			<div className="text-right">
				<p className="font-semibold text-slate-800 text-sm">
					{formatIndian(currentValue)}
				</p>
				<p
					className={`text-xs font-medium ${pl >= 0 ? "text-emerald-600" : "text-red-500"}`}
				>
					{pl >= 0 ? "+" : ""}
					{pctReturn.toFixed(1)}%
				</p>
			</div>
		</Link>
	);
}

function DashboardContent() {
	const {
		data: perf,
		error: perfError,
		isLoading: perfLoading,
	} = useSWR<PerformanceSnapshot>(
		"/api/v1/portfolio/performance",
		(url: string) => apiJson<PerformanceSnapshot>(url),
	);
	const {
		data: accountsData,
		error: accError,
		isLoading: accLoading,
	} = useSWR<AccountsResponse>("/api/v1/accounts", (url: string) =>
		apiJson<AccountsResponse>(url),
	);

	const isLoading = perfLoading || accLoading;
	const error = perfError ?? accError;

	if (error) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
				<p className="text-red-700 font-medium">Failed to load dashboard.</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
				>
					Retry
				</button>
			</div>
		);
	}

	if (isLoading || !perf) {
		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="h-24 animate-pulse rounded-xl bg-slate-200"
						/>
					))}
				</div>
				<div className="h-32 animate-pulse rounded-xl bg-slate-200" />
			</div>
		);
	}

	const accounts = accountsData?.accounts ?? [];
	const totalValue = perf.currentValuePaise;
	const allocationByType = accounts.reduce(
		(acc, a) => {
			const type = a.type;
			acc[type] =
				(acc[type] ?? 0) + (a.currentValuePaise ?? a.initialBalancePaise);
			return acc;
		},
		{} as Record<string, number>,
	);
	const totalForAlloc = Object.values(allocationByType).reduce(
		(s, v) => s + v,
		0,
	);
	const sortedAlloc = Object.entries(allocationByType).sort(
		([, a], [, b]) => b - a,
	);

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
				<p className="text-sm text-slate-400 mt-1">Portfolio overview</p>
			</div>

			{accounts.length === 0 ? (
				<div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
						<svg
							className="h-6 w-6 text-indigo-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<title>Add account</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
					</div>
					<p className="text-slate-600 font-medium">No accounts yet</p>
					<p className="text-sm text-slate-400 mt-1">
						Create your first account to start tracking investments.
					</p>
					<Link
						href="/accounts/new"
						className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
					>
						Create account
					</Link>
				</div>
			) : (
				<>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<StatCard
							label="Total Value"
							value={formatIndian(totalValue)}
							accent="bg-indigo-500"
						/>
						<StatCard
							label="Net Invested"
							value={formatIndian(perf.netInvestedPaise)}
							accent="bg-blue-500"
						/>
						<StatCard
							label="Unrealised P&L"
							value={formatIndian(perf.profitLossPaise)}
							accent={
								perf.profitLossPaise >= 0 ? "bg-emerald-500" : "bg-red-500"
							}
							sub={
								perf.percentReturn != null ? (
									<span
										className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
											perf.percentReturn >= 0
												? "bg-emerald-50 text-emerald-700"
												: "bg-red-50 text-red-600"
										}`}
									>
										{perf.percentReturn >= 0 ? "\u2191" : "\u2193"}
										{Math.abs(perf.percentReturn).toFixed(1)}%
									</span>
								) : null
							}
						/>
						<StatCard
							label="Accounts"
							value={String(accounts.length)}
							accent="bg-violet-500"
						/>
					</div>

					<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						<h2 className="mb-4 font-semibold text-slate-700">
							Asset Allocation
						</h2>
						<AllocationBar entries={sortedAlloc} total={totalForAlloc} />
					</div>

					<div>
						<div className="flex items-center justify-between mb-3">
							<h2 className="font-semibold text-slate-700">Top Accounts</h2>
							<Link
								href="/accounts"
								className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
							>
								View all
							</Link>
						</div>
						<div className="space-y-2">
							{accounts
								.sort(
									(a, b) =>
										(b.currentValuePaise ?? b.initialBalancePaise) -
										(a.currentValuePaise ?? a.initialBalancePaise),
								)
								.slice(0, 5)
								.map((a) => (
									<TopAccountCard key={a.id} account={a} />
								))}
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export default function DashboardPage() {
	return (
		<RequireAuth>
			<DashboardContent />
		</RequireAuth>
	);
}
