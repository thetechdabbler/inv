"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AccountListItem } from "@/types/api";
import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
	accounts: AccountListItem[];
}

export function AccountDateFilter({ accounts }: Props) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const closeDropdown = useCallback(() => setDropdownOpen(false), []);

	useEffect(() => {
		if (!dropdownOpen) return;
		function onMouseDown(e: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				closeDropdown();
			}
		}
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") closeDropdown();
		}
		document.addEventListener("mousedown", onMouseDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("mousedown", onMouseDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [dropdownOpen, closeDropdown]);

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
		<Card className="flex flex-wrap items-end gap-3 p-3">
			<div className="relative" ref={dropdownRef}>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setDropdownOpen((o) => !o)}
					className="gap-1.5"
				>
					{selectedIds.length > 0
						? `${selectedIds.length} account${selectedIds.length > 1 ? "s" : ""}`
						: "All accounts"}
					<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
				</Button>
				{dropdownOpen && (
					<div className="absolute left-0 top-full z-20 mt-1 min-w-[220px] rounded-xl border border-border bg-popover shadow-xl dark:dark-elevated-lg">
						<div className="max-h-56 overflow-y-auto p-1.5">
							{accounts.map((a) => (
								<label
									key={a.id}
									className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-accent transition-colors"
								>
									<input
										type="checkbox"
										checked={selectedIds.includes(a.id)}
										onChange={() => toggleAccount(a.id)}
										className="rounded border-input text-primary focus:ring-ring"
									/>
									<span className="text-sm text-foreground">{a.name}</span>
									<span className="ml-auto text-xs capitalize text-muted-foreground">
										{a.type.replace(/_/g, " ")}
									</span>
								</label>
							))}
							{accounts.length === 0 && (
								<p className="px-2 py-2 text-sm text-muted-foreground">
									No accounts
								</p>
							)}
						</div>
						<div className="border-t border-border p-1.5">
							<button
								type="button"
								onClick={() => {
									const params = new URLSearchParams(searchParams.toString());
									params.delete("accountIds");
									router.push(`?${params.toString()}`, { scroll: false });
									setDropdownOpen(false);
								}}
								className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
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
					className="text-xs font-medium text-muted-foreground"
				>
					From
				</label>
				<Input
					id="filter-date-from"
					type="date"
					value={dateFrom}
					onChange={(e) => updateParam("from", e.target.value)}
					className="h-8 w-auto text-sm"
				/>
			</div>

			<div className="flex items-center gap-1.5">
				<label
					htmlFor="filter-date-to"
					className="text-xs font-medium text-muted-foreground"
				>
					To
				</label>
				<Input
					id="filter-date-to"
					type="date"
					value={dateTo}
					onChange={(e) => updateParam("to", e.target.value)}
					className="h-8 w-auto text-sm"
				/>
			</div>

			{hasFilters && (
				<Button variant="ghost" size="sm" onClick={clearAll}>
					Clear filters
				</Button>
			)}
		</Card>
	);
}
