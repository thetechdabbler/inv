"use client";

import { InsightCard } from "@/components/insights/InsightCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiJson } from "@/lib/api";
import type { InsightsHistoryResponse, LLMInteraction } from "@/types/api";
import { AlertTriangle, Lightbulb, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";

// ── Type tabs config ──────────────────────────────────────────────────────────

const TYPE_TABS = [
	{ value: "all", label: "All" },
	{ value: "portfolio-summary", label: "Summary" },
	{ value: "future-projections", label: "Projections" },
	{ value: "projection-quality-review", label: "Proj. Review" },
	{ value: "risk-analysis", label: "Risk" },
	{ value: "rebalancing", label: "Rebalancing" },
	{ value: "natural-language-query", label: "Q&A" },
];

const PAGE_SIZE = 20;

// ── URL param helpers ─────────────────────────────────────────────────────────

function buildHistoryUrl(
	type: string,
	from: string,
	to: string,
	offset: number,
) {
	const params = new URLSearchParams();
	params.set("limit", String(PAGE_SIZE));
	params.set("offset", String(offset));
	if (type !== "all") params.set("type", type);
	if (from) params.set("from", from);
	if (to) params.set("to", to);
	return `/api/v1/insights/history?${params}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function InsightHistoryPanel() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const activeType = searchParams.get("insightType") ?? "all";
	const fromParam = searchParams.get("from") ?? "";
	const toParam = searchParams.get("to") ?? "";

	const [from, setFrom] = useState(fromParam);
	const [to, setTo] = useState(toParam);
	const [offset, setOffset] = useState(0);
	const [accumulated, setAccumulated] = useState<LLMInteraction[]>([]);

	// Reset accumulated list when filters change
	const prevKey = useRef("");
	const filterKey = `${activeType}|${from}|${to}`;
	if (prevKey.current !== filterKey) {
		prevKey.current = filterKey;
		if (offset !== 0) setOffset(0);
		// Clear when key changes (will be re-populated by SWR effect below)
	}

	const apiUrl = buildHistoryUrl(activeType, from, to, offset);

	const { data, isLoading, error } = useSWR<InsightsHistoryResponse>(
		apiUrl,
		(url: string) => apiJson<InsightsHistoryResponse>(url),
		{ keepPreviousData: true },
	);

	// Accumulate pages — reset on filter key change
	const lastLoadedKey = useRef("");
	useEffect(() => {
		if (!data?.interactions) return;
		if (filterKey !== lastLoadedKey.current || offset === 0) {
			lastLoadedKey.current = filterKey;
			setAccumulated(
				offset === 0
					? data.interactions
					: (prev) => {
							// Merge, dedup by id
							const ids = new Set(prev.map((i) => i.id));
							return [
								...prev,
								...data.interactions.filter((i) => !ids.has(i.id)),
							];
						},
			);
		} else {
			setAccumulated((prev) => {
				const ids = new Set(prev.map((i) => i.id));
				return [...prev, ...data.interactions.filter((i) => !ids.has(i.id))];
			});
		}
	}, [data, filterKey, offset]);

	function setActiveType(type: string) {
		const p = new URLSearchParams(searchParams.toString());
		if (type === "all") p.delete("insightType");
		else p.set("insightType", type);
		p.delete("from");
		p.delete("to");
		setFrom("");
		setTo("");
		setOffset(0);
		router.replace(`/insights?${p}`, { scroll: false });
	}

	function applyDateFilter() {
		const p = new URLSearchParams(searchParams.toString());
		if (from) p.set("from", from);
		else p.delete("from");
		if (to) p.set("to", to);
		else p.delete("to");
		setOffset(0);
		router.replace(`/insights?${p}`, { scroll: false });
	}

	function clearFilters() {
		setFrom("");
		setTo("");
		setOffset(0);
		router.replace("/insights", { scroll: false });
	}

	const hasFilters = from || to;
	const hasMore = data ? accumulated.length < data.total : false;

	const handleRerun = useCallback(() => {
		router.push("/insights?tab=chat");
	}, [router]);

	// ── Render ──────────────────────────────────────────────────────────────

	function renderList(items: LLMInteraction[]) {
		if (isLoading && items.length === 0) {
			return (
				<div className="space-y-3">
					{[1, 2, 3].map((n) => (
						<Skeleton key={n} className="h-28 w-full rounded-lg" />
					))}
				</div>
			);
		}

		if (error) {
			return (
				<div className="flex flex-col items-center gap-3 py-12 text-center">
					<AlertTriangle className="h-8 w-8 text-destructive" />
					<p className="text-sm text-muted-foreground">
						Failed to load insights.
					</p>
					<Button variant="outline" size="sm" onClick={() => setOffset(0)}>
						<RotateCcw className="h-3.5 w-3.5 mr-1" />
						Retry
					</Button>
				</div>
			);
		}

		if (items.length === 0) {
			return (
				<div className="flex flex-col items-center gap-3 py-12 text-center">
					<Lightbulb className="h-8 w-8 text-muted-foreground/50" />
					{hasFilters ? (
						<>
							<p className="text-sm text-muted-foreground">
								No insights match these filters.
							</p>
							<button
								type="button"
								onClick={clearFilters}
								className="text-xs text-primary hover:underline"
							>
								Clear filters
							</button>
						</>
					) : (
						<>
							<p className="text-sm text-muted-foreground">No insights yet.</p>
							<p className="text-xs text-muted-foreground/70">
								Use the{" "}
								<Link
									href="/insights?tab=chat"
									className="text-primary hover:underline"
								>
									Chat tab
								</Link>{" "}
								to generate your first insight.
							</p>
						</>
					)}
				</div>
			);
		}

		return (
			<div className="space-y-3">
				{items.map((insight) => (
					<InsightCard
						key={insight.id}
						insight={insight}
						onRerun={handleRerun}
					/>
				))}
				{hasMore && (
					<div className="flex justify-center pt-2">
						<Button
							variant="outline"
							size="sm"
							disabled={isLoading}
							onClick={() => setOffset((o) => o + PAGE_SIZE)}
						>
							Load more
						</Button>
					</div>
				)}
			</div>
		);
	}

	// Count by type (from accumulated + total)
	const countByType: Record<string, number> = {};
	for (const i of accumulated) {
		countByType[i.insightType] = (countByType[i.insightType] ?? 0) + 1;
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Date filter */}
			<div className="flex flex-wrap items-end gap-2">
				<div className="flex flex-col gap-1">
					<label
						htmlFor="filter-from"
						className="text-xs text-muted-foreground"
					>
						From
					</label>
					<Input
						id="filter-from"
						type="date"
						value={from}
						onChange={(e) => setFrom(e.target.value)}
						className="h-8 w-36 text-xs"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label htmlFor="filter-to" className="text-xs text-muted-foreground">
						To
					</label>
					<Input
						id="filter-to"
						type="date"
						value={to}
						onChange={(e) => setTo(e.target.value)}
						className="h-8 w-36 text-xs"
					/>
				</div>
				<Button
					variant="secondary"
					size="sm"
					className="h-8"
					onClick={applyDateFilter}
				>
					Apply
				</Button>
				{hasFilters && (
					<Button
						variant="ghost"
						size="sm"
						className="h-8 text-xs"
						onClick={clearFilters}
					>
						Clear
					</Button>
				)}
			</div>

			{/* Tabs */}
			<Tabs value={activeType} onValueChange={setActiveType}>
				<TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
					{TYPE_TABS.map((tab) => {
						const count =
							tab.value === "all"
								? accumulated.length
								: (countByType[tab.value] ?? 0);
						return (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="h-8 px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
							>
								{tab.label}
								{count > 0 && (
									<Badge
										variant="secondary"
										className="ml-1.5 h-4 min-w-4 px-1 text-[10px]"
									>
										{count}
									</Badge>
								)}
							</TabsTrigger>
						);
					})}
				</TabsList>

				{TYPE_TABS.map((tab) => (
					<TabsContent key={tab.value} value={tab.value} className="mt-4">
						{renderList(accumulated)}
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
