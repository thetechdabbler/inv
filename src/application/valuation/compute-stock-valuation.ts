/**
 * Compute stock valuation: fetch price, value = shares × price (paise), persist Valuation.
 * On fetch failure, return last valuation + warning (fallback).
 */

import { fetchPrice } from "@/infrastructure/market-data/stock-fetcher";
import * as configRepo from "@/infrastructure/prisma/account-market-config-repository";
import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";

export type ComputeStockResult =
	| { ok: true; valuePaise: number; asOfDate: Date; source: "api" | "cache" }
	| { ok: false; fallbackValuePaise: number; asOfDate: Date; warning: string }
	| { error: "account_not_found" }
	| { error: "account_type_mismatch" }
	| { error: "market_config_required" }
	| { error: "fetch_failed_no_previous" };

export async function computeStockValuation(
	accountId: string,
	asOfDate: Date,
): Promise<ComputeStockResult> {
	const account = await accountRepo.findAccountById(accountId);
	if (!account) return { error: "account_not_found" };
	if (account.type !== "stocks") return { error: "account_type_mismatch" };

	const config = await configRepo.getMarketConfig(accountId);
	const ticker = config?.ticker?.trim();
	const shares = config?.shares;
	if (!ticker || shares == null || shares <= 0)
		return { error: "market_config_required" };

	const quote = await fetchPrice(ticker);
	if (quote) {
		const valuePaise = Math.round(shares * quote.pricePerSharePaise);
		const quoteDate = new Date(quote.date);
		await valuationRepo.createValuation(accountId, quoteDate, valuePaise);
		return {
			ok: true,
			valuePaise,
			asOfDate: quoteDate,
			source: "api",
		};
	}

	const lastV = await valuationRepo.findLatestValuationByAccountId(accountId);
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
