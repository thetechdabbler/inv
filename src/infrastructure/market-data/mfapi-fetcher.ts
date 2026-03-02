/**
 * Fetch MF NAV from mfapi.in. Returns nav in paise and date.
 */

import * as cache from "./cache";

const BASE = "https://api.mfapi.in/mf";

export interface NavQuote {
	navPerUnitPaise: number;
	date: string; // YYYY-MM-DD
}

export async function fetchNav(schemeCode: string): Promise<NavQuote | null> {
	const cached = cache.getMfNav(schemeCode);
	if (cached) return { navPerUnitPaise: cached.navPaise, date: cached.date };

	try {
		const res = await fetch(`${BASE}/${schemeCode}`, {
			headers: { Accept: "application/json" },
		});
		if (!res.ok) return null;
		const data = (await res.json()) as {
			data?: Array<{ date: string; nav: string }>;
		};
		const list = data?.data;
		if (!Array.isArray(list) || list.length === 0) return null;
		const latest = list[list.length - 1];
		const navRupees = Number.parseFloat(latest.nav);
		if (Number.isNaN(navRupees) || navRupees < 0) return null;
		const navPaise = Math.round(navRupees * 100);
		const date = latest.date; // format from API e.g. 02-03-2026 -> normalize if needed
		cache.setMfNav(schemeCode, navPaise, date);
		return { navPerUnitPaise: navPaise, date };
	} catch {
		return null;
	}
}
