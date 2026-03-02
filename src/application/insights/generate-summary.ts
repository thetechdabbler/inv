/**
 * Use case: generate a narrative portfolio summary via LLM.
 */

import {
	buildAccountSummary,
	buildAllocationSummary,
	formatPercent,
	paiseToINR,
} from "@/application/insights/snapshot-formatter";
import type { LLMGatewayPort } from "@/domain/insights/llm-gateway";
import { PROMPT_TEMPLATES } from "@/domain/insights/prompt-templates";
import type { PortfolioSnapshot, SummaryResult } from "@/domain/insights/types";

export async function generateSummary(
	snapshot: PortfolioSnapshot,
	gateway: LLMGatewayPort,
): Promise<SummaryResult> {
	const prompt = PROMPT_TEMPLATES.summary({
		totalValueINR: paiseToINR(snapshot.totalValuePaise),
		netInvestedINR: paiseToINR(snapshot.netInvestedPaise),
		profitLossINR: paiseToINR(snapshot.profitLossPaise),
		percentReturn: formatPercent(snapshot.percentReturn),
		accountCount: snapshot.accounts.length,
		accountSummary: buildAccountSummary(snapshot.accounts),
		allocationSummary: buildAllocationSummary(snapshot.allocationByType),
	});

	const response = await gateway.complete(prompt);
	return { summary: response.text.trim(), modelUsed: response.modelUsed };
}
