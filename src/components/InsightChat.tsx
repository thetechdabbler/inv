"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch, apiJson } from "@/lib/api";
import { type ChatMessage, toMessages } from "@/lib/insight-helpers";
import type {
	InsightsHistoryResponse,
	InsightsQueryResponse,
} from "@/types/api";
import { AlertTriangle, Copy, Lightbulb, Loader2, Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import useSWR from "swr";

const QUICK_ACTIONS = [
	"Summarise my portfolio",
	"Analyse my risk exposure",
	"Project my portfolio value in 10 years",
];

export function InsightChat() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [question, setQuestion] = useState("");
	const [thinking, setThinking] = useState(false);
	const [unavailable, setUnavailable] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	const { data: history, isLoading: histLoading } =
		useSWR<InsightsHistoryResponse>(
			"/api/v1/insights/history?limit=20",
			(url: string) => apiJson<InsightsHistoryResponse>(url),
		);

	const messagesLen = messages.length;

	useEffect(() => {
		if (history?.interactions && messagesLen === 0) {
			const sorted = [...history.interactions].sort((a, b) =>
				a.createdAt.localeCompare(b.createdAt),
			);
			setMessages(toMessages(sorted));
		}
	}, [history, messagesLen]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	});

	async function copyMessage(text: string) {
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
				toast.success("Copied to clipboard");
			}
		} catch {
			toast.error("Failed to copy");
		}
	}

	function handleClearHistory() {
		setMessages([]);
		setUnavailable(false);
	}

	async function sendQuestion(q: string) {
		const trimmed = q.trim();
		if (!trimmed || thinking) return;

		const userMsg: ChatMessage = {
			id: `u-${Date.now()}`,
			role: "user",
			text: trimmed,
		};
		setMessages((prev) => [...prev, userMsg]);
		setQuestion("");
		setThinking(true);
		setUnavailable(false);

		try {
			const res = await apiFetch("/api/v1/insights/query", {
				method: "POST",
				body: JSON.stringify({ question: trimmed }),
			});

			if (res.status === 503) {
				setUnavailable(true);
				setMessages((prev) => [
					...prev,
					{
						id: `a-${Date.now()}`,
						role: "assistant",
						text: "AI insights are unavailable — no OpenAI API key is configured.",
						isError: true,
					},
				]);
				return;
			}

			if (!res.ok) {
				const err = (await res.json()) as { message?: string };
				setMessages((prev) => [
					...prev,
					{
						id: `a-${Date.now()}`,
						role: "assistant",
						text: `Error: ${err.message ?? "Request failed"}`,
						isError: true,
					},
				]);
				return;
			}

			const data = (await res.json()) as InsightsQueryResponse;
			setMessages((prev) => [
				...prev,
				{
					id: `a-${Date.now()}`,
					role: "assistant",
					text: data.answer,
				},
			]);
		} catch {
			setMessages((prev) => [
				...prev,
				{
					id: `a-${Date.now()}`,
					role: "assistant",
					text: "Network error — please check your connection and try again.",
					isError: true,
				},
			]);
		} finally {
			setThinking(false);
		}
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		sendQuestion(question);
	}

	return (
		<div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px] motion-safe:animate-fade-in">
			<div className="mb-4">
				<h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Ask questions about your portfolio in plain language.
				</p>
			</div>

			{unavailable && (
				<Alert className="mb-3 border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>API Key Missing</AlertTitle>
					<AlertDescription>
						OpenAI API key not configured. Add <code>OPENAI_API_KEY</code> to
						your <code>.env</code> file to enable AI insights.
					</AlertDescription>
				</Alert>
			)}

			<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap gap-2">
					{QUICK_ACTIONS.map((action) => (
						<Button
							key={action}
							variant="outline"
							size="sm"
							disabled={thinking}
							onClick={() => sendQuestion(action)}
							className="rounded-full"
						>
							{action}
						</Button>
					))}
				</div>
				{messages.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClearHistory}
						className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
					>
						<Trash2 className="h-3.5 w-3.5" />
						Clear history
					</Button>
				)}
			</div>

			<Card
				className="flex-1 overflow-y-auto p-5 space-y-4 dark:glow-border"
				role="log"
				aria-live="polite"
				aria-label="AI insights chat messages"
			>
				{histLoading && messages.length === 0 && (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Loading history…
					</div>
				)}

				{!histLoading && messages.length === 0 && (
					<div className="flex h-full items-center justify-center">
						<div className="text-center">
							<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
								<Lightbulb className="h-6 w-6 text-primary" />
							</div>
							<p className="text-muted-foreground text-sm">
								Ask a question or use a quick action to get started.
							</p>
						</div>
					</div>
				)}

				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
					>
						<div className="flex max-w-[85%] items-start gap-2">
							<div
								className={`flex-1 rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
									msg.role === "user"
										? "bg-primary text-primary-foreground shadow-sm"
										: msg.isError
											? "bg-destructive/10 text-destructive border border-destructive/30"
											: "bg-muted text-foreground"
								}`}
							>
								{msg.role === "assistant" && !msg.isError ? (
									<Markdown
										components={{
											p: ({ children }) => (
												<p className="mb-1 last:mb-0">{children}</p>
											),
											ul: ({ children }) => (
												<ul className="list-disc pl-4 mb-1">{children}</ul>
											),
											ol: ({ children }) => (
												<ol className="list-decimal pl-4 mb-1">
													{children}
												</ol>
											),
											strong: ({ children }) => (
												<strong className="font-semibold">
													{children}
												</strong>
											),
										}}
									>
										{msg.text}
									</Markdown>
								) : (
									msg.text
								)}
							</div>
							{msg.role === "assistant" && !msg.isError && (
								<button
									type="button"
									onClick={() => copyMessage(msg.text)}
									className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
									aria-label="Copy response"
								>
									<Copy className="h-3.5 w-3.5" />
								</button>
							)}
						</div>
					</div>
				))}

				{thinking && (
					<div className="flex justify-start">
						<div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
							<span className="flex gap-1">
								<span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
								<span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
								<span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
							</span>
							Thinking…
						</div>
					</div>
				)}

				<div ref={bottomRef} />
			</Card>

			<form onSubmit={handleSubmit} className="mt-3 flex gap-2">
				<Input
					type="text"
					value={question}
					onChange={(e) => setQuestion(e.target.value)}
					placeholder="Ask about your portfolio…"
					maxLength={1000}
					disabled={thinking}
					className="flex-1"
				/>
				<Button type="submit" disabled={!question.trim() || thinking}>
					{thinking ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Send className="h-4 w-4" />
					)}
					Send
				</Button>
			</form>
		</div>
	);
}
