"use client";

import { apiFetch } from "@/lib/api";
import type { AuthStatus } from "@/types/api";
import useSWR from "swr";

async function fetcher(path: string): Promise<AuthStatus> {
	const res = await apiFetch(path);
	const data = (await res.json()) as AuthStatus & { code?: string };
	if (!res.ok)
		throw new Error(
			(data as { message?: string }).message ?? "Auth check failed",
		);
	return data;
}

export function useAuth() {
	const { data, error, isLoading, mutate } = useSWR<AuthStatus>(
		"/auth/status",
		() => fetcher("/api/v1/auth/status"),
		{ revalidateOnFocus: false },
	);
	return {
		configured: data?.configured ?? false,
		authenticated: data?.authenticated ?? false,
		isLoading,
		error,
		mutate,
	};
}
