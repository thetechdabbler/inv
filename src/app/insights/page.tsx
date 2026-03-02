"use client";

import { InsightChat } from "@/components/InsightChat";
import { RequireAuth } from "@/components/RequireAuth";

export default function InsightsPage() {
	return (
		<RequireAuth>
			<InsightChat />
		</RequireAuth>
	);
}
