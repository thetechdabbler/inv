"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { apiJson } from "@/lib/api";
import { formatInr } from "@/lib/format";
import type { AccountsResponse } from "@/types/api";
import Link from "next/link";
import useSWR from "swr";

function AccountsList() {
  const { data, error, isLoading } = useSWR<AccountsResponse>(
    "/api/v1/accounts",
    (url: string) => apiJson<AccountsResponse>(url),
  );

	if (error) {
		return (
			<div className="rounded border border-red-200 bg-red-50 p-4">
				<p className="text-red-700">Failed to load accounts.</p>
			</div>
		);
	}

	if (isLoading || !data) {
		return (
			<div className="space-y-2">
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-14 animate-pulse rounded bg-gray-200" />
				))}
			</div>
		);
	}

	const accounts = data.accounts;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Accounts</h1>
				<Link
					href="/accounts/new"
					className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				>
					Add account
				</Link>
			</div>

			{accounts.length === 0 ? (
				<p className="text-gray-500">No accounts. Create one to get started.</p>
			) : (
				<ul className="space-y-2">
					{accounts.map((a) => (
						<li
							key={a.id}
							className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
						>
							<div>
								<Link
									href={`/accounts/${a.id}/edit`}
									className="font-medium hover:underline"
								>
									{a.name}
								</Link>
								<p className="text-sm capitalize text-gray-500">
									{a.type.replace(/_/g, " ")}
								</p>
							</div>
							<div className="text-right">
								<p className="font-medium">
									{formatInr(a.currentValuePaise ?? a.initialBalancePaise)}
								</p>
								<p className="text-sm text-gray-500">
									Invested: {formatInr(a.totalContributionsPaise ?? 0)}
								</p>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default function AccountsPage() {
	return (
		<RequireAuth>
			<AccountsList />
		</RequireAuth>
	);
}
