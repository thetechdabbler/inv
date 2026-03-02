"use client";

import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
	const { configured, authenticated, isLoading } = useAuth();
	const router = useRouter();
	const [passphrase, setPassphrase] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!isLoading && authenticated) {
			router.replace("/dashboard");
			return;
		}
		if (!isLoading && !configured) {
			router.replace("/setup");
		}
	}, [configured, authenticated, isLoading, router]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!passphrase.trim()) {
			toast.error("Enter passphrase");
			return;
		}
		setSubmitting(true);
		try {
			const res = await apiFetch("/api/v1/auth/login", {
				method: "POST",
				body: JSON.stringify({ passphrase: passphrase.trim() }),
			});
			const data = (await res.json()) as {
				ok?: boolean;
				code?: string;
				message?: string;
			};
			if (!res.ok) {
				if (data.code === "NOT_CONFIGURED") {
					router.replace("/setup");
					return;
				}
				toast.error(data.message ?? "Login failed");
				return;
			}
			toast.success("Logged in");
			router.replace("/dashboard");
			router.refresh();
		} catch {
			toast.error("Login failed");
		} finally {
			setSubmitting(false);
		}
	}

	if (isLoading || !configured) {
		return (
			<main className="flex min-h-screen items-center justify-center">
				<p className="text-gray-500">Loading…</p>
			</main>
		);
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4">
			<div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow">
				<h1 className="mb-4 text-xl font-semibold">Investment Tracker</h1>
				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<label className="text-sm text-gray-600" htmlFor="passphrase">
						Passphrase
					</label>
					<input
						id="passphrase"
						type="password"
						value={passphrase}
						onChange={(e) => setPassphrase(e.target.value)}
						className="rounded border px-3 py-2"
						placeholder="Enter passphrase"
						autoComplete="current-password"
						disabled={submitting}
					/>
					<button
						type="submit"
						className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
						disabled={submitting}
					>
						{submitting ? "Signing in…" : "Sign in"}
					</button>
				</form>
				<p className="mt-4 text-center text-sm text-gray-500">
					First time?{" "}
					<Link href="/setup" className="underline">
						Set up passphrase
					</Link>
				</p>
			</div>
		</main>
	);
}
