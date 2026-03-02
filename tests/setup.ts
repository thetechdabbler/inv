/**
 * Vitest setup: use test database for integration tests.
 * Set DATABASE_URL before any Prisma client is instantiated.
 * Schema is applied in global-setup.ts. Use same absolute path as globalSetup.
 */
import path from "node:path";
process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), "prisma/test.db")}`;
