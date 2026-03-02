"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { apiJson } from "@/lib/api";
import { formatIndian, formatInr } from "@/lib/format";
import type { PerformanceSnapshot } from "@/types/api";
import type { AccountsResponse } from "@/types/api";
import Link from "next/link";
import useSWR from "swr";

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
	} = useSWR<AccountsResponse>(
		"/api/v1/accounts",
		(url: string) => apiJson<AccountsResponse>(url),
	);

	const isLoading = perfLoading || accLoading;
	const error = perfError ?? accError;

	if (error) {
		return (
			<div className="rounded border border-red-200 bg-red-50 p-4">
				<p className="text-red-700">Failed to load dashboard.</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="mt-2 rounded bg-red-100 px-3 py-1 text-sm hover:bg-red-200"
				>
					Retry
				</button>
			</div>
		);
	}

	if (isLoading || !perf) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
				))}
				<div className="h-48 animate-pulse rounded-lg bg-gray-200 lg:col-span-2" />
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

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Dashboard</h1>

			{accounts.length === 0 ? (
				<div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
					<p className="text-gray-600">No accounts yet.</p>
					<Link
						href="/accounts/new"
						className="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Create your first account
					</Link>
				</div>
			) : (
				<>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<div className="rounded-lg border bg-white p-4 shadow-sm">
							<p className="text-sm text-gray-500">Total value</p>
							<p className="text-xl font-semibold">
								{formatIndian(totalValue)}
							</p>
						</div>
						<div className="rounded-lg border bg-white p-4 shadow-sm">
							<p className="text-sm text-gray-500">Total invested</p>
							<p className="text-xl font-semibold">
								{formatIndian(perf.netInvestedPaise)}
							</p>
						</div>
						<div className="rounded-lg border bg-white p-4 shadow-sm">
							<p className="text-sm text-gray-500">Unrealised P&L</p>
							<p
								className={`text-xl font-semibold ${perf.profitLossPaise >= 0 ? "text-green-600" : "text-red-600"}`}
							>
								{formatIndian(perf.profitLossPaise)}
								{perf.percentReturn != null && (
									<span className="ml-1 text-sm">
										({perf.percentReturn >= 0 ? "+" : ""}
										{perf.percentReturn.toFixed(1)}%)
									</span>
								)}
							</p>
						</div>
						<div className="rounded-lg border bg-white p-4 shadow-sm">
							<p className="text-sm text-gray-500">Accounts</p>
							<p className="text-xl font-semibold">{accounts.length}</p>
						</div>
					</div>

					<div className="rounded-lg border bg-white p-4 shadow-sm">
						<h2 className="mb-3 font-medium">Allocation by type</h2>
						<ul className="space-y-2">
							{Object.entries(allocationByType)
								.sort(([, a], [, b]) => b - a)
								.map(([type, paise]) => (
									<li key={type} className="flex justify-between text-sm">
										<span className="capitalize text-gray-700">
											{type.replace(/_/g, " ")}
										</span>
										<span>
											{formatInr(paise)}
											{totalForAlloc > 0 && (
												<span className="ml-2 text-gray-500">
													({((paise / totalForAlloc) * 100).toFixed(0)}%)
												</span>
											)}
										</span>
									</li>
								))}
						</ul>
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
