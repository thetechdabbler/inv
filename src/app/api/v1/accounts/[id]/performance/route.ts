/**
 * GET /api/v1/accounts/:id/performance - Performance snapshot for one account
 */

import { NextResponse } from "next/server";
import { getAccountPerformance } from "@/application/portfolio/get-account-performance";

function notFound() {
  return NextResponse.json(
    { code: "NOT_FOUND", message: "Account not found" },
    { status: 404 },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const snapshot = await getAccountPerformance(id);
    if (!snapshot) return notFound();
    return NextResponse.json(snapshot);
  } catch (e) {
    console.error("GET /api/v1/accounts/[id]/performance", e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500 },
    );
  }
}
