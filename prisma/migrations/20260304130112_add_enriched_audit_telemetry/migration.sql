-- AlterTable
ALTER TABLE "llm_queries" ADD COLUMN "template_id" TEXT;
ALTER TABLE "llm_queries" ADD COLUMN "template_version" TEXT;

-- AlterTable
ALTER TABLE "llm_responses" ADD COLUMN "completion_tokens" INTEGER;
ALTER TABLE "llm_responses" ADD COLUMN "duration_ms" INTEGER;
ALTER TABLE "llm_responses" ADD COLUMN "prompt_tokens" INTEGER;
