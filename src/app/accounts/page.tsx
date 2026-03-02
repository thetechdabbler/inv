"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { apiJson } from "@/lib/api";
import { formatIndian, formatInr } from "@/lib/format";
import type { AccountListItem, AccountsResponse } from "@/types/api";
import Link from "next/link";
import useSWR from "swr";

const TYPE_COLORS: Record<string, string> = {
	stocks: "from-blue-500 to-blue-600",
	mutual_fund: "from-violet-500 to-violet-600",
	ppf: "from-emerald-500 to-emerald-600",
	epf: "from-teal-500 to-teal-600",
	nps: "from-amber-500 to-amber-600",
	bank_deposit: "from-cyan-500 to-cyan-600",
	gratuity: "from-rose-500 to-rose-600",
};

const TYPE_BG: Record<string, string> = {
	stocks: "bg-blue-50 text-blue-700 border-blue-200",
	mutual_fund: "bg-violet-50 text-violet-700 border-violet-200",
	ppf: "bg-emerald-50 text-emerald-700 border-emerald-200",
	epf: "bg-teal-50 text-teal-700 border-teal-200",
	nps: "bg-amber-50 text-amber-700 border-amber-200",
	bank_deposit: "bg-cyan-50 text-cyan-700 border-cyan-200",
	gratuity: "bg-rose-50 text-rose-700 border-rose-200",
};

function AccountTile({ account }: { account: AccountListItem }) {
	const currentValue = account.currentValuePaise ?? account.initialBalancePaise;
	const invested =
		account.initialBalancePaise + (account.totalContributionsPaise ?? 0);
	const pl = currentValue - invested;
	const pctReturn = invested > 0 ? (pl / invested) * 100 : 0;
	const isPositive = pl >= 0;

	return (
		<Link
			href={`/accounts/${account.id}/edit`}
			className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-200"
		>
			<div
				className={`h-1.5 bg-gradient-to-r ${TYPE_COLORS[account.type] ?? "from-slate-400 to-slate-500"}`}
			/>

			<div className="p-5">
				<div className="flex items-start justify-between mb-4">
					<div className="flex items-center gap-3">
						<div
							className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white text-sm font-bold shadow-sm ${TYPE_COLORS[account.type] ?? "from-slate-400 to-slate-500"}`}
						>
							{account.name.slice(0, 2).toUpperCase()}
						</div>
						<div>
							<h3 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
								{account.name}
							</h3>
							<span
								className={`inline-block mt-0.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${TYPE_BG[account.type] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}
							>
								{account.type.replace(/_/g, " ")}
							</span>
						</div>
					</div>
					<div
						className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
							isPositive
								? "bg-emerald-50 text-emerald-700"
								: "bg-red-50 text-red-600"
						}`}
					>
						{isPositive ? "\u2191" : "\u2193"} {Math.abs(pctReturn).toFixed(1)}%
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
							Current Value
						</p>
						<p className="mt-0.5 text-lg font-bold text-slate-800">
							{formatIndian(currentValue)}
						</p>
					</div>
					<div>
						<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
							Invested
						</p>
						<p className="mt-0.5 text-lg font-semibold text-slate-600">
							{formatIndian(invested)}
						</p>
					</div>
				</div>

				<div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
					<div>
						<span className="text-xs text-slate-400">P&L</span>
						<span
							className={`ml-2 text-sm font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}
						>
							{isPositive ? "+" : ""}
							{formatInr(pl)}
						</span>
					</div>
					<span className="text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">
						Edit &rarr;
					</span>
				</div>
			</div>
		</Link>
	);
}

function AccountsList() {
	const { data, error, isLoading } = useSWR<AccountsResponse>(
		"/api/v1/accounts",
		(url: string) => apiJson<AccountsResponse>(url),
	);

	if (error) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
				<p className="text-red-700 font-medium">Failed to load accounts.</p>
			</div>
		);
	}

	if (isLoading || !data) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-52 animate-pulse rounded-xl bg-slate-200" />
				))}
			</div>
		);
	}

	const accounts = data.accounts;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-800">Accounts</h1>
					<p className="text-sm text-slate-400 mt-1">
						{accounts.length} account{accounts.length !== 1 ? "s" : ""}
					</p>
				</div>
				<Link
					href="/accounts/new"
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
					Add account
				</Link>
			</div>

			{accounts.length === 0 ? (
				<div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
					<p className="text-slate-500">
						No accounts yet. Create one to get started.
					</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{accounts
						.sort(
							(a, b) =>
								(b.currentValuePaise ?? b.initialBalancePaise) -
								(a.currentValuePaise ?? a.initialBalancePaise),
						)
						.map((a) => (
							<AccountTile key={a.id} account={a} />
						))}
				</div>
			)}
		</div>
	);
}

export default function AccountsPage() {
	return (
		<RequireAuth>
			<AccountsList />
		</RequireAuth>
	);
}
