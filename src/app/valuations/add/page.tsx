"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { apiFetch, apiJson } from "@/lib/api";
import { formatInr } from "@/lib/format";
import type {
	AccountHistoryResponse,
	AccountListItem,
	AccountsResponse,
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
	date: string;
	valueInr: number;
};

function toPaise(inr: number): number {
	return Math.round(inr * 100);
}

function AddValuationContent() {
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

	const accountValuations = (historyData?.entries ?? []).filter(
		(e) => e.type === "valuation",
	);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			date: new Date().toISOString().slice(0, 10),
		},
	});

	async function onSubmit(data: FormData) {
		const valuePaise = toPaise(Number(data.valueInr));
		if (valuePaise < 0) {
			toast.error("Value must be >= 0");
			return;
		}
		if (!selectedAccountId) {
			toast.error("Please select an account");
			return;
		}
		setSubmitting(true);
		try {
			const res = await apiFetch("/api/v1/valuations", {
				method: "POST",
				body: JSON.stringify({
					accountId: selectedAccountId,
					date: data.date,
					valuePaise,
				}),
			});
			if (!res.ok) {
				const j = (await res.json()) as { message?: string };
				toast.error(j.message ?? "Failed to add valuation");
				return;
			}
			toast.success("Valuation added");
			reset({
				date: new Date().toISOString().slice(0, 10),
			});
			mutate((key: unknown) => {
				if (typeof key === "string") return key.includes("history");
				if (Array.isArray(key))
					return key[0] === "all-val-histories" || key[0] === "all-histories";
				return false;
			});
			mutate("/api/v1/accounts");
			mutate("/api/v1/portfolio/performance");
		} catch {
			toast.error("Failed to add valuation");
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
						href="/valuations"
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
					<h1 className="text-2xl font-bold text-slate-800">Add Valuation</h1>
				</div>
				<div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
					<p className="text-slate-500">No accounts found.</p>
					<p className="text-sm text-slate-400 mt-1">
						Create an account first before adding valuations.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Link
					href="/valuations"
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
				<h1 className="text-2xl font-bold text-slate-800">Add Valuation</h1>
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

				{/* Form + recent valuations */}
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
										d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
									/>
								</svg>
								<p className="mt-2 text-sm text-slate-400">
									Select an account from the left to begin
								</p>
							</div>
						</div>
					) : (
						<>
							<form
								onSubmit={handleSubmit(onSubmit)}
								className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
							>
								<h2 className="font-semibold text-slate-800">New Valuation</h2>
								<div className="grid gap-5 sm:grid-cols-2">
									<div>
										<label
											className="block text-sm font-medium text-slate-600 mb-1.5"
											htmlFor="val-date"
										>
											Date
										</label>
										<input
											id="val-date"
											type="date"
											className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
											{...register("date", { required: true })}
										/>
									</div>
									<div>
										<label
											className="block text-sm font-medium text-slate-600 mb-1.5"
											htmlFor="val-amount"
										>
											Current Value (INR)
										</label>
										<input
											id="val-amount"
											type="number"
											step="0.01"
											min="0"
											className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
											{...register("valueInr", {
												required: true,
												min: 0,
											})}
										/>
										{errors.valueInr && (
											<p className="mt-1 text-xs text-red-500">
												Value must be &ge; 0
											</p>
										)}
									</div>
								</div>
								<div className="flex items-center gap-3 pt-1">
									<button
										type="submit"
										disabled={submitting}
										className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
									>
										{submitting ? "Adding\u2026" : "Add Valuation"}
									</button>
									<Link
										href="/valuations"
										className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
									>
										Cancel
									</Link>
								</div>
							</form>

							<div className="rounded-xl border border-slate-200 bg-white shadow-sm">
								<div className="border-b border-slate-200 px-5 py-3">
									<h2 className="font-semibold text-slate-700 text-sm">
										Recent Valuations &mdash;{" "}
										{accounts.find((a) => a.id === selectedAccountId)?.name}
									</h2>
								</div>
								{accountValuations.length === 0 ? (
									<div className="px-5 py-8 text-center">
										<p className="text-sm text-slate-400">
											No valuations for this account yet.
										</p>
									</div>
								) : (
									<div className="divide-y divide-slate-100">
										{accountValuations.map((v, i) => (
											<div
												key={`${v.date}-${i}`}
												className="flex items-center justify-between px-5 py-3"
											>
												<div className="flex items-center gap-3">
													<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
														&#x2139;
													</span>
													<div>
														<p className="text-sm font-medium text-slate-700">
															Valuation
														</p>
														<p className="text-xs text-slate-400">{v.date}</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-sm font-semibold text-indigo-600">
														{formatInr(v.amountOrValuePaise)}
													</p>
													{v.description && (
														<p className="text-xs text-slate-400 truncate max-w-[150px]">
															{v.description}
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

export default function AddValuationPage() {
	return (
		<RequireAuth>
			<AddValuationContent />
		</RequireAuth>
	);
}
