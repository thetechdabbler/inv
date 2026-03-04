"use client";

import { PageTransition } from "@/components/PageTransition";
import { RequireAuth } from "@/components/RequireAuth";
import { AccountDateFilter } from "@/components/filters/AccountDateFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch, apiJson } from "@/lib/api";
import { TYPE_COLORS } from "@/lib/constants";
import { formatDate, formatIndian, formatInr, paiseToInr } from "@/lib/format";
import type {
	AccountHistoryResponse,
	AccountsResponse,
	HistoryEntry,
} from "@/types/api";
import { Check, ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

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

const STALE_DAYS = 30;

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

const PAGE_SIZE = 50;

function ValuationRow({
	v,
	onMutate,
	isStale,
}: {
	v: ValuationWithAccount;
	onMutate: () => void;
	isStale?: boolean;
}) {
	const [editing, setEditing] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [saving, setSaving] = useState(false);
	const [editDate, setEditDate] = useState(v.date);
	const [editValue, setEditValue] = useState(
		String(paiseToInr(v.amountOrValuePaise)),
	);

	async function handleSave() {
		setSaving(true);
		try {
			const valuePaise = Math.round(Number.parseFloat(editValue) * 100);
			if (Number.isNaN(valuePaise) || valuePaise < 0) {
				toast.error("Value must be a non-negative number");
				setSaving(false);
				return;
			}
			await apiFetch(`/api/v1/valuations/${v.id}`, {
				method: "PATCH",
				body: JSON.stringify({ date: editDate, valuePaise }),
			});
			toast.success("Valuation updated");
			setEditing(false);
			onMutate();
		} catch {
			toast.error("Failed to update valuation");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		setSaving(true);
		try {
			await apiFetch(`/api/v1/valuations/${v.id}`, { method: "DELETE" });
			toast.success("Valuation deleted");
			onMutate();
		} catch {
			toast.error("Failed to delete valuation");
		} finally {
			setSaving(false);
			setDeleting(false);
		}
	}

	if (deleting) {
		return (
			<div className="flex items-center justify-between px-5 py-3 bg-destructive/5">
				<p className="text-sm text-foreground">
					Delete this valuation of {formatInr(v.amountOrValuePaise)}?
				</p>
				<div className="flex items-center gap-2">
					<Button
						variant="destructive"
						size="sm"
						onClick={handleDelete}
						disabled={saving}
					>
						{saving ? "Deleting…" : "Delete"}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setDeleting(false)}
						disabled={saving}
					>
						Cancel
					</Button>
				</div>
			</div>
		);
	}

	if (editing) {
		return (
			<div className="flex items-center gap-3 px-5 py-3">
				<Input
					type="date"
					value={editDate}
					onChange={(e) => setEditDate(e.target.value)}
					className="h-8 w-36 text-sm"
				/>
				<Input
					type="number"
					step="0.01"
					min="0"
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					className="h-8 w-32 text-sm"
					placeholder="Value (₹)"
				/>
				<div className="ml-auto flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={handleSave}
						disabled={saving}
					>
						<Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={() => setEditing(false)}
						disabled={saving}
					>
						<X className="h-4 w-4 text-muted-foreground" />
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="group flex items-center justify-between px-5 py-3">
			<div className="flex items-center gap-3">
				<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
					&#x2139;
				</span>
				<div>
					<p className="text-sm font-medium text-foreground">Valuation</p>
					<div className="flex items-center gap-2 mt-0.5">
						<span
							className={`inline-flex h-4 w-4 items-center justify-center rounded text-white text-[8px] font-bold ${TYPE_COLORS[v.accountType] ?? "bg-muted-foreground"}`}
						>
							{v.accountName.slice(0, 2).toUpperCase()}
						</span>
						<span className="text-xs text-muted-foreground">
							{v.accountName}
						</span>
						<span className="text-xs text-muted-foreground/50">&middot;</span>
						<span className="text-xs text-muted-foreground">
							{formatDate(v.date)}
						</span>
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
			</div>
			<div className="flex items-center gap-3">
				<div className="text-right">
					<p className="text-sm font-semibold text-primary">
						{formatInr(v.amountOrValuePaise)}
					</p>
					{v.description && (
						<p className="text-xs text-muted-foreground truncate max-w-[180px]">
							{v.description}
						</p>
					)}
				</div>
				<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={() => {
							setEditDate(v.date);
							setEditValue(String(paiseToInr(v.amountOrValuePaise)));
							setEditing(true);
						}}
					>
						<Pencil className="h-3.5 w-3.5 text-muted-foreground" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={() => setDeleting(true)}
					>
						<Trash2 className="h-3.5 w-3.5 text-destructive" />
					</Button>
				</div>
			</div>
		</div>
	);
}

function MonthSummaryFooter({ group }: { group: MonthGroup }) {
	return (
		<CardFooter className="flex-wrap gap-3 justify-between bg-muted/50 border-t px-5 py-3">
			<span className="text-xs font-medium text-muted-foreground">
				{group.count} valuation{group.count !== 1 ? "s" : ""}
			</span>
			<Badge variant="outline" className="text-primary border-primary/20">
				Portfolio: {formatInr(group.totalValuePaise)}
			</Badge>
		</CardFooter>
	);
}

function MonthlyReportView({ reports }: { reports: MonthlyReport[] }) {
	if (reports.length === 0) {
		return (
			<p className="text-sm text-muted-foreground text-center py-8">
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
				<Card>
					<CardContent className="p-4">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Latest Portfolio Value
						</p>
						<p className="mt-1 text-xl font-bold text-primary">
							<span title={formatInr(latestReport.totalValuePaise)}>
								{formatIndian(latestReport.totalValuePaise)}
							</span>
						</p>
						<p className="text-xs text-muted-foreground mt-0.5">
							{latestReport.label}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Month-over-Month
						</p>
						{prevReport ? (
							<p
								className={`mt-1 text-xl font-bold ${changePaise >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
							>
								{changePaise >= 0 ? "+" : ""}
								<span title={formatInr(changePaise)}>
									{formatIndian(changePaise)}
								</span>
							</p>
						) : (
							<p className="mt-1 text-xl font-bold text-muted-foreground">
								&mdash;
							</p>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Total Valuations
						</p>
						<p className="mt-1 text-xl font-bold text-foreground">
							{reports.reduce((s, r) => s + r.count, 0)}
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="px-5">Month</TableHead>
							<TableHead className="px-5 text-right text-primary">
								Portfolio Value
							</TableHead>
							<TableHead className="px-5 text-right">Change</TableHead>
							<TableHead className="px-5 text-right">Entries</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{reports.map((r, idx) => {
							const prev = idx < reports.length - 1 ? reports[idx + 1] : null;
							const change = prev
								? r.totalValuePaise - prev.totalValuePaise
								: null;
							return (
								<TableRow key={r.key}>
									<TableCell className="px-5 font-medium">{r.label}</TableCell>
									<TableCell className="px-5 text-right text-primary font-medium">
										{formatInr(r.totalValuePaise)}
									</TableCell>
									<TableCell
										className={`px-5 text-right font-semibold ${
											change === null
												? "text-muted-foreground"
												: change >= 0
													? "text-emerald-600 dark:text-emerald-400"
													: "text-red-500 dark:text-red-400"
										}`}
									>
										{change === null
											? "\u2014"
											: `${change >= 0 ? "+" : ""}${formatInr(change)}`}
									</TableCell>
									<TableCell className="px-5 text-right text-muted-foreground">
										{r.count}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Card>

			<div className="space-y-3">
				<h3 className="font-semibold text-foreground">
					Monthly Breakdown by Account
				</h3>
				{reports.map((r) => (
					<Card key={r.key} className="group">
						<details>
							<summary className="flex cursor-pointer items-center justify-between px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors list-none">
								<span>{r.label}</span>
								<div className="flex items-center gap-3">
									<span className="text-primary text-xs font-semibold">
										{formatInr(r.totalValuePaise)}
									</span>
									<ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
								</div>
							</summary>
							<div className="border-t px-5 py-3 space-y-2">
								{r.byAccount.map((acct) => (
									<div
										key={acct.name}
										className="flex items-center justify-between text-sm"
									>
										<div className="flex items-center gap-2">
											<span
												className={`inline-flex h-5 w-5 items-center justify-center rounded text-white text-[8px] font-bold ${TYPE_COLORS[acct.type] ?? "bg-muted-foreground"}`}
											>
												{acct.name.slice(0, 2).toUpperCase()}
											</span>
											<span className="text-muted-foreground">{acct.name}</span>
										</div>
										<div className="flex items-center gap-3 text-xs font-medium">
											<span className="text-primary">
												{formatInr(acct.latestValuePaise)}
											</span>
											<span className="text-muted-foreground">
												({acct.count} entr{acct.count !== 1 ? "ies" : "y"})
											</span>
										</div>
									</div>
								))}
							</div>
						</details>
					</Card>
				))}
			</div>
		</div>
	);
}

function ValuationsContent() {
	const { mutate } = useSWRConfig();
	const searchParams = useSearchParams();
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	const filterAccountIds =
		searchParams.get("accountIds")?.split(",").filter(Boolean) ?? [];
	const filterFrom = searchParams.get("from") ?? "";
	const filterTo = searchParams.get("to") ?? "";

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

	const staleAccountIds = new Set<string>();
	if (allHistories && allAccounts.length > 0) {
		const now = new Date();
		const thresholdMs = STALE_DAYS * 24 * 60 * 60 * 1000;
		for (const account of allAccounts) {
			const entries = allHistories[account.id] ?? [];
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

	function handleMutate() {
		mutate(
			(key: unknown) =>
				typeof key === "string"
					? key.includes("histor") || key.includes("account")
					: Array.isArray(key) &&
						key.some(
							(k) =>
								typeof k === "string" &&
								(k.includes("histor") || k.includes("account")),
						),
			undefined,
			{ revalidate: true },
		);
	}

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

	const filteredValuations = allValuations.filter((v) => {
		if (filterAccountIds.length > 0 && !filterAccountIds.includes(v.accountId))
			return false;
		if (filterFrom && v.date < filterFrom) return false;
		if (filterTo && v.date > filterTo) return false;
		return true;
	});

	const visibleValuations = filteredValuations.slice(0, visibleCount);
	const monthGroups = groupByMonth(visibleValuations);
	const monthlyReports = buildMonthlyReports(filteredValuations);
	const hasMore = visibleCount < filteredValuations.length;

	const isLoading = accLoading || histLoading;

	return (
		<PageTransition className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">Valuations</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{hasMore
							? `Showing ${visibleCount} of ${filteredValuations.length}`
							: `${filteredValuations.length} valuation${filteredValuations.length !== 1 ? "s" : ""}`}{" "}
						{filterAccountIds.length > 0 || filterFrom || filterTo
							? "(filtered)"
							: "across all accounts"}
					</p>
				</div>
				<Button asChild>
					<Link href="/valuations/add">
						<Plus className="h-4 w-4" />
						Add Valuation
					</Link>
				</Button>
			</div>

			{!accLoading && allAccounts.length > 0 && (
				<AccountDateFilter accounts={allAccounts} />
			)}

			<Tabs defaultValue="valuations">
				<TabsList>
					<TabsTrigger value="valuations">All Valuations</TabsTrigger>
					<TabsTrigger value="report">Monthly Report</TabsTrigger>
				</TabsList>

				<TabsContent value="valuations">
					{isLoading && (
						<div className="space-y-2">
							{[1, 2, 3, 4, 5].map((i) => (
								<Skeleton key={i} className="h-16 rounded-xl" />
							))}
						</div>
					)}

					{!isLoading && allValuations.length === 0 && (
						<Card className="border-dashed border-2">
							<CardContent className="p-10 text-center">
								<p className="text-muted-foreground">
									No valuations recorded yet.
								</p>
								<p className="text-sm text-muted-foreground/70 mt-1">
									{allAccounts.length === 0
										? "Create an account first, then add valuations."
										: 'Click "Add Valuation" to get started.'}
								</p>
							</CardContent>
						</Card>
					)}

					{!isLoading && allValuations.length > 0 && (
						<div className="space-y-5">
							{monthGroups.map((group) => (
								<Card key={group.key} className="overflow-hidden">
									<div className="flex items-center justify-between bg-muted/50 border-b px-5 py-3">
										<h2 className="font-semibold text-foreground text-sm">
											{group.label}
										</h2>
										<span className="text-xs text-muted-foreground">
											{group.count} entr{group.count !== 1 ? "ies" : "y"}
										</span>
									</div>
									<div className="divide-y">
										{group.valuations.map((v) => (
											<ValuationRow
												key={v.id}
												v={v}
												onMutate={handleMutate}
												isStale={staleAccountIds.has(v.accountId)}
											/>
										))}
									</div>
									<MonthSummaryFooter group={group} />
								</Card>
							))}
							{hasMore && (
								<div className="text-center">
									<Button
										variant="outline"
										onClick={() =>
											setVisibleCount((c) =>
												Math.min(c + PAGE_SIZE, filteredValuations.length),
											)
										}
									>
										Load more ({filteredValuations.length - visibleCount}{" "}
										remaining)
									</Button>
								</div>
							)}
						</div>
					)}
				</TabsContent>

				<TabsContent value="report">
					{isLoading ? (
						<div className="space-y-2">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-16 rounded-xl" />
							))}
						</div>
					) : (
						<MonthlyReportView reports={monthlyReports} />
					)}
				</TabsContent>
			</Tabs>
		</PageTransition>
	);
}

export default function ValuationsPage() {
	return (
		<RequireAuth>
			<ValuationsContent />
		</RequireAuth>
	);
}
