"use client";

import { PageTransition } from "@/components/PageTransition";
import { RequireAuth } from "@/components/RequireAuth";
import { AllocationPieChart } from "@/components/charts/AllocationPieChart";
import { ContributionsBarChart } from "@/components/charts/ContributionsBarChart";
import { PortfolioLineChart } from "@/components/charts/PortfolioLineChart";
import { AccountDateFilter } from "@/components/filters/AccountDateFilter";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiJson } from "@/lib/api";
import type {
	AccountHistoryResponse,
	AccountListItem,
	AccountsResponse,
	HistoryEntry,
} from "@/types/api";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import useSWR from "swr";

function ChartsContent() {
	const searchParams = useSearchParams();
	const selectedIds =
		searchParams.get("accountIds")?.split(",").filter(Boolean) ?? [];
	const dateFrom = searchParams.get("from") ?? "";
	const dateTo = searchParams.get("to") ?? "";

	const {
		data: accountsData,
		error: accountsError,
		isLoading: accLoading,
		mutate: mutateAccounts,
	} = useSWR<AccountsResponse>("/api/v1/accounts", (url: string) =>
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

	const {
		data: histories,
		error: historiesError,
		isLoading: histLoading,
		mutate: mutateHistories,
	} = useSWR<Record<string, HistoryEntry[]>>(historyKey, async () => {
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
	const error = accountsError ?? historiesError;

	if (error) {
		return (
			<PageTransition className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-foreground">Charts</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Visualize your portfolio performance
					</p>
				</div>
				<Card className="border-destructive/50 bg-destructive/5">
					<CardContent className="p-6 text-center">
						<p className="text-destructive font-medium">
							Failed to load charts.
						</p>
						<Button
							variant="outline"
							size="sm"
							className="mt-3"
							onClick={() => {
								void mutateAccounts();
								void mutateHistories();
							}}
						>
							Retry
						</Button>
					</CardContent>
				</Card>
			</PageTransition>
		);
	}

	return (
		<PageTransition className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-foreground">Charts</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Visualize your portfolio performance
				</p>
			</div>

			<AccountDateFilter accounts={allAccounts} />

			{isLoading && (
				<div className="space-y-5">
					<Skeleton className="h-72 w-full rounded-xl" />
					<div className="grid gap-5 lg:grid-cols-2">
						<Skeleton className="h-72 w-full rounded-xl" />
						<Skeleton className="h-72 w-full rounded-xl" />
					</div>
				</div>
			)}

			{!isLoading &&
				(filteredAccounts.length === 0 && allAccounts.length > 0 ? (
					<Card className="border-dashed border-2">
						<CardContent className="flex flex-col items-center justify-center py-10">
							<p className="text-muted-foreground">
								No accounts match the current filters.
							</p>
							<Button
								variant="outline"
								className="mt-3"
								onClick={() => window.history.pushState({}, "", "?")}
							>
								Clear filters
							</Button>
						</CardContent>
					</Card>
				) : allAccounts.length === 0 ? (
					<Card className="border-dashed border-2">
						<CardContent className="flex flex-col items-center justify-center py-10">
							<BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-3" />
							<p className="text-muted-foreground">
								No accounts yet. Add accounts to see charts.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-5">
						<Card
							className="dark:glow-border motion-safe:animate-slide-up stagger-item"
							style={{ "--stagger": 0 } as React.CSSProperties}
						>
							<CardHeader className="flex-row items-center gap-3 space-y-0">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
									<TrendingUp className="h-4 w-4 text-primary" />
								</div>
								<div>
									<CardTitle>Account Values Over Time</CardTitle>
									<CardDescription>
										Track portfolio growth across time periods
									</CardDescription>
								</div>
							</CardHeader>
							<CardContent>
								<PortfolioLineChart
									accounts={filteredAccounts}
									histories={histories ?? {}}
								/>
							</CardContent>
						</Card>

						<div className="grid gap-5 lg:grid-cols-2">
							<Card
								className="dark:glow-border motion-safe:animate-slide-up stagger-item"
								style={{ "--stagger": 1 } as React.CSSProperties}
							>
								<CardHeader className="flex-row items-center gap-3 space-y-0">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
										<BarChart3 className="h-4 w-4 text-primary" />
									</div>
									<div>
										<CardTitle>Contributions vs Current Value</CardTitle>
										<CardDescription>
											Compare invested amounts with current values
										</CardDescription>
									</div>
								</CardHeader>
								<CardContent>
									<ContributionsBarChart accounts={filteredAccounts} />
								</CardContent>
							</Card>

							<Card
								className="dark:glow-border motion-safe:animate-slide-up stagger-item"
								style={{ "--stagger": 2 } as React.CSSProperties}
							>
								<CardHeader className="flex-row items-center gap-3 space-y-0">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
										<PieChart className="h-4 w-4 text-primary" />
									</div>
									<div>
										<CardTitle>Allocation by Type</CardTitle>
										<CardDescription>
											Portfolio distribution across account types
										</CardDescription>
									</div>
								</CardHeader>
								<CardContent>
									<AllocationPieChart accounts={filteredAccounts} />
								</CardContent>
							</Card>
						</div>
					</div>
				))}
		</PageTransition>
	);
}

export default function ChartsPage() {
	return (
		<RequireAuth>
			<Suspense
				fallback={
					<div className="space-y-5">
						<Skeleton className="h-72 w-full rounded-xl" />
						<div className="grid gap-5 lg:grid-cols-2">
							<Skeleton className="h-72 w-full rounded-xl" />
							<Skeleton className="h-72 w-full rounded-xl" />
						</div>
					</div>
				}
			>
				<ChartsContent />
			</Suspense>
		</RequireAuth>
	);
}
