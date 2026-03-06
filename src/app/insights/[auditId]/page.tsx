import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { DebugAuditViewResponse } from "@/types/api";
import { ArrowLeft, BarChart2, Clock, Cpu, FileText, Hash } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

// ── Type metadata (server-side) ───────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
	"portfolio-summary": "Summary",
	"future-projections": "Projections",
	"risk-analysis": "Risk Analysis",
	rebalancing: "Rebalancing",
	"natural-language-query": "Q&A",
	"projection-quality-review": "Projection Review",
	"retirement-readiness": "Retirement",
};

const PROJECTION_TYPES = new Set([
	"future-projections",
	"projection-quality-review",
]);

function typeLabel(insightType: string) {
	return TYPE_LABELS[insightType] ?? insightType;
}

/** Separate the ⚠️ disclaimer from the main narrative body. */
function splitNarrative(text: string): { body: string; disclaimer: string } {
	const idx = text.indexOf("\n\n⚠️");
	if (idx === -1) return { body: text, disclaimer: "" };
	return {
		body: text.slice(0, idx).trim(),
		disclaimer: text.slice(idx + 2).trim(),
	};
}

// ── Data fetch ────────────────────────────────────────────────────────────────

async function fetchAuditRecord(
	auditId: string,
): Promise<DebugAuditViewResponse | null> {
	// Internal server-side fetch — calls the same Next.js route
	const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
	try {
		const res = await fetch(
			`${base}/api/v1/insights/debug/${encodeURIComponent(auditId)}`,
			{
				cache: "no-store",
			},
		);
		if (res.status === 404) return null;
		if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
		return (await res.json()) as DebugAuditViewResponse;
	} catch {
		return null;
	}
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
	params: Promise<{ auditId: string }>;
}

export default async function InsightDetailPage({ params }: PageProps) {
	const { auditId } = await params;
	const record = await fetchAuditRecord(auditId);

	if (!record) {
		notFound();
	}

	const responseText = record.success
		? record.responseText
		: (record.errorMessage ?? "No response");
	const { body, disclaimer } = record.success
		? splitNarrative(responseText)
		: { body: responseText, disclaimer: "" };
	const isProjection = PROJECTION_TYPES.has(record.insightType);

	return (
		<div className="flex flex-col gap-6 max-w-3xl mx-auto motion-safe:animate-fade-in">
			{/* Header */}
			<div className="flex items-start gap-4">
				<Button
					variant="ghost"
					size="sm"
					asChild
					className="gap-1 -ml-2 mt-0.5"
				>
					<Link href="/insights">
						<ArrowLeft className="h-3.5 w-3.5" />
						Back
					</Link>
				</Button>
				<div className="flex-1 min-w-0">
					<div className="flex flex-wrap items-center gap-2 mb-1">
						<Badge variant="secondary">{typeLabel(record.insightType)}</Badge>
						{!record.success && <Badge variant="destructive">Failed</Badge>}
					</div>
					<p className="text-sm text-muted-foreground">
						{formatDate(record.createdAt)}
					</p>
				</div>
			</div>

			{/* Narrative */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base flex items-center gap-2">
						<FileText className="h-4 w-4 text-muted-foreground" />
						Narrative
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
						<ReactMarkdown>{body || "*No content*"}</ReactMarkdown>
					</div>
					{disclaimer && (
						<div className="mt-4 rounded-md bg-muted/50 border border-border/50 px-3 py-2">
							<p className="text-xs text-muted-foreground leading-relaxed">
								{disclaimer}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Projection link for relevant types */}
			{isProjection && (
				<Card className="border-primary/20 bg-primary/5">
					<CardContent className="flex items-center justify-between py-4">
						<div className="flex items-center gap-2">
							<BarChart2 className="h-4 w-4 text-primary" />
							<span className="text-sm">
								View current portfolio projections and chart
							</span>
						</div>
						<Button variant="outline" size="sm" asChild>
							<Link href="/projections">View projections</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Metadata */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base text-muted-foreground text-sm font-medium uppercase tracking-wide">
						Metadata
					</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
						<div className="flex items-start gap-2">
							<Cpu className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
							<div>
								<dt className="text-xs text-muted-foreground">Model</dt>
								<dd className="font-mono text-xs">{record.modelUsed}</dd>
							</div>
						</div>

						{(record.promptTokens != null ||
							record.completionTokens != null) && (
							<div className="flex items-start gap-2">
								<Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
								<div>
									<dt className="text-xs text-muted-foreground">Tokens</dt>
									<dd className="font-mono text-xs">
										{record.promptTokens ?? "—"} prompt /{" "}
										{record.completionTokens ?? "—"} completion
									</dd>
								</div>
							</div>
						)}

						{record.durationMs != null && (
							<div className="flex items-start gap-2">
								<Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
								<div>
									<dt className="text-xs text-muted-foreground">Duration</dt>
									<dd className="font-mono text-xs">{record.durationMs}ms</dd>
								</div>
							</div>
						)}

						{record.templateId && (
							<div className="flex items-start gap-2">
								<FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
								<div>
									<dt className="text-xs text-muted-foreground">Template</dt>
									<dd className="font-mono text-xs">
										{record.templateId}
										{record.templateVersion
											? ` v${record.templateVersion}`
											: ""}
									</dd>
								</div>
							</div>
						)}

						<div className="flex items-start gap-2 sm:col-span-2">
							<Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
							<div>
								<dt className="text-xs text-muted-foreground">Generated</dt>
								<dd className="font-mono text-xs">
									{new Date(record.createdAt).toISOString()}
								</dd>
							</div>
						</div>
					</dl>
				</CardContent>
			</Card>
		</div>
	);
}
