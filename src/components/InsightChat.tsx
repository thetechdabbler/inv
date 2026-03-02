"use client";

import { apiFetch, apiJson } from "@/lib/api";
import { type ChatMessage, toMessages } from "@/lib/insight-helpers";
import type {
	InsightsHistoryResponse,
	InsightsQueryResponse,
} from "@/types/api";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
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
		<div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px]">
			<div className="mb-4">
				<h1 className="text-2xl font-bold text-slate-800">AI Insights</h1>
				<p className="text-sm text-slate-400 mt-1">
					Ask questions about your portfolio in plain language.
				</p>
			</div>

			{unavailable && (
				<div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
					OpenAI API key not configured. Add <code>OPENAI_API_KEY</code> to your{" "}
					<code>.env</code> file to enable AI insights.
				</div>
			)}

			<div className="mb-3 flex flex-wrap gap-2">
				{QUICK_ACTIONS.map((action) => (
					<button
						key={action}
						type="button"
						disabled={thinking}
						onClick={() => sendQuestion(action)}
						className="rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
					>
						{action}
					</button>
				))}
			</div>

			<div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
				{histLoading && messages.length === 0 && (
					<div className="flex items-center gap-2 text-sm text-slate-400">
						<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
						Loading history…
					</div>
				)}

				{!histLoading && messages.length === 0 && (
					<div className="flex h-full items-center justify-center">
						<div className="text-center">
							<div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
								<svg
									className="h-5 w-5 text-indigo-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>Chat</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
									/>
								</svg>
							</div>
							<p className="text-slate-400 text-sm">
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
						<div
							className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
								msg.role === "user"
									? "bg-indigo-600 text-white shadow-sm"
									: msg.isError
										? "bg-red-50 text-red-700 border border-red-200"
										: "bg-slate-100 text-slate-800"
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
											<ol className="list-decimal pl-4 mb-1">{children}</ol>
										),
										strong: ({ children }) => (
											<strong className="font-semibold">{children}</strong>
										),
									}}
								>
									{msg.text}
								</Markdown>
							) : (
								msg.text
							)}
						</div>
					</div>
				))}

				{thinking && (
					<div className="flex justify-start">
						<div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500 flex items-center gap-2">
							<span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
							Thinking…
						</div>
					</div>
				)}

				<div ref={bottomRef} />
			</div>

			<form onSubmit={handleSubmit} className="mt-3 flex gap-2">
				<input
					type="text"
					value={question}
					onChange={(e) => setQuestion(e.target.value)}
					placeholder="Ask about your portfolio…"
					maxLength={1000}
					disabled={thinking}
					className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-slate-50 transition-colors"
				/>
				<button
					type="submit"
					disabled={!question.trim() || thinking}
					className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
				>
					Send
				</button>
			</form>
		</div>
	);
}
