/**
 * Prisma repository for LLMQuery (bolt 006-llm-insights).
 */

import { prisma } from "./client";

export interface CreateLLMQueryInput {
  insightType: string;
  prompt: string;
  modelRequested: string;
}

export interface LLMQueryRecord {
  id: string;
  insightType: string;
  prompt: string;
  modelRequested: string;
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
  createdAt: Date;
  response: {
    responseText: string;
    modelUsed: string;
    tokensUsed: number | null;
    success: boolean;
    errorMessage: string | null;
    createdAt: Date;
  } | null;
}

export async function findAllLLMQueries(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ records: LLMQueryWithResponse[]; total: number }> {
  const limit = Math.min(options?.limit ?? 20, 100);
  const offset = options?.offset ?? 0;
  const [records, total] = await Promise.all([
    prisma.lLMQuery.findMany({
      include: { response: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.lLMQuery.count(),
  ]);
  return { records, total };
}
