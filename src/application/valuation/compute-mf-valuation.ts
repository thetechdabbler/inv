/**
 * Compute MF valuation: fetch NAV, value = units × NAV (paise), persist Valuation.
 * On fetch failure, return last valuation + warning (fallback).
 */

import { fetchNav } from "@/infrastructure/market-data/mfapi-fetcher";
import * as configRepo from "@/infrastructure/prisma/account-market-config-repository";
import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";
import { findLatestValuationByAccountId } from "@/infrastructure/prisma/valuation-repository";

export type ComputeMFResult =
	| { ok: true; valuePaise: number; asOfDate: Date; source: "api" | "cache" }
	| { ok: false; fallbackValuePaise: number; asOfDate: Date; warning: string }
	| { error: "account_not_found" }
	| { error: "account_type_mismatch" }
	| { error: "market_config_required" }
	| { error: "fetch_failed_no_previous" };

export async function computeMFValuation(
	accountId: string,
	asOfDate: Date,
): Promise<ComputeMFResult> {
	const account = await accountRepo.findAccountById(accountId);
	if (!account) return { error: "account_not_found" };
	if (account.type !== "mutual_fund") return { error: "account_type_mismatch" };

	const config = await configRepo.getMarketConfig(accountId);
	const schemeCode = config?.schemeCode?.trim();
	const units = config?.units;
	if (!schemeCode || units == null || units <= 0)
		return { error: "market_config_required" };

	const quote = await fetchNav(schemeCode);
	if (quote) {
		const valuePaise = Math.round(units * quote.navPerUnitPaise);
		const quoteDate = parseNavDate(quote.date);
		await valuationRepo.createValuation(accountId, quoteDate, valuePaise);
		return {
			ok: true,
			valuePaise,
			asOfDate: quoteDate,
			source: "api", // cache is inside fetchNav
		};
	}

	const lastV = await findLatestValuationByAccountId(accountId);
	if (lastV) {
		return {
			ok: false,
			fallbackValuePaise: lastV.valuePaise,
			asOfDate: lastV.date,
			warning: "Fetch failed; showing last known value",
		};
	}
	return { error: "fetch_failed_no_previous" };
}

function parseNavDate(dateStr: string): Date {
	// mfapi.in may return dd-mm-yyyy or yyyy-mm-dd
	const d = dateStr.trim();
	if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(d);
	const [day, month, year] = d.split("-").map(Number);
	if (year && month && day) return new Date(year, month - 1, day);
	return new Date(d);
}
