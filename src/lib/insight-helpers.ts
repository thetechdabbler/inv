import type { LLMInteraction } from "@/types/api";

export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	text: string;
	isError?: boolean;
}

export function toMessages(interactions: LLMInteraction[]): ChatMessage[] {
	return interactions.flatMap((i) => [
		{ id: `${i.id}-q`, role: "user" as const, text: i.prompt },
		{
			id: `${i.id}-a`,
			role: "assistant" as const,
			text: i.success
				? i.response
				: `Error: ${i.errorMessage ?? "Unknown error"}`,
			isError: !i.success,
		},
	]);
}
