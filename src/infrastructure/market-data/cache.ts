/**
 * In-memory cache for NAV/price with TTL. Key: mf:{schemeCode} or stock:{ticker}.
 */

interface CacheEntry {
	valuePaise: number;
	date: string; // ISO date
	expiresAt: number; // timestamp
}

const store = new Map<string, CacheEntry>();

const MF_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const STOCK_TTL_MS = 15 * 60 * 1000; // 15min

export function getMfNav(
	schemeCode: string,
): { navPaise: number; date: string } | null {
	const key = `mf:${schemeCode}`;
	const entry = store.get(key);
	if (!entry || Date.now() > entry.expiresAt) return null;
	return { navPaise: entry.valuePaise, date: entry.date };
}

export function setMfNav(
	schemeCode: string,
	navPaise: number,
	date: string,
): void {
	store.set(`mf:${schemeCode}`, {
		valuePaise: navPaise,
		date,
		expiresAt: Date.now() + MF_TTL_MS,
	});
}

export function getStockPrice(
	ticker: string,
): { pricePaise: number; date: string } | null {
	const key = `stock:${ticker}`;
	const entry = store.get(key);
	if (!entry || Date.now() > entry.expiresAt) return null;
	return { pricePaise: entry.valuePaise, date: entry.date };
}

export function setStockPrice(
	ticker: string,
	pricePaise: number,
	date: string,
): void {
	store.set(`stock:${ticker}`, {
		valuePaise: pricePaise,
		date,
		expiresAt: Date.now() + STOCK_TTL_MS,
	});
}
