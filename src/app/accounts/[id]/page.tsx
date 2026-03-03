"use client";

import { PageTransition } from "@/components/PageTransition";
import { RequireAuth } from "@/components/RequireAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch, apiJson } from "@/lib/api";
import { TYPE_COLORS } from "@/lib/constants";
import { formatDate, formatIndian, formatInr, paiseToInr } from "@/lib/format";
import type {
	AccountHistoryResponse,
	AccountListItem,
	HistoryEntry,
	PerformanceSnapshot,
} from "@/types/api";
import { ArrowLeft, Check, Pencil, Settings, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

function OverviewTab({
	account,
	perf,
}: {
	account: AccountListItem;
	perf: PerformanceSnapshot | undefined;
}) {
	const currentValue =
		perf?.currentValuePaise ??
		account.currentValuePaise ??
		account.initialBalancePaise;
	const invested = perf?.netInvestedPaise ?? account.initialBalancePaise;
	const pl = perf?.profitLossPaise ?? currentValue - invested;
	const pctReturn =
		perf?.percentReturn ?? (invested > 0 ? (pl / invested) * 100 : 0);
	const isPositive = pl >= 0;

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardContent className="p-4">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Current Value
					</p>
					<p className="mt-1 text-xl font-bold text-foreground">
						{formatIndian(currentValue)}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="p-4">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Net Invested
					</p>
					<p className="mt-1 text-xl font-bold text-foreground">
						{formatIndian(invested)}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="p-4">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Unrealised P&L
					</p>
					<p
						className={`mt-1 text-xl font-bold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
					>
						{isPositive ? "+" : ""}
						{formatInr(pl)}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="p-4">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Return
					</p>
					<p
						className={`mt-1 text-xl font-bold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
					>
						{isPositive ? "+" : ""}
						{pctReturn.toFixed(2)}%
					</p>
				</CardContent>
			</Card>
			{perf && (
				<>
					<Card>
						<CardContent className="p-4">
							<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Total Contributions
							</p>
							<p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
								{formatInr(perf.totalContributionsPaise)}
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Total Withdrawals
							</p>
							<p className="mt-1 text-lg font-semibold text-red-500 dark:text-red-400">
								{formatInr(perf.totalWithdrawalsPaise)}
							</p>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}

function TransactionItem({
	entry,
	onMutate,
}: {
	entry: HistoryEntry;
	onMutate: () => void;
}) {
	const [editing, setEditing] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [saving, setSaving] = useState(false);
	const [editDate, setEditDate] = useState(entry.date);
	const [editAmount, setEditAmount] = useState(
		String(paiseToInr(entry.amountOrValuePaise)),
	);

	async function handleSave() {
		setSaving(true);
		try {
			const amountPaise = Math.round(Number.parseFloat(editAmount) * 100);
			if (Number.isNaN(amountPaise) || amountPaise <= 0) {
				toast.error("Amount must be positive");
				setSaving(false);
				return;
			}
			await apiFetch(`/api/v1/transactions/${entry.id}`, {
				method: "PATCH",
				body: JSON.stringify({ date: editDate, amountPaise }),
			});
			toast.success("Updated");
			setEditing(false);
			onMutate();
		} catch {
			toast.error("Failed to update");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		setSaving(true);
		try {
			await apiFetch(`/api/v1/transactions/${entry.id}`, {
				method: "DELETE",
			});
			toast.success("Deleted");
			onMutate();
		} catch {
			toast.error("Failed to delete");
		} finally {
			setSaving(false);
			setDeleting(false);
		}
	}

	if (deleting) {
		return (
			<div className="flex items-center justify-between px-4 py-3 bg-destructive/5">
				<p className="text-sm">
					Delete {entry.type} of {formatInr(entry.amountOrValuePaise)}?
				</p>
				<div className="flex gap-2">
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
			<div className="flex items-center gap-3 px-4 py-3">
				<Input
					type="date"
					value={editDate}
					onChange={(e) => setEditDate(e.target.value)}
					className="h-8 w-36 text-sm"
				/>
				<Input
					type="number"
					step="0.01"
					min="0.01"
					value={editAmount}
					onChange={(e) => setEditAmount(e.target.value)}
					className="h-8 w-28 text-sm"
				/>
				<div className="ml-auto flex gap-1">
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

	const isInvestment = entry.type === "investment";
	return (
		<div className="group flex items-center justify-between px-4 py-3">
			<div className="flex items-center gap-3">
				<span
					className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${isInvestment ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-500 dark:text-red-400"}`}
				>
					{isInvestment ? "\u2191" : "\u2193"}
				</span>
				<div>
					<span className="text-sm font-medium capitalize">{entry.type}</span>
					<span className="text-xs text-muted-foreground ml-2">
						{formatDate(entry.date)}
					</span>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<span
					className={`text-sm font-semibold ${isInvestment ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
				>
					{isInvestment ? "+" : "-"}
					{formatInr(entry.amountOrValuePaise)}
				</span>
				<div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={() => {
							setEditDate(entry.date);
							setEditAmount(String(paiseToInr(entry.amountOrValuePaise)));
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

function ValuationItem({
	entry,
	onMutate,
}: {
	entry: HistoryEntry;
	onMutate: () => void;
}) {
	const [editing, setEditing] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [saving, setSaving] = useState(false);
	const [editDate, setEditDate] = useState(entry.date);
	const [editValue, setEditValue] = useState(
		String(paiseToInr(entry.amountOrValuePaise)),
	);

	async function handleSave() {
		setSaving(true);
		try {
			const valuePaise = Math.round(Number.parseFloat(editValue) * 100);
			if (Number.isNaN(valuePaise) || valuePaise < 0) {
				toast.error("Value must be non-negative");
				setSaving(false);
				return;
			}
			await apiFetch(`/api/v1/valuations/${entry.id}`, {
				method: "PATCH",
				body: JSON.stringify({ date: editDate, valuePaise }),
			});
			toast.success("Updated");
			setEditing(false);
			onMutate();
		} catch {
			toast.error("Failed to update");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		setSaving(true);
		try {
			await apiFetch(`/api/v1/valuations/${entry.id}`, { method: "DELETE" });
			toast.success("Deleted");
			onMutate();
		} catch {
			toast.error("Failed to delete");
		} finally {
			setSaving(false);
			setDeleting(false);
		}
	}

	if (deleting) {
		return (
			<div className="flex items-center justify-between px-4 py-3 bg-destructive/5">
				<p className="text-sm">
					Delete valuation of {formatInr(entry.amountOrValuePaise)}?
				</p>
				<div className="flex gap-2">
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
			<div className="flex items-center gap-3 px-4 py-3">
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
				/>
				<div className="ml-auto flex gap-1">
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
		<div className="group flex items-center justify-between px-4 py-3">
			<div className="flex items-center gap-3">
				<span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
					&#x2139;
				</span>
				<span className="text-xs text-muted-foreground">
					{formatDate(entry.date)}
				</span>
			</div>
			<div className="flex items-center gap-3">
				<span className="text-sm font-semibold text-primary">
					{formatInr(entry.amountOrValuePaise)}
				</span>
				<div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={() => {
							setEditDate(entry.date);
							setEditValue(String(paiseToInr(entry.amountOrValuePaise)));
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

function HistoryChart({ entries }: { entries: HistoryEntry[] }) {
	const valuations = entries
		.filter((e) => e.type === "valuation")
		.sort((a, b) => a.date.localeCompare(b.date))
		.map((e) => ({ date: e.date, value: paiseToInr(e.amountOrValuePaise) }));

	if (valuations.length < 2) {
		return (
			<p className="text-sm text-muted-foreground text-center py-12">
				Not enough valuation data to chart. Add at least 2 valuations.
			</p>
		);
	}

	return (
		<ResponsiveContainer width="100%" height={300}>
			<LineChart data={valuations}>
				<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
				<XAxis
					dataKey="date"
					tick={{ fontSize: 11 }}
					className="text-muted-foreground"
				/>
				<YAxis
					tick={{ fontSize: 11 }}
					className="text-muted-foreground"
					tickFormatter={(v: number) => `₹${(v / 100).toFixed(0)}`}
				/>
				<RechartsTooltip
					contentStyle={{
						borderRadius: 8,
						border: "1px solid hsl(var(--border))",
						background: "hsl(var(--popover))",
						color: "hsl(var(--popover-foreground))",
					}}
					formatter={(v: number | undefined) => [
						v !== undefined ? `₹${v.toFixed(2)}` : "",
						"Value",
					]}
				/>
				<Line
					type="monotone"
					dataKey="value"
					stroke="hsl(var(--primary))"
					strokeWidth={2}
					dot={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}

function AccountDetailContent() {
	const { id } = useParams<{ id: string }>();
	const { mutate } = useSWRConfig();

	const { data: account, isLoading: accLoading } = useSWR<AccountListItem>(
		`/api/v1/accounts/${id}`,
		(url: string) => apiJson<AccountListItem>(url),
	);

	const { data: perf } = useSWR<PerformanceSnapshot>(
		account ? `/api/v1/accounts/${id}/performance` : null,
		(url: string) => apiJson<PerformanceSnapshot>(url),
	);

	const { data: historyData, isLoading: histLoading } =
		useSWR<AccountHistoryResponse>(
			account ? `/api/v1/accounts/${id}/history?limit=500` : null,
			(url: string) => apiJson<AccountHistoryResponse>(url),
		);

	const entries = historyData?.entries ?? [];
	const transactions = entries.filter(
		(e) => e.type === "investment" || e.type === "withdrawal",
	);
	const valuations = entries.filter((e) => e.type === "valuation");

	function handleMutate() {
		mutate(
			(key: unknown) =>
				typeof key === "string" && key.includes(`/accounts/${id}`),
			undefined,
			{ revalidate: true },
		);
	}

	if (accLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-24 rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	if (!account) {
		return (
			<Card>
				<CardContent className="p-10 text-center">
					<p className="text-muted-foreground">Account not found.</p>
					<Button asChild variant="outline" className="mt-4">
						<Link href="/accounts">Back to accounts</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<PageTransition className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" asChild className="h-8 w-8">
						<Link href="/accounts">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3">
						<div
							className={`flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-bold ${TYPE_COLORS[account.type] ?? "bg-muted-foreground"}`}
						>
							{account.name.slice(0, 2).toUpperCase()}
						</div>
						<div>
							<h1 className="text-2xl font-bold text-foreground">
								{account.name}
							</h1>
							<Badge variant="outline" className="capitalize text-xs">
								{account.type.replace(/_/g, " ")}
							</Badge>
						</div>
					</div>
				</div>
				<Button variant="outline" asChild>
					<Link href={`/accounts/${id}/edit`}>
						<Settings className="h-4 w-4" />
						Edit
					</Link>
				</Button>
			</div>

			<Tabs defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="transactions">
						Transactions ({transactions.length})
					</TabsTrigger>
					<TabsTrigger value="valuations">
						Valuations ({valuations.length})
					</TabsTrigger>
					<TabsTrigger value="history">History</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<OverviewTab account={account} perf={perf} />
				</TabsContent>

				<TabsContent value="transactions">
					{histLoading ? (
						<div className="space-y-2">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-14 rounded-xl" />
							))}
						</div>
					) : transactions.length === 0 ? (
						<Card className="border-dashed border-2">
							<CardContent className="p-10 text-center">
								<p className="text-muted-foreground">
									No transactions for this account.
								</p>
							</CardContent>
						</Card>
					) : (
						<Card className="overflow-hidden divide-y">
							{transactions
								.sort((a, b) => b.date.localeCompare(a.date))
								.map((e) => (
									<TransactionItem
										key={e.id}
										entry={e}
										onMutate={handleMutate}
									/>
								))}
						</Card>
					)}
				</TabsContent>

				<TabsContent value="valuations">
					{histLoading ? (
						<div className="space-y-2">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-14 rounded-xl" />
							))}
						</div>
					) : valuations.length === 0 ? (
						<Card className="border-dashed border-2">
							<CardContent className="p-10 text-center">
								<p className="text-muted-foreground">
									No valuations for this account.
								</p>
							</CardContent>
						</Card>
					) : (
						<Card className="overflow-hidden divide-y">
							{valuations
								.sort((a, b) => b.date.localeCompare(a.date))
								.map((e) => (
									<ValuationItem key={e.id} entry={e} onMutate={handleMutate} />
								))}
						</Card>
					)}
				</TabsContent>

				<TabsContent value="history">
					<Card>
						<CardContent className="p-4">
							<HistoryChart entries={entries} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</PageTransition>
	);
}

export default function AccountDetailPage() {
	return (
		<RequireAuth>
			<AccountDetailContent />
		</RequireAuth>
	);
}
