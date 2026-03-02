/**
 * Prisma repository for LLMResponse (bolt 006-llm-insights).
 */

import { prisma } from "./client";

export interface CreateLLMResponseInput {
  queryId: string;
  responseText: string;
  modelUsed: string;
  tokensUsed?: number | null;
  success: boolean;
  errorMessage?: string | null;
}

export async function createLLMResponse(
  input: CreateLLMResponseInput,
): Promise<void> {
  await prisma.lLMResponse.create({ data: input });
}
