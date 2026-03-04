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
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch, apiJson } from "@/lib/api";
import { TYPE_COLORS } from "@/lib/constants";
import { formatDate, formatIndian, formatInr } from "@/lib/format";
import { paiseToInr } from "@/lib/format";
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

const PAGE_SIZE = 50;

function TransactionRow({
	tx,
	onMutate,
}: {
	tx: TransactionWithAccount;
	onMutate: () => void;
}) {
	const [editing, setEditing] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [saving, setSaving] = useState(false);
	const [editDate, setEditDate] = useState(tx.date);
	const [editAmount, setEditAmount] = useState(
		String(paiseToInr(tx.amountOrValuePaise)),
	);
	const [editType, setEditType] = useState(tx.type);

	async function handleSave() {
		setSaving(true);
		try {
			const amountPaise = Math.round(Number.parseFloat(editAmount) * 100);
			if (Number.isNaN(amountPaise) || amountPaise <= 0) {
				toast.error("Amount must be a positive number");
				setSaving(false);
				return;
			}
			await apiFetch(`/api/v1/transactions/${tx.id}`, {
				method: "PATCH",
				body: JSON.stringify({
					date: editDate,
					amountPaise,
					type: editType,
				}),
			});
			toast.success("Transaction updated");
			setEditing(false);
			onMutate();
		} catch {
			toast.error("Failed to update transaction");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		setSaving(true);
		try {
			await apiFetch(`/api/v1/transactions/${tx.id}`, { method: "DELETE" });
			toast.success("Transaction deleted");
			onMutate();
		} catch {
			toast.error("Failed to delete transaction");
		} finally {
			setSaving(false);
			setDeleting(false);
		}
	}

	if (deleting) {
		return (
			<div className="flex items-center justify-between px-5 py-3 bg-destructive/5">
				<p className="text-sm text-foreground">
					Delete this {tx.type} of {formatInr(tx.amountOrValuePaise)}?
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
				<select
					value={editType}
					onChange={(e) =>
						setEditType(e.target.value as "investment" | "withdrawal")
					}
					className="h-8 rounded-md border border-input bg-transparent px-2 text-sm dark:bg-card dark:dark-inset"
				>
					<option value="investment">Investment</option>
					<option value="withdrawal">Withdrawal</option>
				</select>
				<Input
					type="number"
					step="0.01"
					min="0.01"
					value={editAmount}
					onChange={(e) => setEditAmount(e.target.value)}
					className="h-8 w-28 text-sm"
					placeholder="Amount (₹)"
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
				<span
					className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
						tx.type === "investment"
							? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
							: "bg-red-500/10 text-red-500 dark:text-red-400"
					}`}
				>
					{tx.type === "investment" ? "\u2191" : "\u2193"}
				</span>
				<div>
					<p className="text-sm font-medium text-foreground capitalize">
						{tx.type}
					</p>
					<div className="flex items-center gap-2 mt-0.5">
						<span
							className={`inline-flex h-4 w-4 items-center justify-center rounded text-white text-[8px] font-bold ${TYPE_COLORS[tx.accountType] ?? "bg-muted-foreground"}`}
						>
							{tx.accountName.slice(0, 2).toUpperCase()}
						</span>
						<span className="text-xs text-muted-foreground">
							{tx.accountName}
						</span>
						<span className="text-xs text-muted-foreground/50">&middot;</span>
						<span className="text-xs text-muted-foreground">
							{formatDate(tx.date)}
						</span>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<div className="text-right">
					<p
						className={`text-sm font-semibold ${
							tx.type === "investment"
								? "text-emerald-600 dark:text-emerald-400"
								: "text-red-500 dark:text-red-400"
						}`}
					>
						{tx.type === "investment" ? "+" : "-"}
						{formatInr(tx.amountOrValuePaise)}
					</p>
					{tx.description && (
						<p className="text-xs text-muted-foreground truncate max-w-[180px]">
							{tx.description}
						</p>
					)}
				</div>
				<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={() => {
							setEditDate(tx.date);
							setEditAmount(String(paiseToInr(tx.amountOrValuePaise)));
							setEditType(tx.type);
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
				{group.txCount} transaction{group.txCount !== 1 ? "s" : ""}
			</span>
			<div className="flex items-center gap-4 text-xs font-semibold">
				<span className="text-emerald-600 dark:text-emerald-400">
					+{formatInr(group.totalInvestedPaise)} invested
				</span>
				{group.totalWithdrawnPaise > 0 && (
					<span className="text-red-500 dark:text-red-400">
						-{formatInr(group.totalWithdrawnPaise)} withdrawn
					</span>
				)}
				<Badge
					variant="outline"
					className={
						group.netPaise >= 0
							? "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
							: "text-red-500 dark:text-red-400 border-red-200 dark:border-red-800"
					}
				>
					Net: {group.netPaise >= 0 ? "+" : ""}
					{formatInr(group.netPaise)}
				</Badge>
			</div>
		</CardFooter>
	);
}

function MonthlyReportView({
	reports,
}: {
	reports: MonthlyReport[];
}) {
	if (reports.length === 0) {
		return (
			<p className="text-sm text-muted-foreground text-center py-8">
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
				<Card>
					<CardContent className="p-4">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Total Invested
						</p>
						<p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
							<span title={formatInr(totalInvested)}>
								{formatIndian(totalInvested)}
							</span>
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Total Withdrawn
						</p>
						<p className="mt-1 text-xl font-bold text-red-500 dark:text-red-400">
							<span title={formatInr(totalWithdrawn)}>
								{formatIndian(totalWithdrawn)}
							</span>
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Avg Monthly Investment
						</p>
						<p className="mt-1 text-xl font-bold text-primary">
							<span title={formatInr(Math.round(avgMonthlyInvested))}>
								{formatIndian(Math.round(avgMonthlyInvested))}
							</span>
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="px-5">Month</TableHead>
							<TableHead className="px-5 text-right text-emerald-600 dark:text-emerald-400">
								Invested
							</TableHead>
							<TableHead className="px-5 text-right text-red-500 dark:text-red-400">
								Withdrawn
							</TableHead>
							<TableHead className="px-5 text-right">Net</TableHead>
							<TableHead className="px-5 text-right">Txns</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{reports.map((r) => (
							<TableRow key={r.key}>
								<TableCell className="px-5 font-medium">{r.label}</TableCell>
								<TableCell className="px-5 text-right text-emerald-600 dark:text-emerald-400 font-medium">
									{r.investedPaise > 0 ? formatInr(r.investedPaise) : "\u2014"}
								</TableCell>
								<TableCell className="px-5 text-right text-red-500 dark:text-red-400 font-medium">
									{r.withdrawnPaise > 0
										? formatInr(r.withdrawnPaise)
										: "\u2014"}
								</TableCell>
								<TableCell
									className={`px-5 text-right font-semibold ${r.netPaise >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
								>
									{r.netPaise >= 0 ? "+" : ""}
									{formatInr(r.netPaise)}
								</TableCell>
								<TableCell className="px-5 text-right text-muted-foreground">
									{r.txCount}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell className="px-5 font-semibold">Total</TableCell>
							<TableCell className="px-5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
								{formatInr(totalInvested)}
							</TableCell>
							<TableCell className="px-5 text-right font-semibold text-red-500 dark:text-red-400">
								{formatInr(totalWithdrawn)}
							</TableCell>
							<TableCell
								className={`px-5 text-right font-semibold ${totalInvested - totalWithdrawn >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
							>
								{totalInvested - totalWithdrawn >= 0 ? "+" : ""}
								{formatInr(totalInvested - totalWithdrawn)}
							</TableCell>
							<TableCell className="px-5 text-right text-muted-foreground font-semibold">
								{reports.reduce((s, r) => s + r.txCount, 0)}
							</TableCell>
						</TableRow>
					</TableFooter>
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
									<span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
										+{formatInr(r.investedPaise)}
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
											{acct.investedPaise > 0 && (
												<span className="text-emerald-600 dark:text-emerald-400">
													+{formatInr(acct.investedPaise)}
												</span>
											)}
											{acct.withdrawnPaise > 0 && (
												<span className="text-red-500 dark:text-red-400">
													-{formatInr(acct.withdrawnPaise)}
												</span>
											)}
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

function TransactionsContent() {
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

	const filteredTransactions = allTransactions.filter((tx) => {
		if (filterAccountIds.length > 0 && !filterAccountIds.includes(tx.accountId))
			return false;
		if (filterFrom && tx.date < filterFrom) return false;
		if (filterTo && tx.date > filterTo) return false;
		return true;
	});

	const visibleTransactions = filteredTransactions.slice(0, visibleCount);
	const monthGroups = groupByMonth(visibleTransactions);
	const monthlyReports = buildMonthlyReports(filteredTransactions);
	const hasMore = visibleCount < filteredTransactions.length;

	const isLoading = accLoading || histLoading;

	return (
		<PageTransition className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">Transactions</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{hasMore
							? `Showing ${visibleCount} of ${filteredTransactions.length}`
							: `${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? "s" : ""}`}{" "}
						{filterAccountIds.length > 0 || filterFrom || filterTo
							? "(filtered)"
							: "across all accounts"}
					</p>
				</div>
				<Button asChild>
					<Link href="/transactions/add">
						<Plus className="h-4 w-4" />
						Add Transaction
					</Link>
				</Button>
			</div>

			{!accLoading && allAccounts.length > 0 && (
				<AccountDateFilter accounts={allAccounts} />
			)}

			<Tabs defaultValue="transactions">
				<TabsList>
					<TabsTrigger value="transactions">All Transactions</TabsTrigger>
					<TabsTrigger value="report">Monthly Report</TabsTrigger>
				</TabsList>

				<TabsContent value="transactions">
					{isLoading && (
						<div className="space-y-2">
							{[1, 2, 3, 4, 5].map((i) => (
								<Skeleton key={i} className="h-16 rounded-xl" />
							))}
						</div>
					)}

					{!isLoading && allTransactions.length === 0 && (
						<Card className="border-dashed border-2">
							<CardContent className="p-10 text-center">
								<p className="text-muted-foreground">
									No transactions recorded yet.
								</p>
								<p className="text-sm text-muted-foreground/70 mt-1">
									{allAccounts.length === 0
										? "Create an account first, then add transactions."
										: 'Click "Add Transaction" to get started.'}
								</p>
							</CardContent>
						</Card>
					)}

					{!isLoading && allTransactions.length > 0 && (
						<div className="space-y-5">
							{monthGroups.map((group) => (
								<Card key={group.key} className="overflow-hidden">
									<div className="flex items-center justify-between bg-muted/50 border-b px-5 py-3">
										<h2 className="font-semibold text-foreground text-sm">
											{group.label}
										</h2>
										<span className="text-xs text-muted-foreground">
											{group.txCount} txn{group.txCount !== 1 ? "s" : ""}
										</span>
									</div>
									<div className="divide-y">
										{group.transactions.map((tx) => (
											<TransactionRow
												key={tx.id}
												tx={tx}
												onMutate={handleMutate}
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
												Math.min(c + PAGE_SIZE, filteredTransactions.length),
											)
										}
									>
										Load more ({filteredTransactions.length - visibleCount}{" "}
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

export default function TransactionsPage() {
	return (
		<RequireAuth>
			<TransactionsContent />
		</RequireAuth>
	);
}
