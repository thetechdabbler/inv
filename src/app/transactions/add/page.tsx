"use client";

import { PageTransition } from "@/components/PageTransition";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, apiJson } from "@/lib/api";
import { TYPE_COLORS } from "@/lib/constants";
import { formatDate, formatInr } from "@/lib/format";
import {
	type AccountHistoryResponse,
	type AccountListItem,
	type AccountsResponse,
	TRANSACTION_TYPES,
	type TransactionType,
} from "@/types/api";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

type FormData = {
	accountId: string;
	type: TransactionType;
	date: string;
	amountInr: number;
	description: string;
};

function toPaise(inr: number): number {
	return Math.round(inr * 100);
}

function AddTransactionContent() {
	const searchParams = useSearchParams();
	const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
		null,
	);
	const [submitting, setSubmitting] = useState(false);
	const [suggestedEpf, setSuggestedEpf] = useState<number | null>(null);
	const { mutate } = useSWRConfig();

	const { data: accountsData, isLoading: accLoading } =
		useSWR<AccountsResponse>("/api/v1/accounts", (url: string) =>
			apiJson<AccountsResponse>(url),
		);

	const accounts: AccountListItem[] = accountsData?.accounts ?? [];

	useEffect(() => {
		const accountId = searchParams.get("accountId");
		if (!accountId || accounts.length === 0) return;
		const found = accounts.some((a) => a.id === accountId);
		if (found) setSelectedAccountId(accountId);
	}, [searchParams, accounts]);

	const selectedId = selectedAccountId ?? "";
	const { data: historyData } = useSWR<AccountHistoryResponse>(
		selectedId ? `/api/v1/accounts/${selectedId}/history?limit=50` : null,
		(url: string) => apiJson<AccountHistoryResponse>(url),
	);

	const accountTxns = (historyData?.entries ?? []).filter(
		(e) => e.type === "investment" || e.type === "withdrawal",
	);

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			date: new Date().toISOString().slice(0, 10),
			description: "",
			type: "investment",
			amountInr: undefined as unknown as number,
		},
	});
	// For EPF accounts, compute a suggested EPF amount (label only)
	useEffect(() => {
		const account = accounts.find((a) => a.id === selectedAccountId);
		if (!account || account.type !== "epf") {
			setSuggestedEpf(null);
			return;
		}

		let cancelled = false;
		(async () => {
			async function computeFromAccount(id: string) {
				const res = await apiFetch(
					`/api/v1/employment-info/${encodeURIComponent(id)}`,
				);
				if (!res.ok) return null;
				const info = (await res.json()) as {
					basicSalaryInr: number | null;
					vpfAmountInr: number | null;
				};
				const basic = Number(info.basicSalaryInr ?? 0);
				const vpf = Number(info.vpfAmountInr ?? 0);
				if (basic <= 0 && vpf <= 0) return null;
				const roundedTwelvePercent = Math.round(0.12 * basic);
				const projectedMonthlyEpf = roundedTwelvePercent * 2 + vpf - 1250;
				if (!Number.isFinite(projectedMonthlyEpf) || projectedMonthlyEpf <= 0)
					return null;
				return projectedMonthlyEpf;
			}

			try {
				let value = await computeFromAccount(account.id);

				if (value == null) {
					const gratuity = accounts.find((a) => a.type === "gratuity");
					if (gratuity) {
						value = await computeFromAccount(gratuity.id);
					}
				}

				if (cancelled) return;
				setSuggestedEpf(value ?? null);
			} catch {
				if (!cancelled) setSuggestedEpf(null);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [accounts, selectedAccountId]);

	async function onSubmit(data: FormData) {
		const amountPaise = toPaise(Number(data.amountInr));
		if (amountPaise <= 0) {
			toast.error("Amount must be greater than 0");
			return;
		}
		if (!selectedAccountId) {
			toast.error("Please select an account");
			return;
		}
		setSubmitting(true);
		try {
			const res = await apiFetch("/api/v1/transactions", {
				method: "POST",
				body: JSON.stringify({
					accountId: selectedAccountId,
					type: data.type,
					date: data.date,
					amountPaise,
					description: data.description.trim() || null,
				}),
			});
			if (!res.ok) {
				const j = (await res.json()) as { message?: string };
				toast.error(j.message ?? "Failed to add transaction");
				return;
			}
			toast.success("Transaction added");
			reset({
				date: new Date().toISOString().slice(0, 10),
				description: "",
				type: "investment",
				amountInr: undefined as unknown as number,
			});
			mutate((key: unknown) => {
				if (typeof key === "string") return key.includes("history");
				if (Array.isArray(key)) return key[0] === "all-histories";
				return false;
			});
			mutate("/api/v1/accounts");
			mutate("/api/v1/portfolio/performance");
		} catch {
			toast.error("Failed to add transaction");
		} finally {
			setSubmitting(false);
		}
	}

	if (accLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48 rounded-lg" />
				<Skeleton className="h-64 rounded-xl" />
			</div>
		);
	}

	if (accounts.length === 0) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/transactions">
							<ArrowLeft className="h-4 w-4" />
							Back
						</Link>
					</Button>
					<h1 className="text-2xl font-bold text-foreground">
						Add Transaction
					</h1>
				</div>
				<Card className="border-dashed border-2">
					<CardContent className="p-10 text-center">
						<p className="text-muted-foreground">No accounts found.</p>
						<p className="text-sm text-muted-foreground/70 mt-1">
							Create an account first before adding transactions.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<PageTransition className="space-y-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/transactions">
						<ArrowLeft className="h-4 w-4" />
						Back
					</Link>
				</Button>
				<h1 className="text-2xl font-bold text-foreground">Add Transaction</h1>
			</div>

			<div className="grid gap-6 lg:grid-cols-[280px_1fr]">
				<Card>
					<div className="border-b px-4 py-3">
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Select Account
						</p>
					</div>
					<div className="p-3 space-y-0.5 max-h-[480px] overflow-y-auto">
						{accounts.map((a) => (
							<button
								key={a.id}
								type="button"
								onClick={() => setSelectedAccountId(a.id)}
								className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left text-sm transition-colors ${
									selectedAccountId === a.id
										? "bg-primary/10 text-primary font-medium ring-1 ring-primary/20"
										: "text-foreground hover:bg-muted"
								}`}
							>
								<span
									className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold ${TYPE_COLORS[a.type] ?? "bg-muted-foreground"}`}
								>
									{a.name.slice(0, 2).toUpperCase()}
								</span>
								<div className="min-w-0">
									<span className="block truncate">{a.name}</span>
									<span className="block text-xs text-muted-foreground capitalize">
										{a.type.replace("_", " ")}
									</span>
								</div>
							</button>
						))}
					</div>
				</Card>

				<div className="space-y-6">
					{!selectedAccountId ? (
						<Card className="border-dashed border-2">
							<CardContent className="flex items-center justify-center p-16">
								<div className="text-center">
									<Building2 className="mx-auto h-10 w-10 text-muted-foreground/30" />
									<p className="mt-2 text-sm text-muted-foreground">
										Select an account from the left to begin
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<>
							<Card>
								<CardContent className="p-6">
									<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
										<h2 className="font-semibold text-foreground">
											New Transaction
										</h2>
										<div className="grid gap-5 sm:grid-cols-2">
											<div>
												<label
													className="block text-sm font-medium text-foreground mb-1.5"
													htmlFor="tx-type"
												>
													Type
												</label>
												<Controller
													name="type"
													control={control}
													rules={{ required: true }}
													render={({ field }) => (
														<Select
															value={field.value}
															onValueChange={field.onChange}
														>
															<SelectTrigger id="tx-type">
																<SelectValue placeholder="Select type" />
															</SelectTrigger>
															<SelectContent>
																{TRANSACTION_TYPES.map((t) => (
																	<SelectItem key={t} value={t}>
																		{t.charAt(0).toUpperCase() + t.slice(1)}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													)}
												/>
											</div>
											<div>
												<label
													className="block text-sm font-medium text-foreground mb-1.5"
													htmlFor="tx-date"
												>
													Date
												</label>
												<Input
													id="tx-date"
													type="date"
													{...register("date", { required: true })}
												/>
											</div>
											<div>
												<label
													className="block text-sm font-medium text-foreground mb-1.5"
													htmlFor="tx-amount"
												>
													Amount (INR)
												</label>
												<Input
													id="tx-amount"
													type="number"
													step="0.01"
													min="0.01"
													{...register("amountInr", {
														required: true,
														min: 0.01,
													})}
												/>
												{suggestedEpf !== null &&
													suggestedEpf > 0 &&
													accounts.find(
														(a) => a.id === selectedAccountId && a.type === "epf",
													) && (
														<p className="mt-1 text-xs text-muted-foreground">
															Suggested EPF amount: ₹
															{suggestedEpf.toFixed(2)}
														</p>
													)}
												{errors.amountInr && (
													<p className="mt-1 text-xs text-destructive">
														Amount must be &gt; 0
													</p>
												)}
											</div>
											<div>
												<label
													className="block text-sm font-medium text-foreground mb-1.5"
													htmlFor="tx-desc"
												>
													Description
												</label>
												<Input
													id="tx-desc"
													type="text"
													placeholder="Optional"
													{...register("description")}
												/>
											</div>
										</div>
										<div className="flex items-center gap-3 pt-1">
											<Button type="submit" disabled={submitting}>
												{submitting ? "Adding\u2026" : "Add Transaction"}
											</Button>
											<Button variant="ghost" asChild>
												<Link href="/transactions">Cancel</Link>
											</Button>
										</div>
									</form>
								</CardContent>
							</Card>

							<Card>
								<div className="border-b px-5 py-3">
									<h2 className="font-semibold text-foreground text-sm">
										Recent Transactions &mdash;{" "}
										{accounts.find((a) => a.id === selectedAccountId)?.name}
									</h2>
								</div>
								{accountTxns.length === 0 ? (
									<CardContent className="py-8 text-center">
										<p className="text-sm text-muted-foreground">
											No transactions for this account yet.
										</p>
									</CardContent>
								) : (
									<div className="divide-y">
										{accountTxns.map((tx, i) => (
											<div
												key={`${tx.date}-${tx.type}-${i}`}
												className="flex items-center justify-between px-5 py-3"
											>
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
														<p className="text-xs text-muted-foreground">
															{formatDate(tx.date)}
														</p>
													</div>
												</div>
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
														<p className="text-xs text-muted-foreground truncate max-w-[150px]">
															{tx.description}
														</p>
													)}
												</div>
											</div>
										))}
									</div>
								)}
							</Card>
						</>
					)}
				</div>
			</div>
		</PageTransition>
	);
}

export default function AddTransactionPage() {
	return (
		<RequireAuth>
			<AddTransactionContent />
		</RequireAuth>
	);
}
