"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Home() {
	const { configured, authenticated, isLoading } = useAuth();

	useEffect(() => {
		if (isLoading) return;
		if (authenticated) {
			window.location.href = "/dashboard";
			return;
		}
		if (configured) {
			window.location.href = "/login";
			return;
		}
		window.location.href = "/setup";
	}, [configured, authenticated, isLoading]);

	return (
		<main className="flex min-h-screen items-center justify-center">
			<p className="text-gray-500">Loading…</p>
		</main>
	);
}
