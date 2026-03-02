"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { apiFetch, apiJson } from "@/lib/api";
import type { AccountsResponse } from "@/types/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";

type FormData = {
	accountId: string;
	date: string;
	valuePaise: number;
};

function toPaise(inr: number): number {
	return Math.round(inr * 100);
}

function ValuationForm() {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);

  const { data: accountsData } = useSWR<AccountsResponse>(
    "/api/v1/accounts",
    (url: string) => apiJson<AccountsResponse>(url),
  );
	const accounts = accountsData?.accounts ?? [];

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			date: new Date().toISOString().slice(0, 10),
		},
	});

	async function onSubmit(data: FormData) {
		const valuePaise = toPaise(Number(data.valuePaise));
		if (valuePaise < 0) {
			toast.error("Value must be ≥ 0");
			return;
		}
		setSubmitting(true);
		try {
			const res = await apiFetch("/api/v1/valuations", {
				method: "POST",
				body: JSON.stringify({
					accountId: data.accountId,
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
			router.push("/dashboard");
			router.refresh();
		} catch {
			toast.error("Failed to add valuation");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="max-w-md space-y-4">
			<h1 className="text-2xl font-semibold">Add valuation</h1>
			{accounts.length === 0 ? (
				<p className="text-gray-500">
					Create an account first.{" "}
					<Link href="/accounts/new" className="underline">
						Add account
					</Link>
				</p>
			) : (
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm"
				>
					<div>
						<label className="block text-sm text-gray-600" htmlFor="accountId">
							Account *
						</label>
						<select
							id="accountId"
							className="mt-1 w-full rounded border px-3 py-2"
							{...register("accountId", { required: "Select an account" })}
						>
							<option value="">Select account</option>
							{accounts.map((a) => (
								<option key={a.id} value={a.id}>
									{a.name} ({a.type})
								</option>
							))}
						</select>
						{errors.accountId && (
							<p className="mt-1 text-sm text-red-600">
								{errors.accountId.message}
							</p>
						)}
					</div>
					<div>
						<label className="block text-sm text-gray-600" htmlFor="date">
							Date *
						</label>
						<input
							id="date"
							type="date"
							className="mt-1 w-full rounded border px-3 py-2"
							{...register("date", { required: true })}
						/>
					</div>
					<div>
						<label className="block text-sm text-gray-600" htmlFor="valuePaise">
							Current value (₹) *
						</label>
						<input
							id="valuePaise"
							type="number"
							step="0.01"
							min="0"
							className="mt-1 w-full rounded border px-3 py-2"
							{...register("valuePaise", { required: true, min: 0 })}
						/>
						{errors.valuePaise && (
							<p className="mt-1 text-sm text-red-600">Value must be ≥ 0</p>
						)}
					</div>
					<div className="flex gap-2">
						<button
							type="submit"
							className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
							disabled={submitting}
						>
							{submitting ? "Adding…" : "Add valuation"}
						</button>
						<Link
							href="/dashboard"
							className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
						>
							Cancel
						</Link>
					</div>
				</form>
			)}
		</div>
	);
}

export default function ValuationsPage() {
	return (
		<RequireAuth>
			<ValuationForm />
		</RequireAuth>
	);
}
