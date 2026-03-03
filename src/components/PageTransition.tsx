"use client";

interface PageTransitionProps {
	children: React.ReactNode;
	className?: string;
}

export function PageTransition({
	children,
	className = "",
}: PageTransitionProps) {
	return (
		<div className={`motion-safe:animate-fade-in ${className}`.trim()}>
			{children}
		</div>
	);
}
