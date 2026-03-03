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
	expectedRatePercent?: number | null;
	expectedMonthlyInvestInr?: number | null;
};

type EmploymentFormData = {
	employerName: string;
	basicSalaryInr: number | undefined;
	vpfAmountInr: number | undefined;
	joiningDate: string;
};

export default function EditAccountPage() {
	const params = useParams();
	const id = params.id as string;
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const [accountType, setAccountType] = useState<AccountType | null>(null);

	const {
		register: registerEmployment,
		handleSubmit: handleSubmitEmployment,
		reset: resetEmployment,
		watch: watchEmployment,
		formState: { isSubmitting: employmentSubmitting },
	} = useForm<EmploymentFormData>();

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
					expectedRatePercent?: number | null;
					expectedMonthlyInvestPaise?: number | null;
				};
				if (!cancelled) {
					const t = data.type as AccountType;
					setAccountType(t);
					setValue("type", t);
					setValue("name", data.name);
					setValue("description", data.description ?? "");
					if (data.expectedRatePercent != null) {
						setValue("expectedRatePercent", data.expectedRatePercent);
					}
					if (data.expectedMonthlyInvestPaise != null) {
						setValue(
							"expectedMonthlyInvestInr",
							data.expectedMonthlyInvestPaise / 100,
						);
					}
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

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!accountType || accountType !== "gratuity") return;
			try {
				const res = await apiFetch(
					`/api/v1/employment-info/${encodeURIComponent(id)}`,
				);
				if (!res.ok) return;
				const info = (await res.json()) as {
					employerName: string | null;
					basicSalaryInr: number | null;
					vpfAmountInr: number | null;
					joiningDate: string | null;
				};
				if (cancelled) return;
				resetEmployment({
					employerName: info.employerName ?? "",
					basicSalaryInr: info.basicSalaryInr ?? undefined,
					vpfAmountInr: info.vpfAmountInr ?? undefined,
					joiningDate: info.joiningDate ?? "",
				});
			} catch {
				if (!cancelled) {
					toast.error("Failed to load employment info");
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [accountType, id, resetEmployment]);

	async function onSubmit(data: FormData) {
		setSubmitting(true);
		try {
			const expectedMonthlyPaise =
				data.expectedMonthlyInvestInr != null
					? Math.round(Number(data.expectedMonthlyInvestInr) * 100)
					: null;
			const res = await apiFetch(`/api/v1/accounts/${id}`, {
				method: "PATCH",
				body: JSON.stringify({
					type: data.type,
					name: data.name.trim(),
					description: data.description.trim() || null,
					expectedRatePercent:
						data.expectedRatePercent != null
							? Number(data.expectedRatePercent)
							: null,
					expectedMonthlyInvestPaise: expectedMonthlyPaise,
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

	async function onSubmitEmployment(data: EmploymentFormData) {
		if (accountType !== "gratuity") return;
		try {
			const res = await apiFetch(
				`/api/v1/employment-info/${encodeURIComponent(id)}`,
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

	const employmentBasic = watchEmployment("basicSalaryInr");
	const employmentVpf = watchEmployment("vpfAmountInr");
	const projectedMonthlyEpf = (() => {
		const basic = Number(employmentBasic) || 0;
		const vpf = Number(employmentVpf) || 0;
		if (basic <= 0 && vpf <= 0) return null;
		// Round the 12% employee contribution first, then derive totals
		const roundedTwelvePercent = Math.round(0.12 * basic);
		const totalEpf = roundedTwelvePercent * 2 + vpf - 1250;
		return totalEpf;
	})();

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
					<div>
						<label
							className="block text-sm text-gray-600"
							htmlFor="expectedRatePercent"
						>
							Expected rate of return (% p.a.)
						</label>
						<input
							id="expectedRatePercent"
							type="number"
							step="0.01"
							min="0"
							className="mt-1 w-full rounded border px-3 py-2"
							{...register("expectedRatePercent")}
						/>
					</div>
					<div>
						<label
							className="block text-sm text-gray-600"
							htmlFor="expectedMonthlyInvestInr"
						>
							Expected monthly investment (₹)
						</label>
						<input
							id="expectedMonthlyInvestInr"
							type="number"
							step="0.01"
							min="0"
							className="mt-1 w-full rounded border px-3 py-2"
							{...register("expectedMonthlyInvestInr")}
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

				{accountType === "gratuity" && (
					<form
						onSubmit={handleSubmitEmployment(onSubmitEmployment)}
						className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm"
					>
						<h2 className="text-lg font-semibold">Employment info</h2>
						<p className="text-sm text-gray-600">
							Used for gratuity calculations for this account. Updating these
							values will influence future gratuity suggestions.
						</p>
						<div>
							<label
								className="block text-sm text-gray-600"
								htmlFor="employerName"
							>
								Employer name
							</label>
							<input
								id="employerName"
								type="text"
								className="mt-1 w-full rounded border px-3 py-2"
								{...registerEmployment("employerName")}
							/>
						</div>
						<div>
							<label
								className="block text-sm text-gray-600"
								htmlFor="basicSalaryInr"
							>
								Current basic salary (INR)
							</label>
							<input
								id="basicSalaryInr"
								type="number"
								step="0.01"
								min="0"
								className="mt-1 w-full rounded border px-3 py-2"
								{...registerEmployment("basicSalaryInr")}
							/>
						</div>
						<div>
							<label
								className="block text-sm text-gray-600"
								htmlFor="vpfAmountInr"
							>
								VPF amount (INR)
							</label>
							<input
								id="vpfAmountInr"
								type="number"
								step="0.01"
								min="0"
								className="mt-1 w-full rounded border px-3 py-2"
								{...registerEmployment("vpfAmountInr")}
							/>
						</div>
						{projectedMonthlyEpf !== null && projectedMonthlyEpf > 0 && (
							<p className="text-xs text-gray-600">
								Projected monthly EPF contribution: ₹
								{projectedMonthlyEpf.toFixed(2)}
							</p>
						)}
						<div>
							<label
								className="block text-sm text-gray-600"
								htmlFor="joiningDate"
							>
								Joining date
							</label>
							<input
								id="joiningDate"
								type="date"
								className="mt-1 w-full rounded border px-3 py-2"
								{...registerEmployment("joiningDate")}
							/>
						</div>
						<button
							type="submit"
							className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
							disabled={employmentSubmitting}
						>
							{employmentSubmitting ? "Saving…" : "Save employment info"}
						</button>
					</form>
				)}

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
