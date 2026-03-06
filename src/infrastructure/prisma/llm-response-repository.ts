/**
 * Prisma repository for LLMResponse (bolt 006-llm-insights).
 * Bolt 023: enriched with token counts, durationMs, and findDebugView().
 */

import type { DebugAuditView } from "@/domain/insights/types";
import { prisma } from "./client";

export interface CreateLLMResponseInput {
  queryId: string;
  responseText: string;
  modelUsed: string;
  tokensUsed?: number | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  durationMs?: number | null;
  success: boolean;
  errorMessage?: string | null;
}

export async function createLLMResponse(
  input: CreateLLMResponseInput,
): Promise<void> {
  await prisma.lLMResponse.create({ data: input });
}

export async function findDebugView(
  queryId: string,
): Promise<DebugAuditView | null> {
  const record = await prisma.lLMQuery.findUnique({
    where: { id: queryId },
    include: { response: true },
  });
  if (!record || !record.response) return null;
  return {
    auditId: record.id,
    insightType: record.insightType,
    prompt: record.prompt,
    responseText: record.response.responseText,
    modelUsed: record.response.modelUsed,
    promptTokens: record.response.promptTokens ?? null,
    completionTokens: record.response.completionTokens ?? null,
    durationMs: record.response.durationMs ?? null,
    templateId: record.templateId ?? null,
    templateVersion: record.templateVersion ?? null,
    success: record.response.success,
    errorMessage: record.response.errorMessage ?? null,
    createdAt: record.createdAt.toISOString(),
  };
}
