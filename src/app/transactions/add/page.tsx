"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { apiFetch, apiJson } from "@/lib/api";
import { formatInr } from "@/lib/format";
import {
	type AccountHistoryResponse,
	type AccountListItem,
	type AccountsResponse,
	type HistoryEntry,
	TRANSACTION_TYPES,
	type TransactionType,
} from "@/types/api";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

const TYPE_COLORS: Record<string, string> = {
	stocks: "bg-blue-500",
	mutual_fund: "bg-violet-500",
	ppf: "bg-emerald-500",
	epf: "bg-teal-500",
	nps: "bg-amber-500",
	bank_deposit: "bg-cyan-500",
	gratuity: "bg-rose-500",
};

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
	const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
		null,
	);
	const [submitting, setSubmitting] = useState(false);
	const { mutate } = useSWRConfig();

	const { data: accountsData, isLoading: accLoading } =
		useSWR<AccountsResponse>("/api/v1/accounts", (url: string) =>
			apiJson<AccountsResponse>(url),
		);

	const accounts: AccountListItem[] = accountsData?.accounts ?? [];

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
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			date: new Date().toISOString().slice(0, 10),
			description: "",
		},
	});

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
				<div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
				<div className="h-64 animate-pulse rounded-xl bg-slate-200" />
			</div>
		);
	}

	if (accounts.length === 0) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<Link
						href="/transactions"
						className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
					>
						<svg
							className="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<title>Back</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Back
					</Link>
					<h1 className="text-2xl font-bold text-slate-800">Add Transaction</h1>
				</div>
				<div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
					<p className="text-slate-500">No accounts found.</p>
					<p className="text-sm text-slate-400 mt-1">
						Create an account first before adding transactions.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Link
					href="/transactions"
					className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
				>
					<svg
						className="h-4 w-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<title>Back</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back
				</Link>
				<h1 className="text-2xl font-bold text-slate-800">Add Transaction</h1>
			</div>

			<div className="grid gap-6 lg:grid-cols-[280px_1fr]">
				{/* Account selector */}
				<div className="rounded-xl border border-slate-200 bg-white shadow-sm">
					<div className="border-b border-slate-200 px-4 py-3">
						<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
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
										? "bg-indigo-50 text-indigo-700 font-medium ring-1 ring-indigo-200"
										: "text-slate-600 hover:bg-slate-50"
								}`}
							>
								<span
									className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold ${TYPE_COLORS[a.type] ?? "bg-slate-400"}`}
								>
									{a.name.slice(0, 2).toUpperCase()}
								</span>
								<div className="min-w-0">
									<span className="block truncate">{a.name}</span>
									<span className="block text-xs text-slate-400 capitalize">
										{a.type.replace("_", " ")}
									</span>
								</div>
							</button>
						))}
					</div>
				</div>

				{/* Form + recent transactions */}
				<div className="space-y-6">
					{!selectedAccountId ? (
						<div className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-16">
							<div className="text-center">
								<svg
									className="mx-auto h-10 w-10 text-slate-300"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>Select account</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-16 0H3m4-8h4m-4 4h4"
									/>
								</svg>
								<p className="mt-2 text-sm text-slate-400">
									Select an account from the left to begin
								</p>
							</div>
						</div>
					) : (
						<>
							{/* Transaction form */}
							<form
								onSubmit={handleSubmit(onSubmit)}
								className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
							>
								<h2 className="font-semibold text-slate-800">
									New Transaction
								</h2>
								<div className="grid gap-5 sm:grid-cols-2">
									<div>
										<label
											className="block text-sm font-medium text-slate-600 mb-1.5"
											htmlFor="tx-type"
										>
											Type
										</label>
										<select
											id="tx-type"
											className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
											{...register("type", { required: true })}
										>
											{TRANSACTION_TYPES.map((t) => (
												<option key={t} value={t}>
													{t.charAt(0).toUpperCase() + t.slice(1)}
												</option>
											))}
										</select>
									</div>
									<div>
										<label
											className="block text-sm font-medium text-slate-600 mb-1.5"
											htmlFor="tx-date"
										>
											Date
										</label>
										<input
											id="tx-date"
											type="date"
											className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
											{...register("date", { required: true })}
										/>
									</div>
									<div>
										<label
											className="block text-sm font-medium text-slate-600 mb-1.5"
											htmlFor="tx-amount"
										>
											Amount (INR)
										</label>
										<input
											id="tx-amount"
											type="number"
											step="0.01"
											min="0.01"
											className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
											{...register("amountInr", {
												required: true,
												min: 0.01,
											})}
										/>
										{errors.amountInr && (
											<p className="mt-1 text-xs text-red-500">
												Amount must be &gt; 0
											</p>
										)}
									</div>
									<div>
										<label
											className="block text-sm font-medium text-slate-600 mb-1.5"
											htmlFor="tx-desc"
										>
											Description
										</label>
										<input
											id="tx-desc"
											type="text"
											className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
											placeholder="Optional"
											{...register("description")}
										/>
									</div>
								</div>
								<div className="flex items-center gap-3 pt-1">
									<button
										type="submit"
										disabled={submitting}
										className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
									>
										{submitting ? "Adding\u2026" : "Add Transaction"}
									</button>
									<Link
										href="/transactions"
										className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
									>
										Cancel
									</Link>
								</div>
							</form>

							{/* Recent transactions for selected account */}
							<div className="rounded-xl border border-slate-200 bg-white shadow-sm">
								<div className="border-b border-slate-200 px-5 py-3">
									<h2 className="font-semibold text-slate-700 text-sm">
										Recent Transactions &mdash;{" "}
										{accounts.find((a) => a.id === selectedAccountId)?.name}
									</h2>
								</div>
								{accountTxns.length === 0 ? (
									<div className="px-5 py-8 text-center">
										<p className="text-sm text-slate-400">
											No transactions for this account yet.
										</p>
									</div>
								) : (
									<div className="divide-y divide-slate-100">
										{accountTxns.map((tx, i) => (
											<div
												key={`${tx.date}-${tx.type}-${i}`}
												className="flex items-center justify-between px-5 py-3"
											>
												<div className="flex items-center gap-3">
													<span
														className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
															tx.type === "investment"
																? "bg-emerald-50 text-emerald-600"
																: "bg-red-50 text-red-500"
														}`}
													>
														{tx.type === "investment" ? "\u2191" : "\u2193"}
													</span>
													<div>
														<p className="text-sm font-medium text-slate-700 capitalize">
															{tx.type}
														</p>
														<p className="text-xs text-slate-400">{tx.date}</p>
													</div>
												</div>
												<div className="text-right">
													<p
														className={`text-sm font-semibold ${
															tx.type === "investment"
																? "text-emerald-600"
																: "text-red-500"
														}`}
													>
														{tx.type === "investment" ? "+" : "-"}
														{formatInr(tx.amountOrValuePaise)}
													</p>
													{tx.description && (
														<p className="text-xs text-slate-400 truncate max-w-[150px]">
															{tx.description}
														</p>
													)}
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default function AddTransactionPage() {
	return (
		<RequireAuth>
			<AddTransactionContent />
		</RequireAuth>
	);
}
