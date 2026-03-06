"use client";

import { InsightChat } from "@/components/InsightChat";
import { RequireAuth } from "@/components/RequireAuth";
import { InsightHistoryPanel } from "@/components/insights/InsightHistoryPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, MessageCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function InsightsContent() {
	const searchParams = useSearchParams();
	const tabParam = searchParams.get("tab");
	const [activeTab, setActiveTab] = useState(
		tabParam === "chat" ? "chat" : "history",
	);

	// Keep tab in sync if URL param changes
	useEffect(() => {
		if (tabParam === "chat") setActiveTab("chat");
	}, [tabParam]);

	return (
		<div className="flex flex-col gap-4 motion-safe:animate-fade-in">
			<div>
				<h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Browse past insights or ask a new question about your portfolio.
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="w-full sm:w-auto">
					<TabsTrigger value="history" className="flex-1 sm:flex-none gap-1.5">
						<History className="h-3.5 w-3.5" />
						History
					</TabsTrigger>
					<TabsTrigger value="chat" className="flex-1 sm:flex-none gap-1.5">
						<MessageCircle className="h-3.5 w-3.5" />
						Chat
					</TabsTrigger>
				</TabsList>

				<TabsContent value="history" className="mt-4">
					<InsightHistoryPanel />
				</TabsContent>

				<TabsContent value="chat" className="mt-4">
					<InsightChat />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default function InsightsPage() {
	return (
		<RequireAuth>
			<Suspense>
				<InsightsContent />
			</Suspense>
		</RequireAuth>
	);
}
