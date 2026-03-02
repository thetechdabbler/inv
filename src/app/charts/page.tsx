"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { AllocationPieChart } from "@/components/charts/AllocationPieChart";
import { ContributionsBarChart } from "@/components/charts/ContributionsBarChart";
import { PortfolioLineChart } from "@/components/charts/PortfolioLineChart";
import { AccountDateFilter } from "@/components/filters/AccountDateFilter";
import { apiJson } from "@/lib/api";
import type {
	AccountHistoryResponse,
	AccountListItem,
	AccountsResponse,
	HistoryEntry,
} from "@/types/api";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import useSWR from "swr";

function ChartsContent() {
	const searchParams = useSearchParams();
	const selectedIds =
		searchParams.get("accountIds")?.split(",").filter(Boolean) ?? [];
	const dateFrom = searchParams.get("from") ?? "";
	const dateTo = searchParams.get("to") ?? "";

	const { data: accountsData, isLoading: accLoading } =
		useSWR<AccountsResponse>("/api/v1/accounts", (url: string) =>
			apiJson<AccountsResponse>(url),
		);

	const allAccounts: AccountListItem[] = accountsData?.accounts ?? [];
	const filteredAccounts =
		selectedIds.length > 0
			? allAccounts.filter((a) => selectedIds.includes(a.id))
			: allAccounts;

	const historyKey =
		allAccounts.length > 0
			? ["histories", allAccounts.map((a) => a.id).join(","), dateFrom, dateTo]
			: null;

	const { data: histories, isLoading: histLoading } = useSWR<
		Record<string, HistoryEntry[]>
	>(historyKey, async () => {
		const params = new URLSearchParams({ limit: "500" });
		if (dateFrom) params.set("from", dateFrom);
		if (dateTo) params.set("to", dateTo);
		const results = await Promise.all(
			allAccounts.map((a) =>
				apiJson<AccountHistoryResponse>(
					`/api/v1/accounts/${a.id}/history?${params.toString()}`,
				),
			),
		);
		return Object.fromEntries(
			allAccounts.map((a, i) => [a.id, results[i].entries]),
		);
	});

	const isLoading = accLoading || histLoading;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-slate-800">Charts</h1>
				<p className="text-sm text-slate-400 mt-1">
					Visualize your portfolio performance
				</p>
			</div>

			<AccountDateFilter accounts={allAccounts} />

			{isLoading && (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-72 animate-pulse rounded-xl bg-slate-200"
						/>
					))}
				</div>
			)}

			{!isLoading &&
				(filteredAccounts.length === 0 && allAccounts.length > 0 ? (
					<div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
						<p className="text-slate-500">
							No accounts match the current filters.
						</p>
						<button
							type="button"
							onClick={() => window.history.pushState({}, "", "?")}
							className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
						>
							Clear filters
						</button>
					</div>
				) : allAccounts.length === 0 ? (
					<div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
						<p className="text-slate-500">
							No accounts yet. Add accounts to see charts.
						</p>
					</div>
				) : (
					<div className="space-y-5">
						<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
							<h2 className="mb-4 font-semibold text-slate-700">
								Account Values Over Time
							</h2>
							<PortfolioLineChart
								accounts={filteredAccounts}
								histories={histories ?? {}}
							/>
						</section>

						<div className="grid gap-5 lg:grid-cols-2">
							<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
								<h2 className="mb-4 font-semibold text-slate-700">
									Contributions vs Current Value
								</h2>
								<ContributionsBarChart accounts={filteredAccounts} />
							</section>

							<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
								<h2 className="mb-4 font-semibold text-slate-700">
									Allocation by Type
								</h2>
								<AllocationPieChart accounts={filteredAccounts} />
							</section>
						</div>
					</div>
				))}
		</div>
	);
}

export default function ChartsPage() {
	return (
		<RequireAuth>
			<Suspense
				fallback={
					<div className="h-96 animate-pulse rounded-xl bg-slate-200" />
				}
			>
				<ChartsContent />
			</Suspense>
		</RequireAuth>
	);
}
