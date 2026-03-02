import { DELETE as DELETE_ACCOUNT } from "@/app/api/v1/accounts/[id]/route";
import { POST as POST_ACCOUNT } from "@/app/api/v1/accounts/route";
import { GET as GET_ACCESS_LOGS } from "@/app/api/v1/audit/access-logs/route";
import { GET as GET_CHANGE_LOGS } from "@/app/api/v1/audit/change-logs/route";
import { GET as GET_EXPORT } from "@/app/api/v1/backup/export/route";
import { POST as POST_IMPORT } from "@/app/api/v1/backup/import/route";
import { prisma } from "@/infrastructure/prisma/client";
/**
 * Integration tests for bolt 008-auth-security: backup export/import and audit APIs.
 */
import { beforeAll, describe, expect, it } from "vitest";

async function createAccount(name: string, type: string, initialPaise: number) {
	const res = await POST_ACCOUNT(
		new Request("http://localhost/api/v1/accounts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ type, name, initialBalancePaise: initialPaise }),
		}),
	);
	expect(res.status).toBe(201);
	return (await res.json()) as { id: string };
}

describe("GET /api/v1/backup/export", () => {
	it("should return JSON with accounts, transactions, valuations, meta", async () => {
		const res = await GET_EXPORT(
			new Request("http://localhost/api/v1/backup/export?format=json"),
		);
		expect(res.status).toBe(200);
		const data = (await res.json()) as {
			accounts: unknown[];
			transactions: unknown[];
			valuations: unknown[];
			meta: { exportedAt: string; schemaVersion: number };
		};
		expect(Array.isArray(data.accounts)).toBe(true);
		expect(Array.isArray(data.transactions)).toBe(true);
		expect(Array.isArray(data.valuations)).toBe(true);
		expect(data.meta).toBeDefined();
		expect(data.meta.schemaVersion).toBe(1);
		expect(data.meta.exportedAt).toBeDefined();
	});

	it("should return 400 for invalid format", async () => {
		const res = await GET_EXPORT(
			new Request("http://localhost/api/v1/backup/export?format=xml"),
		);
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return ZIP for format=csv", async () => {
		const res = await GET_EXPORT(
			new Request("http://localhost/api/v1/backup/export?format=csv"),
		);
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("application/zip");
		expect(res.headers.get("content-disposition")).toContain("attachment");
		const buf = await res.arrayBuffer();
		expect(buf.byteLength).toBeGreaterThan(0);
	});
});

describe("POST /api/v1/backup/import", () => {
	it("should import valid JSON backup and return counts", async () => {
		const exportRes = await GET_EXPORT(
			new Request("http://localhost/api/v1/backup/export?format=json"),
		);
		expect(exportRes.status).toBe(200);
		const snapshot = (await exportRes.json()) as unknown;

		const formData = new FormData();
		formData.set(
			"file",
			new Blob([JSON.stringify(snapshot)], { type: "application/json" }),
			"backup.json",
		);

		const importRes = await POST_IMPORT(
			new Request("http://localhost/api/v1/backup/import", {
				method: "POST",
				body: formData,
			}),
		);
		expect(importRes.status).toBe(200);
		const data = (await importRes.json()) as {
			ok: boolean;
			counts: { accounts: number; transactions: number; valuations: number };
		};
		expect(data.ok).toBe(true);
		expect(typeof data.counts.accounts).toBe("number");
		expect(typeof data.counts.transactions).toBe("number");
		expect(typeof data.counts.valuations).toBe("number");
	});

	it("should return 400 for invalid JSON", async () => {
		const formData = new FormData();
		formData.set(
			"file",
			new Blob(["not json"], { type: "application/json" }),
			"bad.json",
		);
		const res = await POST_IMPORT(
			new Request("http://localhost/api/v1/backup/import", {
				method: "POST",
				body: formData,
			}),
		);
		expect(res.status).toBe(400);
	});
});

describe("GET /api/v1/audit/access-logs", () => {
	it("should return 200 with logs array", async () => {
		const res = await GET_ACCESS_LOGS(
			new Request("http://localhost/api/v1/audit/access-logs"),
		);
		expect(res.status).toBe(200);
		const data = (await res.json()) as { logs: unknown[] };
		expect(Array.isArray(data.logs)).toBe(true);
	});

	it("should accept limit and since query params", async () => {
		const res = await GET_ACCESS_LOGS(
			new Request(
				"http://localhost/api/v1/audit/access-logs?limit=5&since=2020-01-01T00:00:00.000Z",
			),
		);
		expect(res.status).toBe(200);
		const data = (await res.json()) as { logs: unknown[] };
		expect(Array.isArray(data.logs)).toBe(true);
	});
});

describe("GET /api/v1/audit/change-logs", () => {
	it("should return 200 with logs array", async () => {
		const res = await GET_CHANGE_LOGS(
			new Request("http://localhost/api/v1/audit/change-logs"),
		);
		expect(res.status).toBe(200);
		const data = (await res.json()) as { logs: unknown[] };
		expect(Array.isArray(data.logs)).toBe(true);
	});

	it("should include account created/deleted after account operations", async () => {
		const account = await createAccount("Audit Test Account", "ppf", 10000);
		const afterCreate = await GET_CHANGE_LOGS(
			new Request("http://localhost/api/v1/audit/change-logs"),
		);
		const afterCreateData = (await afterCreate.json()) as {
			logs: { entityType: string; action: string }[];
		};
		const createdLog = afterCreateData.logs.find(
			(l) => l.entityType === "account" && l.action === "created",
		);
		expect(createdLog).toBeDefined();

		const deleteRes = await DELETE_ACCOUNT(
			new Request(
				`http://localhost/api/v1/accounts/${account.id}?confirm=true`,
			),
			{ params: Promise.resolve({ id: account.id }) },
		);
		expect(deleteRes.status).toBe(204);
		const afterDelete = await GET_CHANGE_LOGS(
			new Request("http://localhost/api/v1/audit/change-logs"),
		);
		const afterDeleteData = (await afterDelete.json()) as {
			logs: { entityType: string; action: string; entityId: string }[];
		};
		const deletedLog = afterDeleteData.logs.find(
			(l) =>
				l.entityType === "account" &&
				l.action === "deleted" &&
				l.entityId === account.id,
		);
		expect(deletedLog).toBeDefined();
	});
});
