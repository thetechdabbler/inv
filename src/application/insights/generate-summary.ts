/**
 * Use case: generate a narrative portfolio summary via LLM.
 */

import { buildRenderContext } from "@/application/insights/snapshot-formatter";
import type { LLMGatewayPort } from "@/domain/insights/llm-gateway";
import {
	getTemplate,
	renderTemplate,
} from "@/domain/insights/template-registry";
import type { PortfolioSnapshot, SummaryResult } from "@/domain/insights/types";

export async function generateSummary(
	snapshot: PortfolioSnapshot,
	gateway: LLMGatewayPort,
): Promise<SummaryResult> {
	const template = getTemplate("portfolio-summary");
	const prompt = renderTemplate(template, buildRenderContext(snapshot));
	const response = await gateway.complete(prompt, {
		insightType: "portfolio-summary",
	});
	return { summary: response.text.trim(), modelUsed: response.modelUsed };
}
