"use client";

import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SetupPage() {
	const { configured, isLoading } = useAuth();
	const router = useRouter();
	const [passphrase, setPassphrase] = useState("");
	const [confirm, setConfirm] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!isLoading && configured) {
			router.replace("/login");
		}
	}, [configured, isLoading, router]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (passphrase.length < 8) {
			toast.error("Passphrase must be at least 8 characters");
			return;
		}
		if (passphrase !== confirm) {
			toast.error("Passphrases do not match");
			return;
		}
		setSubmitting(true);
		try {
			const res = await apiFetch("/api/v1/auth/setup", {
				method: "POST",
				body: JSON.stringify({ passphrase }),
			});
			const data = (await res.json()) as {
				ok?: boolean;
				code?: string;
				message?: string;
			};
			if (!res.ok) {
				toast.error(data.message ?? "Setup failed");
				return;
			}
			toast.success("Passphrase set. Sign in to continue.");
			router.replace("/login");
			router.refresh();
		} catch {
			toast.error("Setup failed");
		} finally {
			setSubmitting(false);
		}
	}

	if (isLoading || configured) {
		return (
			<main className="flex min-h-screen items-center justify-center">
				<p className="text-gray-500">Loading…</p>
			</main>
		);
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4">
			<div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow">
				<h1 className="mb-4 text-xl font-semibold">Set up passphrase</h1>
				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<label className="text-sm text-gray-600" htmlFor="passphrase">
						Passphrase (min 8 characters)
					</label>
					<input
						id="passphrase"
						type="password"
						value={passphrase}
						onChange={(e) => setPassphrase(e.target.value)}
						className="rounded border px-3 py-2"
						placeholder="Choose a passphrase"
						autoComplete="new-password"
						disabled={submitting}
					/>
					<label className="text-sm text-gray-600" htmlFor="confirm">
						Confirm passphrase
					</label>
					<input
						id="confirm"
						type="password"
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						className="rounded border px-3 py-2"
						placeholder="Confirm passphrase"
						autoComplete="new-password"
						disabled={submitting}
					/>
					<button
						type="submit"
						className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
						disabled={submitting}
					>
						{submitting ? "Setting up…" : "Set passphrase"}
					</button>
				</form>
			</div>
		</main>
	);
}
