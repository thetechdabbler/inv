"use client";

import { PageTransition } from "@/components/PageTransition";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, apiJson } from "@/lib/api";
import type { AccountsResponse } from "@/types/api";
import { Edit, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";

type EmploymentFormData = {
	employerName: string;
	basicSalaryInr: number | undefined;
	vpfAmountInr: number | undefined;
	joiningDate: string;
};

function EmploymentCard({
	accountId,
	name,
}: {
	accountId: string;
	name: string;
}) {
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { isSubmitting },
	} = useForm<EmploymentFormData>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await apiFetch(
					`/api/v1/employment-info/${encodeURIComponent(accountId)}`,
				);
				if (!res.ok) {
					return;
				}
				const data = (await res.json()) as {
					employerName: string | null;
					basicSalaryInr: number | null;
					vpfAmountInr: number | null;
					joiningDate: string | null;
				};
				if (cancelled) return;
				reset({
					employerName: data.employerName ?? "",
					basicSalaryInr: data.basicSalaryInr ?? undefined,
					vpfAmountInr: data.vpfAmountInr ?? undefined,
					joiningDate: data.joiningDate ?? "",
				});
			} catch {
				if (!cancelled) {
					toast.error("Failed to load employment info");
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [accountId, reset]);

	async function onSubmit(data: EmploymentFormData) {
		try {
			const res = await apiFetch(
				`/api/v1/employment-info/${encodeURIComponent(accountId)}`,
				{
					method: "PUT",
					body: JSON.stringify({
						employerName: data.employerName.trim() || null,
						basicSalaryInr:
							data.basicSalaryInr != null
								? Number(data.basicSalaryInr)
								: null,
						vpfAmountInr:
							data.vpfAmountInr != null ? Number(data.vpfAmountInr) : null,
						joiningDate: data.joiningDate || null,
					}),
				},
			);
			if (!res.ok) {
				const j = (await res.json()) as { message?: string };
				toast.error(j.message ?? "Failed to save employment info");
				return;
			}
			toast.success("Employment info saved");
		} catch {
			toast.error("Failed to save employment info");
		}
	}

	const basicSalary = watch("basicSalaryInr");
	const vpfAmount = watch("vpfAmountInr");
	const projectedMonthlyEpf = (() => {
		const basic = Number(basicSalary) || 0;
		const vpf = Number(vpfAmount) || 0;
		if (basic <= 0 && vpf <= 0) return null;
		// Round the 12% employee contribution first, then derive totals
		const roundedTwelvePercent = Math.round(0.12 * basic);
		const totalEpf = roundedTwelvePercent * 2 + vpf - 1250;
		return totalEpf;
	})();

	if (loading) {
		return <Skeleton className="h-40 rounded-xl" />;
	}

	return (
		<Card className="dark:glow-border">
			<CardContent className="p-4 space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-semibold text-foreground">{name}</p>
						<p className="text-xs text-muted-foreground">
							Gratuity employment info
						</p>
					</div>
					<Button asChild variant="ghost" size="icon">
						<Link href={`/accounts/${accountId}/edit`}>
							<Edit className="h-4 w-4" />
						</Link>
					</Button>
				</div>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="grid gap-3 sm:grid-cols-3 sm:items-end"
				>
					<div className="space-y-1">
						<label
							className="block text-xs font-medium text-muted-foreground"
							htmlFor={`employer-${accountId}`}
						>
							Employer name
						</label>
						<Input
							id={`employer-${accountId}`}
							type="text"
							{...register("employerName")}
						/>
					</div>
					<div className="space-y-1">
						<label
							className="block text-xs font-medium text-muted-foreground"
							htmlFor={`salary-${accountId}`}
						>
							Basic salary (INR)
						</label>
						<Input
							id={`salary-${accountId}`}
							type="number"
							step="0.01"
							min="0"
							{...register("basicSalaryInr")}
						/>
					</div>
					<div className="space-y-1">
						<label
							className="block text-xs font-medium text-muted-foreground"
							htmlFor={`vpf-${accountId}`}
						>
							VPF amount (INR)
						</label>
						<Input
							id={`vpf-${accountId}`}
							type="number"
							step="0.01"
							min="0"
							{...register("vpfAmountInr")}
						/>
					</div>
					{projectedMonthlyEpf !== null && projectedMonthlyEpf > 0 && (
						<div className="sm:col-span-3 text-xs text-muted-foreground">
							Projected monthly EPF contribution: ₹
							{projectedMonthlyEpf.toFixed(2)}
						</div>
					)}
					<div className="space-y-1">
						<label
							className="block text-xs font-medium text-muted-foreground"
							htmlFor={`join-${accountId}`}
						>
							Joining date
						</label>
						<Input
							id={`join-${accountId}`}
							type="date"
							{...register("joiningDate")}
						/>
					</div>
					<div className="sm:col-span-3 flex justify-end">
						<Button
							type="submit"
							size="sm"
							className="inline-flex items-center gap-1"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								"Saving…"
							) : (
								<>
									<Save className="h-3.5 w-3.5" />
									Save
								</>
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

function EmploymentContent() {
	const { data, isLoading, error } = useSWR<AccountsResponse>(
		"/api/v1/accounts",
		(url: string) => apiJson<AccountsResponse>(url),
	);

	if (error) {
		return (
			<Card>
				<CardContent className="p-6 text-center">
					<p className="text-destructive font-medium">
						Failed to load accounts.
					</p>
				</CardContent>
			</Card>
		);
	}

	if (isLoading || !data) {
		return (
			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-24 rounded-xl" />
				))}
			</div>
		);
	}

	const gratuityAccounts = data.accounts.filter((a) => a.type === "gratuity");

	return (
		<PageTransition className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Employment info
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage employment details used for gratuity calculations.
					</p>
				</div>
			</div>

			{gratuityAccounts.length === 0 ? (
				<Card className="border-dashed border-2">
					<CardContent className="p-10 text-center">
						<p className="text-muted-foreground">
							No gratuity accounts found. Create a gratuity account first.
						</p>
						<Button asChild className="mt-4" variant="outline" size="sm">
							<Link href="/accounts/new">Add account</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{gratuityAccounts.map((a) => (
						<EmploymentCard key={a.id} accountId={a.id} name={a.name} />
					))}
				</div>
			)}
		</PageTransition>
	);
}

export default function EmploymentPage() {
	return (
		<RequireAuth>
			<EmploymentContent />
		</RequireAuth>
	);
}

