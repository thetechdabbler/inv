/**
 * POST /api/v1/transactions - Log investment or withdrawal
 */

import { NextResponse } from "next/server";
import { logTransaction } from "@/application/portfolio/log-transaction";
import {
  TRANSACTION_TYPES,
  type TransactionType,
} from "@/domain/portfolio/types";

function validationError(message: string) {
  return NextResponse.json(
    { code: "VALIDATION_ERROR", message },
    { status: 400 },
  );
}

function notFound() {
  return NextResponse.json(
    { code: "NOT_FOUND", message: "Account not found" },
    { status: 404 },
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object") {
      return validationError("Request body must be a JSON object");
    }
    const { accountId, date, amountPaise, type, description } = body as Record<
      string,
      unknown
    >;
    if (typeof accountId !== "string" || !accountId.trim()) {
      return validationError("accountId is required");
    }
    if (
      typeof amountPaise !== "number" ||
      !Number.isInteger(amountPaise) ||
      amountPaise <= 0
    ) {
      return validationError("amountPaise must be a positive integer");
    }
    if (typeof type !== "string" || !TRANSACTION_TYPES.includes(type as TransactionType)) {
      return validationError(
        `type must be one of: ${TRANSACTION_TYPES.join(", ")}`,
      );
    }
    const dateObj = date !== undefined && date !== null
      ? (typeof date === "string" ? new Date(date) : new Date(Number(date)))
      : new Date();
    if (Number.isNaN(dateObj.getTime())) {
      return validationError("date must be a valid ISO date string");
    }
    const desc =
      description !== undefined && description !== null
        ? String(description)
        : undefined;
    const transaction = await logTransaction({
      accountId: accountId.trim(),
      date: dateObj,
      amountPaise,
      type: type as TransactionType,
      description: desc ?? null,
    });
    if (!transaction) return notFound();
    return NextResponse.json(
      {
        id: transaction.id,
        accountId: transaction.accountId,
        date: transaction.date.toISOString().slice(0, 10),
        amountPaise: transaction.amountPaise,
        type: transaction.type,
        description: transaction.description,
        createdAt: transaction.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("POST /api/v1/transactions", e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500 },
    );
  }
}
