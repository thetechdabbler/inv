"use client";

import { PageTransition } from "@/components/PageTransition";
import { RequireAuth } from "@/components/RequireAuth";
import { ProjectionVsActualChart } from "@/components/charts/ProjectionVsActualChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiJson } from "@/lib/api";
import { formatIndian, formatInr } from "@/lib/format";
import type {
	AccountListItem,
	AccountsResponse,
	AccountHistoryResponse,
	HistoryEntry,
	ProjectionPoint,
	ProjectionsResponse,
} from "@/types/api";
import { AlertTriangle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import useSWR from "swr";

function ProjectionsInner() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const scopeParam = searchParams.get("scope") ?? "portfolio";
	const scope = scopeParam === "account" ? "account" : "portfolio";
	const accountId = searchParams.get("accountId") ?? undefined;

	const { data: accountsData } = useSWR<AccountsResponse>(
		"/api/v1/accounts",
		(url: string) => apiJson<AccountsResponse>(url),
	);
	const accounts: AccountListItem[] = accountsData?.accounts ?? [];

	const {
		data: historyData,
	} = useSWR<AccountHistoryResponse | null>(
		scope === "account" && accountId
			? `/api/v1/accounts/${accountId}/history?limit=500`
			: null,
		(url: string) => apiJson<AccountHistoryResponse>(url),
	);
	const history: HistoryEntry[] = historyData?.entries ?? [];

	const query = useMemo(() => {
		const params = new URLSearchParams();
		params.set("scope", scope);
		if (scope === "account" && accountId) {
			params.set("accountId", accountId);
		}
		return params.toString();
	}, [scope, accountId]);

	function handleScopeChange(value: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (value === "portfolio") {
			params.set("scope", "portfolio");
			params.delete("accountId");
		} else {
			params.set("scope", "account");
			params.set("accountId", value);
		}
		router.push(`?${params.toString()}`, { scroll: false });
	}

	const {
		data: projections,
		error,
		isLoading,
		mutate,
	} = useSWR<ProjectionsResponse>(
		`/api/v1/projections?${query}`,
		(url: string) => apiJson<ProjectionsResponse>(url),
		{ revalidateOnFocus: false },
	);

	const renderTable = (points: ProjectionPoint[]) => {
		if (points.length === 0) {
			return (
				<Card className="border-dashed border-2">
					<CardContent className="py-10 text-center text-sm text-muted-foreground">
						No projections available yet. Add accounts and expected values to
						see estimates.
					</CardContent>
				</Card>
			);
		}

		return (
			<div className="overflow-x-auto rounded-md border">
				<table className="min-w-full text-sm">
					<thead className="bg-muted">
						<tr>
							<th className="px-3 py-2 text-left">Period</th>
							<th className="px-3 py-2 text-right">Invested</th>
							<th className="px-3 py-2 text-right">Profit</th>
							<th className="px-3 py-2 text-right">Total</th>
						</tr>
					</thead>
					<tbody>
						{points.map((p) => (
							<tr key={p.label} className="border-t">
								<td className="px-3 py-2">{p.label}</td>
								<td className="px-3 py-2 text-right">
									<span title={formatInr(p.investedPaise)}>
										{formatIndian(p.investedPaise)}
									</span>
								</td>
								<td className="px-3 py-2 text-right">
									<span title={formatInr(p.profitPaise)}>
										{formatIndian(p.profitPaise)}
									</span>
								</td>
								<td className="px-3 py-2 text-right">
									<span title={formatInr(p.totalValuePaise)}>
										{formatIndian(p.totalValuePaise)}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	return (
		<PageTransition className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-foreground">Projections</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Deterministic projections based on expected returns and investments.
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<label className="text-xs font-medium text-muted-foreground">
					Scope
				</label>
				<select
					className="h-9 rounded-md border bg-background px-2 text-sm"
					value={scope === "portfolio" ? "portfolio" : accountId ?? "portfolio"}
					onChange={(e) => handleScopeChange(e.target.value)}
				>
					<option value="portfolio">Portfolio (all accounts)</option>
					{accounts.map((a) => (
						<option key={a.id} value={a.id}>
							{a.name}
						</option>
					))}
				</select>
			</div>

			{error && (
				<Card className="border-destructive/50 bg-destructive/5">
					<CardContent className="p-6 text-center">
						<p className="text-destructive font-medium">
							Failed to load projections.
						</p>
						<Button
							variant="outline"
							size="sm"
							className="mt-3"
							onClick={() => mutate()}
						>
							Retry
						</Button>
					</CardContent>
				</Card>
			)}

			{isLoading || !projections ? (
				<div className="space-y-4">
					<Skeleton className="h-10 w-56 rounded" />
					<Skeleton className="h-64 w-full rounded-xl" />
				</div>
			) : (
				<>
					{scope === "account" && history.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-sm">
									Projection vs Actual Valuations
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ProjectionVsActualChart
									history={history}
									projections={projections.series.monthly.points}
								/>
							</CardContent>
						</Card>
					)}

					<Tabs defaultValue="monthly">
						<TabsList>
							<TabsTrigger value="monthly">Monthly</TabsTrigger>
							<TabsTrigger value="quarterly">QoQ</TabsTrigger>
							<TabsTrigger value="yearly">YoY</TabsTrigger>
						</TabsList>
						<div className="mt-4 space-y-4">
							<TabsContent value="monthly">
								{renderTable(projections.series.monthly.points)}
							</TabsContent>
							<TabsContent value="quarterly">
								{renderTable(projections.series.quarterly.points)}
							</TabsContent>
							<TabsContent value="yearly">
								{renderTable(projections.series.yearly.points)}
							</TabsContent>
						</div>
					</Tabs>

					<Card>
						<CardHeader className="flex flex-row items-center gap-2 space-y-0">
							<AlertTriangle className="h-4 w-4 text-amber-500" />
							<div>
								<CardTitle className="text-sm">
									Assumptions & Disclaimer
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-2 text-sm text-muted-foreground">
							<p>{projections.disclaimer}</p>
						</CardContent>
					</Card>
				</>
			)}
		</PageTransition>
	);
}

function ProjectionsContentWithSuspense() {
	return (
		<Suspense
			fallback={
				<div className="space-y-4">
					<Skeleton className="h-10 w-56 rounded" />
					<Skeleton className="h-64 w-full rounded-xl" />
				</div>
			}
		>
			<ProjectionsInner />
		</Suspense>
	);
}

export default function ProjectionsPage() {
	return (
		<RequireAuth>
			<ProjectionsContentWithSuspense />
		</RequireAuth>
	);
}

