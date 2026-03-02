/**
 * Vitest global setup: create test DB and apply schema.
 */
import { execSync } from "node:child_process";
import path from "node:path";

const testDbPath = path.resolve(process.cwd(), "prisma/test.db");
process.env.DATABASE_URL = `file:${testDbPath}`;
execSync("npx prisma db push --accept-data-loss", {
  stdio: "inherit",
  env: process.env,
});
export default () => {};
