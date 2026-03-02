-- CreateTable
CREATE TABLE "user_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "passphrase_hash" TEXT NOT NULL,
    "key_derivation_salt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
