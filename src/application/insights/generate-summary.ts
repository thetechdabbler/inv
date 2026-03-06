/**
 * Use case: generate a narrative portfolio summary via LLM.
 */

import { buildRenderContext } from "@/application/insights/snapshot-formatter";
import {
	INSIGHT_DISCLAIMER,
	appendDisclaimer,
} from "@/domain/insights/disclaimer";
import type { LLMGatewayPort } from "@/domain/insights/llm-gateway";
import { applyPostProcessing } from "@/domain/insights/post-processing";
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
		templateId: template.id,
		templateVersion: template.version,
	});
	const processed = applyPostProcessing(response.text.trim());
	const summary = appendDisclaimer(processed);
	return { summary, modelUsed: response.modelUsed, disclaimer: INSIGHT_DISCLAIMER };
}
