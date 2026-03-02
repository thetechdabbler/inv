/**
 * Integration tests for /api/v1/accounts (bolt 001-portfolio-core).
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { POST, GET } from "@/app/api/v1/accounts/route";
import {
  GET as GET_ONE,
  PATCH,
  DELETE,
} from "@/app/api/v1/accounts/[id]/route";
import { prisma } from "@/infrastructure/prisma/client";

describe("POST /api/v1/accounts", () => {
  it("should create account and return 201 with account", async () => {
    const res = await POST(
      new Request("http://localhost/api/v1/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ppf",
          name: "My PPF",
          description: "Public Provident Fund",
          initialBalancePaise: 100000_00, // 1,00,000 INR
        }),
      }),
    );
    expect(res.status).toBe(201);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.id).toBeDefined();
    expect(data.type).toBe("ppf");
    expect(data.name).toBe("My PPF");
    expect(data.initialBalancePaise).toBe(100000_00);
    expect(data.createdAt).toBeDefined();
  });

  it("should reject invalid type with 400", async () => {
    const res = await POST(
      new Request("http://localhost/api/v1/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "invalid",
          name: "X",
          initialBalancePaise: 0,
        }),
      }),
    );
    expect(res.status).toBe(400);
    const data = (await res.json()) as { code: string };
    expect(data.code).toBe("VALIDATION_ERROR");
  });

  it("should reject negative initialBalancePaise with 400", async () => {
    const res = await POST(
      new Request("http://localhost/api/v1/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bank_deposit",
          name: "FD",
          initialBalancePaise: -1,
        }),
      }),
    );
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/accounts", () => {
  it("should return list of accounts with currentValue and totalContributions", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = (await res.json()) as { accounts: unknown[] };
    expect(Array.isArray(data.accounts)).toBe(true);
    if (data.accounts.length > 0) {
      const first = data.accounts[0] as Record<string, unknown>;
      expect(first.currentValuePaise).toBeDefined();
      expect(first.totalContributionsPaise).toBeDefined();
    }
  });
});

describe("GET /api/v1/accounts/[id]", () => {
  it("should return 404 for non-existent id", async () => {
    const res = await GET_ONE(
      new Request("http://localhost/api/v1/accounts/nonexistent"),
      { params: Promise.resolve({ id: "nonexistent" }) },
    );
    expect(res.status).toBe(404);
  });

  it("should return account with currentValue for existing id", async () => {
    const createRes = await POST(
      new Request("http://localhost/api/v1/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "epf",
          name: "EPF Account",
          initialBalancePaise: 50000_00,
        }),
      }),
    );
    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as { id: string };
    const res = await GET_ONE(
      new Request(`http://localhost/api/v1/accounts/${created.id}`),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.id).toBe(created.id);
    expect(data.currentValuePaise).toBe(50000_00);
  });
});

describe("PATCH /api/v1/accounts/[id]", () => {
  it("should update name and return 200", async () => {
    const createRes = await POST(
      new Request("http://localhost/api/v1/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "nps",
          name: "NPS Old",
          initialBalancePaise: 0,
        }),
      }),
    );
    const created = (await createRes.json()) as { id: string };
    const res = await PATCH(
      new Request(`http://localhost/api/v1/accounts/${created.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "NPS Updated" }),
      }),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { name: string };
    expect(data.name).toBe("NPS Updated");
  });
});

describe("DELETE /api/v1/accounts/[id]", () => {
  it("should return 400 when confirm is not true", async () => {
    const createRes = await POST(
      new Request("http://localhost/api/v1/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "gratuity",
          name: "To Delete",
          initialBalancePaise: 0,
        }),
      }),
    );
    const created = (await createRes.json()) as { id: string };
    const res = await DELETE(
      new Request(`http://localhost/api/v1/accounts/${created.id}`),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(res.status).toBe(400);
    const data = (await res.json()) as { code: string };
    expect(data.code).toBe("CONFIRM_REQUIRED");
  });

  it("should delete account and return 204 when confirm=true", async () => {
    const createRes = await POST(
      new Request("http://localhost/api/v1/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "stocks",
          name: "Delete Me",
          initialBalancePaise: 0,
        }),
      }),
    );
    const created = (await createRes.json()) as { id: string };
    const res = await DELETE(
      new Request(`http://localhost/api/v1/accounts/${created.id}?confirm=true`),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(res.status).toBe(204);
    const found = await prisma.account.findUnique({
      where: { id: created.id },
    });
    expect(found).toBeNull();
  });
});
