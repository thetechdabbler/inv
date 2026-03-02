import { POST as POST_LOGIN } from "@/app/api/v1/auth/login/route";
import { POST as POST_SETUP } from "@/app/api/v1/auth/setup/route";
import { GET as GET_STATUS } from "@/app/api/v1/auth/status/route";
import { prisma } from "@/infrastructure/prisma/client";
/**
 * Integration tests for bolt 007-auth-security: auth setup, login, status.
 */
import { beforeAll, describe, expect, it } from "vitest";

beforeAll(async () => {
	await prisma.userConfig.deleteMany();
});

describe("POST /api/v1/auth/setup", () => {
	it("should reject short passphrase with 400", async () => {
		const res = await POST_SETUP(
			new Request("http://localhost/api/v1/auth/setup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passphrase: "short" }),
			}),
		);
		expect(res.status).toBe(400);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should set passphrase and return 200", async () => {
		const res = await POST_SETUP(
			new Request("http://localhost/api/v1/auth/setup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passphrase: "my-secret-passphrase-here" }),
			}),
		);
		expect(res.status).toBe(200);
		const data = (await res.json()) as { ok: boolean };
		expect(data.ok).toBe(true);
	});

	it("should return 409 when already configured", async () => {
		const res = await POST_SETUP(
			new Request("http://localhost/api/v1/auth/setup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passphrase: "another-passphrase-here" }),
			}),
		);
		expect(res.status).toBe(409);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("ALREADY_CONFIGURED");
	});
});

describe("POST /api/v1/auth/login", () => {
	it("should return 404 when not configured", async () => {
		await prisma.userConfig.deleteMany();
		const res = await POST_LOGIN(
			new Request("http://localhost/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passphrase: "any" }),
			}),
		);
		expect(res.status).toBe(404);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("NOT_CONFIGURED");
		await POST_SETUP(
			new Request("http://localhost/api/v1/auth/setup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passphrase: "my-secret-passphrase-here" }),
			}),
		);
	});

	it("should return 401 for wrong passphrase", async () => {
		const res = await POST_LOGIN(
			new Request("http://localhost/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passphrase: "wrong-passphrase" }),
			}),
		);
		expect(res.status).toBe(401);
		const data = (await res.json()) as { code: string };
		expect(data.code).toBe("INVALID_PASSPHRASE");
	});

	it("should return 200 and set session cookie for correct passphrase", async () => {
		const res = await POST_LOGIN(
			new Request("http://localhost/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passphrase: "my-secret-passphrase-here" }),
			}),
		);
		expect(res.status).toBe(200);
		const data = (await res.json()) as { ok: boolean };
		expect(data.ok).toBe(true);
		const setCookie = res.headers.get("set-cookie");
		expect(setCookie).toBeTruthy();
		expect(setCookie).toContain("inv_session");
	});
});

describe("GET /api/v1/auth/status", () => {
	it("should return configured true and authenticated after login", async () => {
		const loginRes = await POST_LOGIN(
			new Request("http://localhost/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passphrase: "my-secret-passphrase-here" }),
			}),
		);
		expect(loginRes.status).toBe(200);
		const cookie = loginRes.headers.get("set-cookie") ?? "";
		const statusRes = await GET_STATUS(
			new Request("http://localhost/api/v1/auth/status", {
				headers: { Cookie: cookie },
			}),
		);
		expect(statusRes.status).toBe(200);
		const status = (await statusRes.json()) as {
			configured: boolean;
			authenticated?: boolean;
		};
		expect(status.configured).toBe(true);
		expect(status.authenticated).toBe(true);
	});
});
