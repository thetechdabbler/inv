"use client";

import { PageTransition } from "@/components/PageTransition";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, apiJson } from "@/lib/api";
import { TYPE_COLORS } from "@/lib/constants";
import { formatDate, formatInr, paiseToInr } from "@/lib/format";
import type {
	AccountHistoryResponse,
	AccountListItem,
	AccountsResponse,
} from "@/types/api";
import { ArrowLeft, Scale } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

type FormData = {
	date: string;
	valueInr: number;
	basicSalaryInr?: number;
	joiningDate?: string;
};

function toPaise(inr: number): number {
	return Math.round(inr * 100);
}

function AddValuationContent() {
	const searchParams = useSearchParams();
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

	const accountValuations = (historyData?.entries ?? []).filter(
		(e) => e.type === "valuation",
	);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			date: new Date().toISOString().slice(0, 10),
			valueInr: undefined as unknown as number,
			basicSalaryInr: undefined,
			joiningDate: undefined,
		},
	});

	const selectedAccount = useMemo(
		() => accounts.find((a) => a.id === selectedId) ?? null,
		[accounts, selectedId],
	);

	const watchDate = watch("date");
	const watchBasicSalary = watch("basicSalaryInr");
	const watchJoiningDate = watch("joiningDate");

	// Prefill gratuity helpers from employment info when available
	useEffect(() => {
		if (!selectedAccount || selectedAccount.type !== "gratuity") return;
		if (!selectedId) return;
		(async () => {
			try {
				const res = await apiFetch(
					`/api/v1/employment-info/${encodeURIComponent(selectedId)}`,
				);
				if (!res.ok) return;
				const info = (await res.json()) as {
					basicSalaryInr: number | null;
					joiningDate: string | null;
				};
				if (
					info.basicSalaryInr != null &&
					Number.isFinite(info.basicSalaryInr)
				) {
					setValue("basicSalaryInr", info.basicSalaryInr, {
						shouldDirty: false,
					});
				}
				if (info.joiningDate) {
					setValue("joiningDate", info.joiningDate, { shouldDirty: false });
				}
			} catch {
				// ignore fetch errors; form remains usable
			}
		})();
	}, [selectedAccount, selectedId, setValue]);

	// Pre-fill last used gratuity helper inputs per account
	useEffect(() => {
		if (!selectedAccount || selectedAccount.type !== "gratuity") return;
		if (typeof window === "undefined") return;
		const key = `gratuity-prefill:${selectedAccount.id}`;
		const raw = window.localStorage.getItem(key);
		if (!raw) return;
		try {
			const parsed = JSON.parse(raw) as {
				basicSalaryInr?: number;
				joiningDate?: string;
			};
			if (
				parsed.basicSalaryInr != null &&
				Number.isFinite(parsed.basicSalaryInr)
			) {
				setValue("basicSalaryInr", parsed.basicSalaryInr, {
					shouldDirty: false,
				});
			}
			if (parsed.joiningDate) {
				setValue("joiningDate", parsed.joiningDate, { shouldDirty: false });
			}
		} catch {
			// Ignore malformed localStorage
		}
	}, [selectedAccount, setValue]);

	useEffect(() => {
		if (!selectedAccount || selectedAccount.type !== "gratuity") return;
		if (!watchDate || !watchJoiningDate) return;
		const basicSalary = Number(watchBasicSalary);
		if (!Number.isFinite(basicSalary) || basicSalary <= 0) return;
		const join = new Date(watchJoiningDate);
		const asOf = new Date(watchDate);
		if (Number.isNaN(join.getTime()) || Number.isNaN(asOf.getTime())) return;
		const diffMs = asOf.getTime() - join.getTime();
		if (diffMs <= 0) return;
		const yearsFloat = diffMs / (365.25 * 24 * 60 * 60 * 1000);
		const years = Math.round(yearsFloat);
		if (years <= 0) return;

		// Gratuity formula aligned with backend helper: 15/26 * basic * years of service (rounded to nearest year)
		const gratuity = (15 / 26) * basicSalary * years;
		if (!Number.isFinite(gratuity) || gratuity <= 0) return;

		setValue("valueInr", Number(gratuity.toFixed(2)), {
			shouldValidate: true,
			shouldDirty: true,
		});
	}, [
		selectedAccount,
		watchDate,
		watchBasicSalary,
		watchJoiningDate,
		setValue,
	]);

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
			// Optionally update employment info when gratuity helpers are present
			if (
				selectedAccount?.type === "gratuity" &&
				(data.basicSalaryInr != null || data.joiningDate)
			) {
				try {
					await apiFetch(
						`/api/v1/employment-info/${encodeURIComponent(selectedAccountId)}`,
						{
							method: "PUT",
							body: JSON.stringify({
								basicSalaryInr:
									data.basicSalaryInr != null
										? Number(data.basicSalaryInr)
										: null,
								joiningDate: data.joiningDate || null,
							}),
						},
					);
				} catch {
					// do not block valuation on employment-info failure
				}
			}
			// Remember last gratuity helpers for this account
			if (
				selectedAccount?.type === "gratuity" &&
				typeof window !== "undefined"
			) {
				const key = `gratuity-prefill:${selectedAccount.id}`;
				const payload = {
					basicSalaryInr:
						data.basicSalaryInr != null
							? Number(data.basicSalaryInr)
							: undefined,
					joiningDate: data.joiningDate || undefined,
				};
				try {
					window.localStorage.setItem(key, JSON.stringify(payload));
				} catch {
					// Ignore storage errors
				}
			}
			toast.success("Valuation added");
			reset({
				date: new Date().toISOString().slice(0, 10),
				valueInr: undefined as unknown as number,
				basicSalaryInr: undefined,
				joiningDate: undefined,
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
						<Link href="/valuations">
							<ArrowLeft className="h-4 w-4" />
							Back
						</Link>
					</Button>
					<h1 className="text-2xl font-bold text-foreground">Add Valuation</h1>
				</div>
				<Card className="border-dashed border-2">
					<CardContent className="p-10 text-center">
						<p className="text-muted-foreground">No accounts found.</p>
						<p className="text-sm text-muted-foreground/70 mt-1">
							Create an account first before adding valuations.
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
					<Link href="/valuations">
						<ArrowLeft className="h-4 w-4" />
						Back
					</Link>
				</Button>
				<h1 className="text-2xl font-bold text-foreground">Add Valuation</h1>
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
									<Scale className="mx-auto h-10 w-10 text-muted-foreground/30" />
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
											New Valuation
										</h2>
										<div className="grid gap-5 sm:grid-cols-2">
											<div>
												<label
													className="block text-sm font-medium text-foreground mb-1.5"
													htmlFor="val-date"
												>
													Date
												</label>
												<Input
													id="val-date"
													type="date"
													{...register("date", { required: true })}
												/>
											</div>
											<div>
												<label
													className="block text-sm font-medium text-foreground mb-1.5"
													htmlFor="val-amount"
												>
													Current Value (INR)
												</label>
												<Input
													id="val-amount"
													type="number"
													step="0.01"
													min="0"
													{...register("valueInr", {
														required: true,
														min: 0,
													})}
												/>
												{errors.valueInr && (
													<p className="mt-1 text-xs text-destructive">
														Value must be &ge; 0
													</p>
												)}
												{selectedAccount?.type === "gratuity" && (
													<p className="mt-1 text-xs text-muted-foreground">
														For gratuity accounts, value is typically based on
														current basic salary and years of service; you can
														use the helper fields below to auto-calculate and
														adjust if needed.
													</p>
												)}
											</div>
										</div>
										{selectedAccount?.type === "gratuity" && (
											<div className="grid gap-5 sm:grid-cols-2 border-t pt-4 mt-2">
												<div>
													<label
														className="block text-sm font-medium text-foreground mb-1.5"
														htmlFor="basic-salary"
													>
														Current Basic Salary (INR)
													</label>
													<Input
														id="basic-salary"
														type="number"
														step="0.01"
														min="0"
														{...register("basicSalaryInr", {
															min: 0,
														})}
													/>
												</div>
												<div>
													<label
														className="block text-sm font-medium text-foreground mb-1.5"
														htmlFor="joining-date"
													>
														Joining Date
													</label>
													<Input
														id="joining-date"
														type="date"
														{...register("joiningDate")}
													/>
												</div>
											</div>
										)}
										<div className="flex items-center gap-3 pt-1">
											<Button type="submit" disabled={submitting}>
												{submitting ? "Adding\u2026" : "Add Valuation"}
											</Button>
											<Button variant="ghost" asChild>
												<Link href="/valuations">Cancel</Link>
											</Button>
										</div>
									</form>
								</CardContent>
							</Card>

							<Card>
								<div className="border-b px-5 py-3">
									<h2 className="font-semibold text-foreground text-sm">
										Recent Valuations &mdash;{" "}
										{accounts.find((a) => a.id === selectedAccountId)?.name}
									</h2>
								</div>
								{accountValuations.length === 0 ? (
									<CardContent className="py-8 text-center">
										<p className="text-sm text-muted-foreground">
											No valuations for this account yet.
										</p>
									</CardContent>
								) : (
									<div className="divide-y">
										{accountValuations.map((v, i) => (
											<div
												key={`${v.date}-${i}`}
												className="flex items-center justify-between px-5 py-3"
											>
												<div className="flex items-center gap-3">
													<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
														&#x2139;
													</span>
													<div>
														<p className="text-sm font-medium text-foreground">
															Valuation
														</p>
														<p className="text-xs text-muted-foreground">
															{formatDate(v.date)}
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-sm font-semibold text-primary">
														{formatInr(v.amountOrValuePaise)}
													</p>
													{v.description && (
														<p className="text-xs text-muted-foreground truncate max-w-[150px]">
															{v.description}
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

export default function AddValuationPage() {
	return (
		<RequireAuth>
			<AddValuationContent />
		</RequireAuth>
	);
}
