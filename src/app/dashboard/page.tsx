"use client";

import { PageTransition } from "@/components/PageTransition";
import { RequireAuth } from "@/components/RequireAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountUp } from "@/hooks/useCountUp";
import { apiJson } from "@/lib/api";
import { TYPE_COLORS } from "@/lib/constants";
import { formatIndian } from "@/lib/format";
import type {
	AccountHistoryResponse,
	AccountListItem,
	HistoryEntry,
	PerformanceSnapshot,
} from "@/types/api";
import type { AccountsResponse } from "@/types/api";
import { ArrowUpRight, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

const STALE_DAYS = 30;

function StatCard({
	label,
	rawValue,
	value,
	accent,
	sub,
	index = 0,
}: {
	label: string;
	rawValue?: number;
	value: string;
	accent?: string;
	sub?: React.ReactNode;
	index?: number;
}) {
	const animated = useCountUp(rawValue ?? 0, 800, rawValue !== undefined);

	return (
		<Card
			className="relative overflow-hidden motion-safe:animate-slide-up stagger-item"
			style={{ "--stagger": index } as React.CSSProperties}
		>
			<div
				className={`absolute left-0 top-0 h-full w-1 ${accent ?? "bg-primary"}`}
			/>
			<CardContent className="p-5">
				<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
					{label}
				</p>
				<p className="mt-1 text-2xl font-bold text-foreground">
					{rawValue !== undefined ? formatIndian(animated) : value}
				</p>
				{sub && <div className="mt-1">{sub}</div>}
			</CardContent>
		</Card>
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
			<div className="flex h-3 overflow-hidden rounded-full bg-muted">
				{entries.map(([type, paise]) => (
					<div
						key={type}
						className={`${TYPE_COLORS[type] ?? "bg-muted-foreground"} transition-all`}
						style={{ width: `${(paise / total) * 100}%` }}
					/>
				))}
			</div>
			<div className="flex flex-wrap gap-x-4 gap-y-1">
				{entries.map(([type, paise]) => (
					<div key={type} className="flex items-center gap-1.5 text-sm">
						<span
							className={`inline-block h-2.5 w-2.5 rounded-full ${TYPE_COLORS[type] ?? "bg-muted-foreground"}`}
						/>
						<span className="capitalize text-muted-foreground">
							{type.replace(/_/g, " ")}
						</span>
						<span className="text-muted-foreground/60">
							{((paise / total) * 100).toFixed(0)}%
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function TopAccountCard({
	account,
	isStale,
}: {
	account: AccountListItem;
	isStale?: boolean;
}) {
	const currentValue = account.currentValuePaise ?? account.initialBalancePaise;
	const invested =
		account.initialBalancePaise + (account.totalContributionsPaise ?? 0);
	const pl = currentValue - invested;
	const pctReturn = invested > 0 ? (pl / invested) * 100 : 0;

	return (
		<Link
			href={`/accounts/${account.id}`}
			className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 hover:border-primary/30 hover:shadow-md transition-all"
		>
			<div className="flex items-center gap-3">
				<span
					className={`flex h-9 w-9 items-center justify-center rounded-lg text-white text-xs font-bold ${TYPE_COLORS[account.type] ?? "bg-muted-foreground"}`}
				>
					{account.name.slice(0, 2).toUpperCase()}
				</span>
				<div>
					<p className="font-medium text-card-foreground text-sm">
						{account.name}
					</p>
					<p className="text-xs capitalize text-muted-foreground">
						{account.type.replace(/_/g, " ")}
					</p>
				</div>
			</div>
			<div className="text-right">
				<p className="font-semibold text-card-foreground text-sm">
					{formatIndian(currentValue)}
				</p>
				<div className="mt-1 flex items-center justify-end gap-1">
					<Badge
						variant="outline"
						className={`text-[10px] ${pl >= 0 ? "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "text-red-500 dark:text-red-400 border-red-200 dark:border-red-800"}`}
					>
						{pl >= 0 ? "+" : ""}
						{pctReturn.toFixed(1)}%
					</Badge>
					{isStale && (
						<Badge
							variant="outline"
							className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
						>
							Stale
						</Badge>
					)}
				</div>
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

	const accounts = accountsData?.accounts ?? [];

	const historyKey =
		accounts.length > 0
			? [
					"dashboard-histories",
					accounts.map((a) => a.id).join(","),
				]
			: null;

	const { data: histories } = useSWR<Record<string, HistoryEntry[]>>(
		historyKey,
		async () => {
			const results = await Promise.all(
				accounts.map((a) =>
					apiJson<AccountHistoryResponse>(
						`/api/v1/accounts/${a.id}/history?limit=500`,
					),
				),
			);
			return Object.fromEntries(
				accounts.map((a, i) => [a.id, results[i].entries]),
			);
		},
	);

	const isLoading = perfLoading || accLoading;
	const error = perfError ?? accError;

	if (error) {
		return (
			<Card className="border-destructive/50 bg-destructive/5">
				<CardContent className="p-6 text-center">
					<p className="text-destructive font-medium">
						Failed to load dashboard.
					</p>
					<Button
						variant="outline"
						size="sm"
						className="mt-3"
						onClick={() => window.location.reload()}
					>
						Retry
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (isLoading || !perf) {
		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-24 rounded-xl" />
					))}
				</div>
				<Skeleton className="h-32 rounded-xl" />
			</div>
		);
	}

	const staleAccountIds = new Set<string>();
	if (histories && accounts.length > 0) {
		const now = new Date();
		const thresholdMs = STALE_DAYS * 24 * 60 * 60 * 1000;
		for (const account of accounts) {
			const entries = histories[account.id] ?? [];
			const valuations = entries.filter((e) => e.type === "valuation");
			if (valuations.length === 0) continue;
			const latest = valuations.reduce((latest, entry) =>
				entry.date > latest.date ? entry : latest,
			);
			const latestDate = new Date(latest.date);
			if (now.getTime() - latestDate.getTime() > thresholdMs) {
				staleAccountIds.add(account.id);
			}
		}
	}
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
		<PageTransition className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
				<p className="text-sm text-muted-foreground mt-1">Portfolio overview</p>
			</div>

			{accounts.length === 0 ? (
				<Card className="border-dashed border-2">
					<CardContent className="p-10 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Plus className="h-6 w-6 text-primary" />
						</div>
						<p className="text-foreground font-medium">No accounts yet</p>
						<p className="text-sm text-muted-foreground mt-1">
							Create your first account to start tracking investments.
						</p>
						<Button asChild className="mt-4">
							<Link href="/accounts/new">Create account</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<StatCard
							label="Total Value"
							rawValue={totalValue}
							value={formatIndian(totalValue)}
							accent="bg-primary"
							index={0}
						/>
						<StatCard
							label="Net Invested"
							rawValue={perf.netInvestedPaise}
							value={formatIndian(perf.netInvestedPaise)}
							accent="bg-blue-500"
							index={1}
						/>
						<StatCard
							label="Unrealised P&L"
							rawValue={perf.profitLossPaise}
							value={formatIndian(perf.profitLossPaise)}
							accent={
								perf.profitLossPaise >= 0 ? "bg-emerald-500" : "bg-red-500"
							}
							index={2}
							sub={
								perf.percentReturn != null ? (
									<Badge
										variant="outline"
										className={`text-xs ${
											perf.percentReturn >= 0
												? "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
												: "text-red-500 dark:text-red-400 border-red-200 dark:border-red-800"
										}`}
									>
										{perf.percentReturn >= 0 ? "\u2191" : "\u2193"}
										{Math.abs(perf.percentReturn).toFixed(1)}%
									</Badge>
								) : null
							}
						/>
						<StatCard
							label="Accounts"
							rawValue={accounts.length}
							value={String(accounts.length)}
							accent="bg-violet-500"
							index={3}
						/>
					</div>

					<Card className="motion-safe:animate-fade-in">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-semibold">
								Asset Allocation
							</CardTitle>
						</CardHeader>
						<CardContent>
							<AllocationBar entries={sortedAlloc} total={totalForAlloc} />
						</CardContent>
					</Card>

					<div className="motion-safe:animate-fade-in">
						<div className="flex items-center justify-between mb-3">
							<h2 className="font-semibold text-foreground">Top Accounts</h2>
							<Link
								href="/accounts"
								className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
							>
								View all
								<ArrowUpRight className="h-3.5 w-3.5" />
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
								.map((a, i) => (
									<div
										key={a.id}
										className="motion-safe:animate-slide-up stagger-item"
										style={{ "--stagger": i } as React.CSSProperties}
									>
										<TopAccountCard
											account={a}
											isStale={staleAccountIds.has(a.id)}
										/>
									</div>
								))}
						</div>
					</div>
				</>
			)}
		</PageTransition>
	);
}

export default function DashboardPage() {
	return (
		<RequireAuth>
			<DashboardContent />
		</RequireAuth>
	);
}
