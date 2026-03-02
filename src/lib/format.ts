/**
 * Format paise as INR for display. ADR-001: amounts in paise; convert at presentation.
 */

export function paiseToInr(paise: number): number {
	return paise / 100;
}

/**
 * Format number in Indian style (lakhs/crores). E.g. 1,00,000 or 1.5 Cr
 */
export function formatIndian(paise: number): string {
	const inr = paiseToInr(paise);
	if (Math.abs(inr) >= 1_00_00_000) {
		const cr = inr / 1_00_00_000;
		return `₹${cr.toFixed(1)} Cr`;
	}
	if (Math.abs(inr) >= 1_00_000) {
		const lac = inr / 1_00_000;
		return `₹${lac.toFixed(1)} L`;
	}
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
		minimumFractionDigits: 0,
	}).format(inr);
}

export function formatInr(paise: number): string {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 2,
		minimumFractionDigits: 0,
	}).format(paiseToInr(paise));
}
