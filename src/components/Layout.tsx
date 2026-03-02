"use client";

import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Layout({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	async function handleLogout() {
		await apiFetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
		router.push("/login");
		router.refresh();
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="border-b bg-white px-4 py-3 shadow-sm">
				<div className="mx-auto flex max-w-6xl items-center justify-between">
					<nav className="flex gap-4">
						<Link
							href="/dashboard"
							className="text-gray-700 hover:text-gray-900 underline"
						>
							Dashboard
						</Link>
						<Link
							href="/accounts"
							className="text-gray-700 hover:text-gray-900 underline"
						>
							Accounts
						</Link>
						<Link
							href="/transactions"
							className="text-gray-700 hover:text-gray-900 underline"
						>
							Add Transaction
						</Link>
						<Link
							href="/valuations"
							className="text-gray-700 hover:text-gray-900 underline"
						>
							Add Valuation
						</Link>
					</nav>
					<button
						type="button"
						onClick={handleLogout}
						className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
					>
						Logout
					</button>
				</div>
			</header>
			<main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
		</div>
	);
}
