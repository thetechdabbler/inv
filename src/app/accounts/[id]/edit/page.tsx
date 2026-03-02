"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { apiFetch } from "@/lib/api";
import { ACCOUNT_TYPES, type AccountType } from "@/types/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormData = {
	type: AccountType;
	name: string;
	description: string;
};

export default function EditAccountPage() {
	const params = useParams();
	const id = params.id as string;
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<FormData>();

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await apiFetch(`/api/v1/accounts/${id}`);
				if (!res.ok) {
					if (res.status === 404) router.replace("/accounts");
					return;
				}
				const data = (await res.json()) as {
					type: string;
					name: string;
					description: string | null;
				};
				if (!cancelled) {
					setValue("type", data.type as AccountType);
					setValue("name", data.name);
					setValue("description", data.description ?? "");
				}
			} catch {
				if (!cancelled) toast.error("Failed to load account");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [id, setValue, router]);

	async function onSubmit(data: FormData) {
		setSubmitting(true);
		try {
			const res = await apiFetch(`/api/v1/accounts/${id}`, {
				method: "PATCH",
				body: JSON.stringify({
					type: data.type,
					name: data.name.trim(),
					description: data.description.trim() || null,
				}),
			});
			if (!res.ok) {
				const j = (await res.json()) as { message?: string };
				toast.error(j.message ?? "Update failed");
				return;
			}
			toast.success("Account updated");
			router.push("/accounts");
			router.refresh();
		} catch {
			toast.error("Update failed");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete() {
		if (!deleteConfirm) {
			setDeleteConfirm(true);
			return;
		}
		setSubmitting(true);
		try {
			const res = await apiFetch(`/api/v1/accounts/${id}?confirm=true`, {
				method: "DELETE",
			});
			if (!res.ok) {
				toast.error("Delete failed");
				return;
			}
			toast.success("Account deleted");
			router.push("/accounts");
			router.refresh();
		} catch {
			toast.error("Delete failed");
		} finally {
			setSubmitting(false);
			setDeleteConfirm(false);
		}
	}

	if (loading) {
		return (
			<RequireAuth>
				<p className="text-gray-500">Loading…</p>
			</RequireAuth>
		);
	}

	return (
		<RequireAuth>
			<div className="max-w-md space-y-4">
				<h1 className="text-2xl font-semibold">Edit account</h1>
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
						<label
							className="block text-sm text-gray-600"
							htmlFor="description"
						>
							Description
						</label>
						<input
							id="description"
							type="text"
							className="mt-1 w-full rounded border px-3 py-2"
							{...register("description")}
						/>
					</div>
					<div className="flex gap-2">
						<button
							type="submit"
							className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
							disabled={submitting}
						>
							{submitting ? "Saving…" : "Save"}
						</button>
						<Link
							href="/accounts"
							className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
						>
							Cancel
						</Link>
					</div>
				</form>

				<div className="rounded-lg border border-red-200 bg-red-50 p-4">
					<h2 className="font-medium text-red-800">Delete account</h2>
					<p className="mt-1 text-sm text-red-700">
						This will delete the account and all related transactions and
						valuations.
					</p>
					{deleteConfirm ? (
						<div className="mt-3 flex gap-2">
							<button
								type="button"
								onClick={handleDelete}
								className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
								disabled={submitting}
							>
								Confirm delete
							</button>
							<button
								type="button"
								onClick={() => setDeleteConfirm(false)}
								className="rounded border border-red-300 px-3 py-1 text-red-700 hover:bg-red-100"
							>
								Cancel
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setDeleteConfirm(true)}
							className="mt-2 rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-100"
						>
							Delete account
						</button>
					)}
				</div>
			</div>
		</RequireAuth>
	);
}
