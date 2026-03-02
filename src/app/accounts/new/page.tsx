"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { apiFetch } from "@/lib/api";
import { ACCOUNT_TYPES, type AccountType } from "@/types/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormData = {
	type: AccountType;
	name: string;
	description: string;
	initialBalancePaise: number;
};

function toPaise(inr: number): number {
	return Math.round(inr * 100);
}

function AddAccountForm() {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			type: "bank_deposit",
			description: "",
			initialBalancePaise: 0,
		},
	});

	async function onSubmit(data: FormData) {
		const initialBalancePaise = toPaise(Number(data.initialBalancePaise));
		if (initialBalancePaise < 0) {
			toast.error("Initial balance must be ≥ 0");
			return;
		}
		setSubmitting(true);
		try {
			const res = await apiFetch("/api/v1/accounts", {
				method: "POST",
				body: JSON.stringify({
					type: data.type,
					name: data.name.trim(),
					description: data.description.trim() || null,
					initialBalancePaise,
				}),
			});
			if (!res.ok) {
				const j = (await res.json()) as { message?: string };
				toast.error(j.message ?? "Failed to create account");
				return;
			}
			toast.success("Account created");
			router.push("/accounts");
			router.refresh();
		} catch {
			toast.error("Failed to create account");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="max-w-md space-y-4">
			<h1 className="text-2xl font-semibold">Add account</h1>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm"
			>
				<div>
					<label className="block text-sm text-gray-600" htmlFor="type">
						Type
					</label>
					<select
						id="type"
						className="mt-1 w-full rounded border px-3 py-2"
						{...register("type", { required: true })}
					>
						{ACCOUNT_TYPES.map((t) => (
							<option key={t} value={t}>
								{t.replace(/_/g, " ")}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="block text-sm text-gray-600" htmlFor="name">
						Name *
					</label>
					<input
						id="name"
						type="text"
						className="mt-1 w-full rounded border px-3 py-2"
						placeholder="Account name"
						maxLength={100}
						{...register("name", {
							required: "Name is required",
							maxLength: 100,
						})}
					/>
					{errors.name && (
						<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
					)}
				</div>
				<div>
					<label className="block text-sm text-gray-600" htmlFor="description">
						Description
					</label>
					<input
						id="description"
						type="text"
						className="mt-1 w-full rounded border px-3 py-2"
						placeholder="Optional"
						{...register("description")}
					/>
				</div>
				<div>
					<label
						className="block text-sm text-gray-600"
						htmlFor="initialBalancePaise"
					>
						Initial balance (₹)
					</label>
					<input
						id="initialBalancePaise"
						type="number"
						step="0.01"
						min="0"
						className="mt-1 w-full rounded border px-3 py-2"
						placeholder="0"
						{...register("initialBalancePaise", { required: true, min: 0 })}
					/>
					{errors.initialBalancePaise && (
						<p className="mt-1 text-sm text-red-600">Must be ≥ 0</p>
					)}
				</div>
				<div className="flex gap-2">
					<button
						type="submit"
						className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
						disabled={submitting}
					>
						{submitting ? "Creating…" : "Create"}
					</button>
					<Link
						href="/accounts"
						className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
					>
						Cancel
					</Link>
				</div>
			</form>
		</div>
	);
}

export default function NewAccountPage() {
	return (
		<RequireAuth>
			<AddAccountForm />
		</RequireAuth>
	);
}
