"use client";

import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number): number {
	return 1 - (1 - t) ** 3;
}

export function useCountUp(
	target: number,
	duration = 800,
	enabled = true,
): number {
	const [value, setValue] = useState(0);
	const prevTarget = useRef(0);

	useEffect(() => {
		if (!enabled) {
			setValue(target);
			return;
		}

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReducedMotion) {
			setValue(target);
			return;
		}

		const from = prevTarget.current;
		prevTarget.current = target;
		const delta = target - from;
		if (delta === 0) {
			setValue(target);
			return;
		}

		let start: number | null = null;
		let rafId: number;

		function tick(timestamp: number) {
			if (start === null) start = timestamp;
			const elapsed = timestamp - start;
			const progress = Math.min(elapsed / duration, 1);
			const easedProgress = easeOutCubic(progress);

			setValue(Math.round(from + delta * easedProgress));

			if (progress < 1) {
				rafId = requestAnimationFrame(tick);
			}
		}

		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
	}, [target, duration, enabled]);

	return value;
}
