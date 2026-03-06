/**
 * Use case: generate a hybrid projection insight combining deterministic data
 * with LLM-authored narrative (bolt 023).
 *
 * Replaces generateProjections(). Returns HybridProjectionResult with:
 * - deterministicData: yearly series from snapshot, or null if unavailable
 * - llmNarrative: post-processed LLM commentary with disclaimer appended
 * - assumptions: empty for now (future: parse from LLM response)
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
import type {
	HybridProjectionResult,
	PortfolioSnapshot,
} from "@/domain/insights/types";

export async function generateHybridProjection(
	snapshot: PortfolioSnapshot,
	gateway: LLMGatewayPort,
): Promise<HybridProjectionResult> {
	const template = getTemplate("projection-quality-review");

	const extraParams: Record<string, string> = {};
	if (snapshot.deterministicProjections) {
		extraParams.hasProjections = "true";
	} else {
		extraParams.hasProjections = "false";
	}

	const prompt = renderTemplate(
		template,
		buildRenderContext(snapshot, extraParams),
	);

	const response = await gateway.complete(prompt, {
		insightType: "projection-quality-review",
		templateId: template.id,
		templateVersion: template.version,
	});

	const rawNarrative = response.text.trim();
	const processed = applyPostProcessing(rawNarrative);
	const llmNarrative = appendDisclaimer(processed);

	const deterministicData = snapshot.deterministicProjections
		? {
				granularity: "yearly" as const,
				points: snapshot.deterministicProjections.yearly,
			}
		: null;

	return {
		deterministicData,
		llmNarrative,
		assumptions: [],
		disclaimer: INSIGHT_DISCLAIMER,
		modelUsed: response.modelUsed,
	};
}
