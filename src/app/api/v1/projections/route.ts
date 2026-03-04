import { computePortfolioProjections } from "@/application/portfolio/compute-projections";
import type { ProjectionScope, ProjectionsResponse } from "@/types/api";
import { NextResponse } from "next/server";

function validationError(message: string) {
	return NextResponse.json({ code: "VALIDATION_ERROR", message }, { status: 400 });
}

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const scope = url.searchParams.get("scope") as ProjectionScope | null;
		const accountId = url.searchParams.get("accountId") ?? undefined;

		if (!scope || (scope !== "portfolio" && scope !== "account")) {
			return validationError('scope must be "portfolio" or "account"');
		}
		if (scope === "account" && !accountId) {
			return validationError("accountId is required when scope=account");
		}

		const horizonMonthsRaw = Number(url.searchParams.get("horizonMonths") ?? "12");
		const horizonYearsQoqRaw = Number(
			url.searchParams.get("horizonYearsQoq") ?? "5",
		);
		const horizonYearsYoyRaw = Number(
			url.searchParams.get("horizonYearsYoy") ?? "30",
		);

		const result: ProjectionsResponse = await computePortfolioProjections({
			scope,
			accountId,
			horizonMonths: horizonMonthsRaw,
			horizonYearsQoq: horizonYearsQoqRaw,
			horizonYearsYoy: horizonYearsYoyRaw,
		});

		return NextResponse.json(result);
	} catch (e) {
		console.error("GET /api/v1/projections", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}

