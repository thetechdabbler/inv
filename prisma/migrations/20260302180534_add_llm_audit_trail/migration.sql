-- CreateTable
CREATE TABLE "llm_queries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "insight_type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "model_requested" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "llm_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query_id" TEXT NOT NULL,
    "response_text" TEXT NOT NULL,
    "model_used" TEXT NOT NULL,
    "tokens_used" INTEGER,
    "success" BOOLEAN NOT NULL,
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "llm_responses_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "llm_queries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "llm_queries_insight_type_idx" ON "llm_queries"("insight_type");

-- CreateIndex
CREATE INDEX "llm_queries_created_at_idx" ON "llm_queries"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "llm_responses_query_id_key" ON "llm_responses"("query_id");

-- CreateIndex
CREATE INDEX "llm_responses_query_id_idx" ON "llm_responses"("query_id");
