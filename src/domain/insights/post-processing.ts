/**
 * Post-processing guardrail pipeline for LLM insight text (bolt 023).
 * Applies transforms in order; each transform must not throw.
 */

export interface PostProcessingTransform {
	name: string;
	apply: (text: string) => string;
}

export const SAFE_FALLBACK =
	"Your portfolio data has been analysed. " +
	"Please consult your financial advisor for personalised recommendations.";

export const GUARDRAIL_PIPELINE: PostProcessingTransform[] = [
	{
		name: "investmentRecommendationGuardrail",
		apply: (text) =>
			text.replace(
				/\b(invest in|buy|purchase|sell|switch to|recommend[a-z]*\s+(fund|stock|share|etf))\b/gi,
				"consider reviewing your allocation",
			),
	},
];

export function applyPostProcessing(text: string): string {
	let result = text;
	for (const transform of GUARDRAIL_PIPELINE) {
		try {
			result = transform.apply(result);
		} catch (e) {
			console.warn(`[post-processing] Transform "${transform.name}" failed:`, e);
		}
	}
	return result.trim().length < 20 ? SAFE_FALLBACK : result;
}
