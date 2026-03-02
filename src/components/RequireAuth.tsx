"use client";

import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
	const { configured, authenticated, isLoading } = useAuth();

	useEffect(() => {
		if (isLoading) return;
		if (!configured || !authenticated) {
			window.location.href = "/login";
		}
	}, [configured, authenticated, isLoading]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-gray-500">Loading…</p>
			</div>
		);
	}
	if (!configured || !authenticated) {
		return null;
	}

	return <Layout>{children}</Layout>;
}
