"use client";

import type { AccountListItem } from "@/types/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

interface Props {
	accounts: AccountListItem[];
}

export function AccountDateFilter({ accounts }: Props) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedIds =
		searchParams.get("accountIds")?.split(",").filter(Boolean) ?? [];
	const dateFrom = searchParams.get("from") ?? "";
	const dateTo = searchParams.get("to") ?? "";

	function updateParam(key: string, value: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		router.push(`?${params.toString()}`, { scroll: false });
	}

	function toggleAccount(id: string) {
		const next = selectedIds.includes(id)
			? selectedIds.filter((x) => x !== id)
			: [...selectedIds, id];
		const params = new URLSearchParams(searchParams.toString());
		if (next.length > 0) {
			params.set("accountIds", next.join(","));
		} else {
			params.delete("accountIds");
		}
		router.push(`?${params.toString()}`, { scroll: false });
	}

	function clearAll() {
		router.push("?", { scroll: false });
	}

	const hasFilters = selectedIds.length > 0 || dateFrom || dateTo;

	return (
		<div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
			<div className="relative" ref={dropdownRef}>
				<button
					type="button"
					onClick={() => setDropdownOpen((o) => !o)}
					className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
				>
					{selectedIds.length > 0
						? `${selectedIds.length} account${selectedIds.length > 1 ? "s" : ""}`
						: "All accounts"}
					<svg
						className="h-3.5 w-3.5 text-slate-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<title>Toggle</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
				{dropdownOpen && (
					<div className="absolute left-0 top-full z-20 mt-1 min-w-[220px] rounded-xl border border-slate-200 bg-white shadow-xl">
						<div className="max-h-56 overflow-y-auto p-1.5">
							{accounts.map((a) => (
								<label
									key={a.id}
									className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-50 transition-colors"
								>
									<input
										type="checkbox"
										checked={selectedIds.includes(a.id)}
										onChange={() => toggleAccount(a.id)}
										className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
									/>
									<span className="text-sm text-slate-700">{a.name}</span>
									<span className="ml-auto text-xs capitalize text-slate-400">
										{a.type.replace(/_/g, " ")}
									</span>
								</label>
							))}
							{accounts.length === 0 && (
								<p className="px-2 py-2 text-sm text-slate-400">No accounts</p>
							)}
						</div>
						<div className="border-t border-slate-100 p-1.5">
							<button
								type="button"
								onClick={() => {
									const params = new URLSearchParams(searchParams.toString());
									params.delete("accountIds");
									router.push(`?${params.toString()}`, { scroll: false });
									setDropdownOpen(false);
								}}
								className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
							>
								Clear selection
							</button>
						</div>
					</div>
				)}
			</div>

			<div className="flex items-center gap-1.5">
				<label
					htmlFor="filter-date-from"
					className="text-xs font-medium text-slate-500"
				>
					From
				</label>
				<input
					id="filter-date-from"
					type="date"
					value={dateFrom}
					onChange={(e) => updateParam("from", e.target.value)}
					className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors"
				/>
			</div>

			<div className="flex items-center gap-1.5">
				<label
					htmlFor="filter-date-to"
					className="text-xs font-medium text-slate-500"
				>
					To
				</label>
				<input
					id="filter-date-to"
					type="date"
					value={dateTo}
					onChange={(e) => updateParam("to", e.target.value)}
					className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors"
				/>
			</div>

			{hasFilters && (
				<button
					type="button"
					onClick={clearAll}
					className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
				>
					Clear filters
				</button>
			)}
		</div>
	);
}
