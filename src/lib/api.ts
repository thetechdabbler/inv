/**
 * Base API client for /api/v1. Credentials included for session cookies.
 */

const API_BASE = "/api/v1";

export async function apiFetch(
	path: string,
	options: RequestInit = {},
): Promise<Response> {
	const url = path.startsWith("http")
		? path
		: path.startsWith(API_BASE)
			? path
			: `${API_BASE}${path}`;
	const hasBody = options.body != null;
	return fetch(url, {
		...options,
		credentials: "include",
		headers: {
			...(hasBody ? { "Content-Type": "application/json" } : {}),
			...options.headers,
		},
	});
}

export async function apiJson<T>(
	path: string,
	options?: RequestInit,
): Promise<T> {
	const res = await apiFetch(path, options);
	const data = (await res.json()) as T & { code?: string; message?: string };
	if (!res.ok) {
		throw new Error(
			(data as { message?: string }).message ?? `Request failed: ${res.status}`,
		);
	}
	return data as T;
}
