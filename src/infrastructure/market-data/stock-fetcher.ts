/**
 * Fetch stock price. Uses Yahoo Finance chart API (public); no key required for read.
 * Returns price in paise and date.
 */

import * as cache from "./cache";

export interface StockQuote {
	pricePerSharePaise: number;
	date: string; // YYYY-MM-DD
}

export async function fetchPrice(ticker: string): Promise<StockQuote | null> {
	const cached = cache.getStockPrice(ticker);
	if (cached)
		return { pricePerSharePaise: cached.pricePaise, date: cached.date };

	try {
		// Yahoo Finance v8 chart API - returns latest close
		const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`;
		const res = await fetch(url, {
			headers: {
				Accept: "application/json",
				"User-Agent": "Mozilla/5.0 (compatible; InvTracker/1.0)",
			},
		});
		if (!res.ok) return null;
		const data = (await res.json()) as {
			chart?: {
				result?: Array<{
					meta?: { regularMarketPrice?: number };
					timestamp?: number[];
				}>;
			};
		};
		const result = data?.chart?.result?.[0];
		const price = result?.meta?.regularMarketPrice;
		const timestamps = result?.timestamp;
		if (price == null || Number.isNaN(price) || price < 0) return null;
		const pricePaise = Math.round(price * 100);
		const date = timestamps?.length
			? new Date((timestamps[timestamps.length - 1] ?? 0) * 1000)
					.toISOString()
					.slice(0, 10)
			: new Date().toISOString().slice(0, 10);
		cache.setStockPrice(ticker, pricePaise, date);
		return { pricePerSharePaise: pricePaise, date };
	} catch {
		return null;
	}
}
