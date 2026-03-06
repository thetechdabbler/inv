/**
 * Prisma repository for LLMQuery (bolt 006-llm-insights).
 */

import { prisma } from "./client";

export interface CreateLLMQueryInput {
	insightType: string;
	prompt: string;
	modelRequested: string;
	templateId?: string | null;
	templateVersion?: string | null;
}

export interface LLMQueryRecord {
	id: string;
	insightType: string;
	prompt: string;
	modelRequested: string;
	templateId: string | null;
	templateVersion: string | null;
	createdAt: Date;
}

export async function createLLMQuery(
	input: CreateLLMQueryInput,
): Promise<LLMQueryRecord> {
	return prisma.lLMQuery.create({ data: input });
}

export interface LLMQueryWithResponse {
	id: string;
	insightType: string;
	prompt: string;
	modelRequested: string;
	templateId: string | null;
	templateVersion: string | null;
	createdAt: Date;
	response: {
		responseText: string;
		modelUsed: string;
		tokensUsed: number | null;
		promptTokens: number | null;
		completionTokens: number | null;
		durationMs: number | null;
		success: boolean;
		errorMessage: string | null;
		createdAt: Date;
	} | null;
}

export async function findAllLLMQueries(options?: {
	limit?: number;
	offset?: number;
	type?: string;
	from?: Date;
	to?: Date;
}): Promise<{ records: LLMQueryWithResponse[]; total: number }> {
	const limit = Math.min(options?.limit ?? 20, 100);
	const offset = options?.offset ?? 0;

	const where: Record<string, unknown> = {};
	if (options?.type) where.insightType = options.type;
	if (options?.from || options?.to) {
		where.createdAt = {
			...(options.from ? { gte: options.from } : {}),
			...(options.to ? { lte: options.to } : {}),
		};
	}

	const [records, total] = await Promise.all([
		prisma.lLMQuery.findMany({
			where,
			include: { response: true },
			orderBy: { createdAt: "desc" },
			take: limit,
			skip: offset,
		}),
		prisma.lLMQuery.count({ where }),
	]);
	return { records, total };
}
