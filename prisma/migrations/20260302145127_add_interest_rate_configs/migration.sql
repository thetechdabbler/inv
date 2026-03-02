-- CreateTable
CREATE TABLE "interest_rate_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_type" TEXT NOT NULL,
    "financial_year" INTEGER,
    "rate_percent_per_annum" REAL NOT NULL,
    "compounding_frequency" TEXT,
    "account_id" TEXT,
    "effective_from" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "interest_rate_configs_account_type_idx" ON "interest_rate_configs"("account_type");

-- CreateIndex
CREATE INDEX "interest_rate_configs_account_id_idx" ON "interest_rate_configs"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "interest_rate_config_type_year_account_key" ON "interest_rate_configs"("account_type", "financial_year", "account_id");
