/**
 * GET  /api/v1/valuations/rates/deposit/[accountId] - Get deposit rate config
 * PUT  /api/v1/valuations/rates/deposit/[accountId] - Set deposit rate and frequency
 */

import { NextResponse } from "next/server";
import { getDepositConfig } from "@/application/valuation/get-deposit-config";
import { setDepositConfig } from "@/application/valuation/set-deposit-config";
import * as accountRepo from "@/infrastructure/prisma/account-repository";
import type { CompoundingFrequency } from "@/domain/valuation/types";

const FREQUENCIES: CompoundingFrequency[] = ["monthly", "quarterly", "annual"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ accountId: string }> },
) {
  try {
    const { accountId } = await params;
    const account = await accountRepo.findAccountById(accountId);
    if (!account) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Account not found" },
        { status: 404 },
      );
    }
    const config = await getDepositConfig(accountId);
    if (!config) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "No rate config for this account" },
        { status: 404 },
      );
    }
    return NextResponse.json(config);
  } catch (e) {
    console.error("GET /api/v1/valuations/rates/deposit/[accountId]", e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ accountId: string }> },
) {
  try {
    const { accountId } = await params;
    const account = await accountRepo.findAccountById(accountId);
    if (!account) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Account not found" },
        { status: 404 },
      );
    }
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Request body must be a JSON object" },
        { status: 400 },
      );
    }
    const { ratePercentPerAnnum, compoundingFrequency } = body as Record<string, unknown>;
    if (
      typeof ratePercentPerAnnum !== "number" ||
      ratePercentPerAnnum < 0
    ) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "ratePercentPerAnnum must be a non-negative number" },
        { status: 400 },
      );
    }
    if (
      typeof compoundingFrequency !== "string" ||
      !FREQUENCIES.includes(compoundingFrequency as CompoundingFrequency)
    ) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: `compoundingFrequency must be one of: ${FREQUENCIES.join(", ")}` },
        { status: 400 },
      );
    }
    const result = await setDepositConfig(
      accountId,
      ratePercentPerAnnum,
      compoundingFrequency as CompoundingFrequency,
    );
    if (!result) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Account not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error("PUT /api/v1/valuations/rates/deposit/[accountId]", e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500 },
    );
  }
}
