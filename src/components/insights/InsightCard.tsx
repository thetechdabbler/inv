"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { LLMInteraction } from "@/types/api";
import {
	BarChart2,
	ChevronDown,
	ChevronUp,
	ExternalLink,
	LayoutDashboard,
	RefreshCw,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// ── Type metadata ─────────────────────────────────────────────────────────────

const TYPE_META: Record<
	string,
	{ label: string; variant: "default" | "secondary" | "outline" }
> = {
	"portfolio-summary": { label: "Summary", variant: "default" },
	"future-projections": { label: "Projections", variant: "secondary" },
	"risk-analysis": { label: "Risk", variant: "outline" },
	rebalancing: { label: "Rebalancing", variant: "outline" },
	"natural-language-query": { label: "Q&A", variant: "secondary" },
	"projection-quality-review": {
		label: "Projection Review",
		variant: "secondary",
	},
	"retirement-readiness": { label: "Retirement", variant: "outline" },
};

function typeMeta(insightType: string) {
	return (
		TYPE_META[insightType] ?? {
			label: insightType,
			variant: "outline" as const,
		}
	);
}

// ── Quick actions ─────────────────────────────────────────────────────────────

interface QuickAction {
	label: string;
	href: string;
	icon: React.ReactNode;
}

function quickActions(insightType: string): QuickAction[] {
	switch (insightType) {
		case "future-projections":
		case "projection-quality-review":
			return [
				{
					label: "View projections",
					href: "/projections",
					icon: <BarChart2 className="h-3 w-3" />,
				},
			];
		case "portfolio-summary":
		case "risk-analysis":
			return [
				{
					label: "Dashboard",
					href: "/dashboard",
					icon: <LayoutDashboard className="h-3 w-3" />,
				},
			];
		case "rebalancing":
			return [
				{
					label: "Accounts",
					href: "/accounts",
					icon: <Wallet className="h-3 w-3" />,
				},
			];
		default:
			return [];
	}
}

// ── Narrative splitting ───────────────────────────────────────────────────────

/** Separates the main narrative from the appended disclaimer (which starts with ⚠️). */
function splitNarrative(text: string): { body: string; disclaimer: string } {
	const idx = text.indexOf("\n\n⚠️");
	if (idx === -1) return { body: text, disclaimer: "" };
	return {
		body: text.slice(0, idx).trim(),
		disclaimer: text.slice(idx + 2).trim(),
	};
}

function truncate(text: string, maxLen: number): string {
	if (text.length <= maxLen) return text;
	return `${text.slice(0, maxLen).trimEnd()}…`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
	insight: LLMInteraction;
	onRerun?: () => void;
}

export function InsightCard({ insight, onRerun }: Props) {
	const [expanded, setExpanded] = useState(false);
	const meta = typeMeta(insight.insightType);
	const actions = quickActions(insight.insightType);

	const text = insight.success
		? insight.response
		: (insight.errorMessage ?? "Error");
	const { body, disclaimer } = insight.success
		? splitNarrative(text)
		: { body: text, disclaimer: "" };

	const shortBody = truncate(body, 200);
	const needsExpand = body.length > 200;

	return (
		<Card className="flex flex-col gap-0">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center gap-2 flex-wrap">
						<Badge variant={meta.variant}>{meta.label}</Badge>
						{!insight.success && <Badge variant="destructive">Failed</Badge>}
					</div>
					<div className="flex items-center gap-1 shrink-0">
						<span className="text-xs text-muted-foreground">
							{formatDate(insight.createdAt)}
						</span>
						<Link
							href={`/insights/${insight.id}`}
							className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
							aria-label="Open detail view"
						>
							<ExternalLink className="h-3.5 w-3.5" />
						</Link>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0 flex flex-col gap-3">
				{/* Narrative section */}
				<div>
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
						Narrative
					</p>
					<div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
						{expanded ? body : shortBody}
					</div>
					{needsExpand && (
						<button
							type="button"
							onClick={() => setExpanded((v) => !v)}
							className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
						>
							{expanded ? (
								<>
									<ChevronUp className="h-3 w-3" />
									Show less
								</>
							) : (
								<>
									<ChevronDown className="h-3 w-3" />
									Read more
								</>
							)}
						</button>
					)}
				</div>

				{/* Disclaimer section */}
				{disclaimer && (
					<div className="rounded-md bg-muted/50 border border-border/50 px-3 py-2">
						<p className="text-xs text-muted-foreground leading-relaxed">
							{disclaimer}
						</p>
					</div>
				)}

				{/* Quick actions */}
				{(actions.length > 0 || onRerun) && (
					<div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50">
						{actions.map((a) => (
							<Button
								key={a.href}
								variant="ghost"
								size="sm"
								asChild
								className="h-7 gap-1 px-2 text-xs"
							>
								<Link href={a.href}>
									{a.icon}
									{a.label}
								</Link>
							</Button>
						))}
						{onRerun && (
							<Button
								variant="ghost"
								size="sm"
								className="h-7 gap-1 px-2 text-xs"
								onClick={onRerun}
							>
								<RefreshCw className="h-3 w-3" />
								Re-run
							</Button>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
