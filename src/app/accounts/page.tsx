"use client";

import { PageTransition } from "@/components/PageTransition";
import { RequireAuth } from "@/components/RequireAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiJson } from "@/lib/api";
import { TYPE_GRADIENTS as TYPE_COLORS } from "@/lib/constants";
import { formatIndian, formatInr } from "@/lib/format";
import type { AccountListItem, AccountsResponse } from "@/types/api";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

function AccountTile({ account }: { account: AccountListItem }) {
	const currentValue = account.currentValuePaise ?? account.initialBalancePaise;
	const invested =
		account.initialBalancePaise + (account.totalContributionsPaise ?? 0);
	const pl = currentValue - invested;
	const pctReturn = invested > 0 ? (pl / invested) * 100 : 0;
	const isPositive = pl >= 0;

	return (
		<Link href={`/accounts/${account.id}`} className="group block">
			<Card className="relative overflow-hidden hover:shadow-lg hover:border-primary/30 motion-safe:hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
				<div
					className={`h-1.5 bg-gradient-to-r ${TYPE_COLORS[account.type] ?? "from-muted-foreground to-muted-foreground"}`}
				/>
				<CardContent className="p-5">
					<div className="flex items-start justify-between mb-4">
						<div className="flex items-center gap-3">
							<div
								className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white text-sm font-bold shadow-sm ${TYPE_COLORS[account.type] ?? "from-muted-foreground to-muted-foreground"}`}
							>
								{account.name.slice(0, 2).toUpperCase()}
							</div>
							<div>
								<h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
									{account.name}
								</h3>
								<Badge variant="outline" className="mt-0.5 capitalize text-xs">
									{account.type.replace(/_/g, " ")}
								</Badge>
							</div>
						</div>
						<Badge
							variant="outline"
							className={`text-xs ${
								isPositive
									? "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
									: "text-red-500 dark:text-red-400 border-red-200 dark:border-red-800"
							}`}
						>
							{isPositive ? "\u2191" : "\u2193"}{" "}
							{Math.abs(pctReturn).toFixed(1)}%
						</Badge>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Current Value
							</p>
							<p className="mt-0.5 text-lg font-bold text-card-foreground">
								<span title={formatInr(currentValue)}>
									{formatIndian(currentValue)}
								</span>
							</p>
						</div>
						<div>
							<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Invested
							</p>
							<p className="mt-0.5 text-lg font-semibold text-muted-foreground">
								<span title={formatInr(invested)}>
									{formatIndian(invested)}
								</span>
							</p>
						</div>
					</div>

					<div className="mt-4 pt-4 border-t flex items-center justify-between">
						<div>
							<span className="text-xs text-muted-foreground">P&L</span>
							<span
								className={`ml-2 text-sm font-semibold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
							>
								{isPositive ? "+" : ""}
								{formatInr(pl)}
							</span>
						</div>
						<span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
							View &rarr;
						</span>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}

function AccountsList() {
	const { data, error, isLoading } = useSWR<AccountsResponse>(
		"/api/v1/accounts",
		(url: string) => apiJson<AccountsResponse>(url),
	);

	const [query, setQuery] = useState("");
	const [sortBy, setSortBy] = useState<"value" | "name" | "type" | "returns">(
		"value",
	);

	if (error) {
		return (
			<Card className="border-destructive/50 bg-destructive/5">
				<CardContent className="p-6 text-center">
					<p className="text-destructive font-medium">
						Failed to load accounts.
					</p>
				</CardContent>
			</Card>
		);
	}

	if (isLoading || !data) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-52 rounded-xl" />
				))}
			</div>
		);
	}

	const accounts = data.accounts;

	const filteredAccounts = accounts
		.filter((a) =>
			query.trim()
				? a.name.toLowerCase().includes(query.trim().toLowerCase())
				: true,
		)
		.sort((a, b) => {
			const aCurrent = a.currentValuePaise ?? a.initialBalancePaise;
			const bCurrent = b.currentValuePaise ?? b.initialBalancePaise;
			const aInvested =
				a.initialBalancePaise + (a.totalContributionsPaise ?? 0);
			const bInvested =
				b.initialBalancePaise + (b.totalContributionsPaise ?? 0);
			const aReturn =
				aInvested > 0 ? (aCurrent - aInvested) / aInvested : 0;
			const bReturn =
				bInvested > 0 ? (bCurrent - bInvested) / bInvested : 0;

			switch (sortBy) {
				case "name":
					return a.name.localeCompare(b.name);
				case "type":
					return a.type.localeCompare(b.type);
				case "returns":
					return bReturn - aReturn;
				case "value":
				default:
					return bCurrent - aCurrent;
			}
		});

	return (
		<PageTransition className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">Accounts</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{accounts.length} account{accounts.length !== 1 ? "s" : ""}
					</p>
				</div>
				<Button asChild>
					<Link href="/accounts/new">
						<Plus className="h-4 w-4" />
						Add account
					</Link>
				</Button>
			</div>

			{accounts.length > 0 && (
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex-1 max-w-sm">
						<Input
							placeholder="Search accounts…"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="h-9 text-sm"
						/>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-muted-foreground">
							Sort by
						</span>
						<Select
							value={sortBy}
							onValueChange={(value) =>
								setSortBy(
									value as "value" | "name" | "type" | "returns",
								)
							}
						>
							<SelectTrigger className="h-9 w-32 text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="value">Value</SelectItem>
								<SelectItem value="name">Name</SelectItem>
								<SelectItem value="type">Type</SelectItem>
								<SelectItem value="returns">Returns</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			)}

			{accounts.length === 0 ? (
				<Card className="border-dashed border-2">
					<CardContent className="p-10 text-center">
						<p className="text-muted-foreground">
							No accounts yet. Create one to get started.
						</p>
					</CardContent>
				</Card>
			) : filteredAccounts.length === 0 ? (
				<Card className="border-dashed border-2">
					<CardContent className="p-10 text-center">
						<p className="text-muted-foreground">
							No accounts match your current search or sort.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredAccounts.map((a, i) => (
						<div
							key={a.id}
							className="motion-safe:animate-slide-up stagger-item"
							style={{ "--stagger": i } as React.CSSProperties}
						>
							<AccountTile account={a} />
						</div>
					))}
				</div>
			)}
		</PageTransition>
	);
}

export default function AccountsPage() {
	return (
		<RequireAuth>
			<AccountsList />
		</RequireAuth>
	);
}
