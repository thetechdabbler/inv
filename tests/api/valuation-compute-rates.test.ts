/**
 * Integration tests for valuation compute and rates APIs (bolt 003-valuation-engine).
 */
import { describe, it, expect } from "vitest";
import { POST as POST_ACCOUNT } from "@/app/api/v1/accounts/route";
import { POST as POST_PPF_COMPUTE } from "@/app/api/v1/valuations/compute/ppf/[accountId]/route";
import { POST as POST_EPF_COMPUTE } from "@/app/api/v1/valuations/compute/epf/[accountId]/route";
import { POST as POST_DEPOSIT_COMPUTE } from "@/app/api/v1/valuations/compute/deposit/[accountId]/route";
import { GET as GET_PPF_RATES, PUT as PUT_PPF_RATE } from "@/app/api/v1/valuations/rates/ppf/route";
import { GET as GET_EPF_RATES, PUT as PUT_EPF_RATE } from "@/app/api/v1/valuations/rates/epf/route";
import { GET as GET_DEPOSIT_CONFIG, PUT as PUT_DEPOSIT_CONFIG } from "@/app/api/v1/valuations/rates/deposit/[accountId]/route";
import { prisma } from "@/infrastructure/prisma/client";

async function createAccount(type: string, name: string, initialPaise: number) {
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

describe("GET/PUT /api/v1/valuations/rates/ppf", () => {
  it("should return empty rates then set and get rate for a year", async () => {
    const getRes = await GET_PPF_RATES();
    expect(getRes.status).toBe(200);
    const getData = (await getRes.json()) as { rates: unknown[] };
    expect(Array.isArray(getData.rates)).toBe(true);

    const putRes = await PUT_PPF_RATE(
      new Request("http://localhost/api/v1/valuations/rates/ppf", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ financialYear: 2024, ratePercentPerAnnum: 7.1 }),
      }),
    );
    expect(putRes.status).toBe(200);
    const putData = (await putRes.json()) as { financialYear: number; ratePercentPerAnnum: number };
    expect(putData.financialYear).toBe(2024);
    expect(putData.ratePercentPerAnnum).toBe(7.1);

    const getRes2 = await GET_PPF_RATES();
    expect(getRes2.status).toBe(200);
    const getData2 = (await getRes2.json()) as { rates: { financialYear: number; ratePercentPerAnnum: number }[] };
    expect(getData2.rates.length).toBeGreaterThanOrEqual(1);
    const r2024 = getData2.rates.find((r) => r.financialYear === 2024);
    expect(r2024?.ratePercentPerAnnum).toBe(7.1);
  });

  it("should reject invalid financial year with 400", async () => {
    const res = await PUT_PPF_RATE(
      new Request("http://localhost/api/v1/valuations/rates/ppf", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ financialYear: 1999, ratePercentPerAnnum: 7 }),
      }),
    );
    expect(res.status).toBe(400);
  });
});

describe("GET/PUT /api/v1/valuations/rates/epf", () => {
  it("should set and get EPF rate for a year", async () => {
    const putRes = await PUT_EPF_RATE(
      new Request("http://localhost/api/v1/valuations/rates/epf", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ financialYear: 2024, ratePercentPerAnnum: 8.25 }),
      }),
    );
    expect(putRes.status).toBe(200);
    const getRes = await GET_EPF_RATES();
    expect(getRes.status).toBe(200);
    const data = (await getRes.json()) as { rates: { financialYear: number }[] };
    expect(data.rates.some((r) => r.financialYear === 2024)).toBe(true);
  });
});

describe("POST /api/v1/valuations/compute/ppf/[accountId]", () => {
  it("should return 404 for non-existent account", async () => {
    const res = await POST_PPF_COMPUTE(
      new Request("http://localhost/api/v1/valuations/compute/ppf/nonexistent"),
      { params: Promise.resolve({ accountId: "nonexistent" }) },
    );
    expect(res.status).toBe(404);
  });

  it("should return 409 when account is not ppf", async () => {
    const account = await createAccount("epf", "EPF Test", 100000);
    const res = await POST_PPF_COMPUTE(
      new Request(`http://localhost/api/v1/valuations/compute/ppf/${account.id}`),
      { params: Promise.resolve({ accountId: account.id }) },
    );
    expect(res.status).toBe(409);
    const data = (await res.json()) as { code: string };
    expect(data.code).toBe("ACCOUNT_TYPE_MISMATCH");
  });

  it("should compute PPF and return 201 with valuePaise and create Valuation", async () => {
    const account = await createAccount("ppf", "PPF Compute Test", 100000); // 1000 INR
    const res = await POST_PPF_COMPUTE(
      new Request(`http://localhost/api/v1/valuations/compute/ppf/${account.id}`),
      { params: Promise.resolve({ accountId: account.id }) },
    );
    expect(res.status).toBe(201);
    const data = (await res.json()) as { valuePaise: number; asOfDate: string; method: string };
    expect(data.method).toBe("ppf");
    expect(typeof data.valuePaise).toBe("number");
    expect(data.valuePaise).toBeGreaterThanOrEqual(0);
    expect(data.asOfDate).toBeDefined();

    const valuations = await prisma.valuation.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    expect(valuations.length).toBe(1);
    expect(valuations[0].valuePaise).toBe(data.valuePaise);
  });
});

describe("POST /api/v1/valuations/compute/epf/[accountId]", () => {
  it("should compute EPF and return 201", async () => {
    const account = await createAccount("epf", "EPF Compute Test", 50000);
    const res = await POST_EPF_COMPUTE(
      new Request(`http://localhost/api/v1/valuations/compute/epf/${account.id}`),
      { params: Promise.resolve({ accountId: account.id }) },
    );
    expect(res.status).toBe(201);
    const data = (await res.json()) as { valuePaise: number; method: string };
    expect(data.method).toBe("epf");
    expect(typeof data.valuePaise).toBe("number");
  });
});

describe("GET/PUT /api/v1/valuations/rates/deposit/[accountId]", () => {
  it("should return 404 when no config", async () => {
    const account = await createAccount("bank_deposit", "Deposit No Config", 0);
    const res = await GET_DEPOSIT_CONFIG(
      new Request(`http://localhost/api/v1/valuations/rates/deposit/${account.id}`),
      { params: Promise.resolve({ accountId: account.id }) },
    );
    expect(res.status).toBe(404);
  });

  it("should set and get deposit config", async () => {
    const account = await createAccount("bank_deposit", "Deposit With Config", 100000);
    const putRes = await PUT_DEPOSIT_CONFIG(
      new Request(`http://localhost/api/v1/valuations/rates/deposit/${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratePercentPerAnnum: 6.5,
          compoundingFrequency: "quarterly",
        }),
      }),
      { params: Promise.resolve({ accountId: account.id }) },
    );
    expect(putRes.status).toBe(200);
    const putData = (await putRes.json()) as { ratePercentPerAnnum: number; compoundingFrequency: string };
    expect(putData.ratePercentPerAnnum).toBe(6.5);
    expect(putData.compoundingFrequency).toBe("quarterly");

    const getRes = await GET_DEPOSIT_CONFIG(
      new Request(`http://localhost/api/v1/valuations/rates/deposit/${account.id}`),
      { params: Promise.resolve({ accountId: account.id }) },
    );
    expect(getRes.status).toBe(200);
    const getData = (await getRes.json()) as { ratePercentPerAnnum: number };
    expect(getData.ratePercentPerAnnum).toBe(6.5);
  });
});

describe("POST /api/v1/valuations/compute/deposit/[accountId]", () => {
  it("should return 400 when no rate config for account", async () => {
    const account = await createAccount("bank_deposit", "Deposit No Rate", 10000);
    const res = await POST_DEPOSIT_COMPUTE(
      new Request(`http://localhost/api/v1/valuations/compute/deposit/${account.id}`),
      { params: Promise.resolve({ accountId: account.id }) },
    );
    expect(res.status).toBe(400);
    const data = (await res.json()) as { code: string };
    expect(data.code).toBe("RATE_CONFIG_REQUIRED");
  });

  it("should compute deposit and return 201 when config set", async () => {
    const account = await createAccount("bank_deposit", "Deposit Compute Test", 100000);
    await PUT_DEPOSIT_CONFIG(
      new Request(`http://localhost/api/v1/valuations/rates/deposit/${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratePercentPerAnnum: 7,
          compoundingFrequency: "annual",
        }),
      }),
      { params: Promise.resolve({ accountId: account.id }) },
    );
    const res = await POST_DEPOSIT_COMPUTE(
      new Request(`http://localhost/api/v1/valuations/compute/deposit/${account.id}`),
      { params: Promise.resolve({ accountId: account.id }) },
    );
    expect(res.status).toBe(201);
    const data = (await res.json()) as { valuePaise: number; method: string };
    expect(data.method).toBe("deposit");
    expect(typeof data.valuePaise).toBe("number");
    expect(data.valuePaise).toBeGreaterThanOrEqual(100000);
  });
});
