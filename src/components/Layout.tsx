"use client";

import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
	{
		href: "/dashboard",
		label: "Dashboard",
		icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1",
	},
	{
		href: "/accounts",
		label: "Accounts",
		icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
	},
	{
		href: "/transactions",
		label: "Transactions",
		icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
	},
	{
		href: "/valuations",
		label: "Valuations",
		icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
	},
	{
		href: "/charts",
		label: "Charts",
		icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
	},
	{
		href: "/insights",
		label: "AI Insights",
		icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
	},
	{
		href: "/data",
		label: "Import / Export",
		icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M8 11h2m4 0h2M8 15h2m4 0h2",
	},
];

function NavIcon({ d }: { d: string }) {
	return (
		<svg
			className="h-4 w-4 shrink-0"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<title>nav</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d={d}
			/>
		</svg>
	);
}

function NavLink({
	href,
	label,
	icon,
	active,
	onClick,
}: {
	href: string;
	label: string;
	icon: string;
	active: boolean;
	onClick?: () => void;
}) {
	return (
		<Link
			href={href}
			onClick={onClick}
			className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
				active
					? "bg-white/15 font-medium text-white"
					: "text-indigo-200 hover:bg-white/10 hover:text-white"
			}`}
		>
			<NavIcon d={icon} />
			{label}
		</Link>
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	async function handleLogout() {
		await apiFetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
		router.push("/login");
		router.refresh();
	}

	const sidebarContent = (
		<>
			<div className="px-5 py-5">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
						<svg
							className="h-4 w-4 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<title>logo</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
							/>
						</svg>
					</div>
					<span className="font-semibold text-white text-sm tracking-wide">
						InvestTrack
					</span>
				</div>
			</div>
			<nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5">
				{NAV_LINKS.map((l) => (
					<NavLink
						key={l.href}
						href={l.href}
						label={l.label}
						icon={l.icon}
						active={pathname === l.href}
						onClick={mobileOpen ? () => setMobileOpen(false) : undefined}
					/>
				))}
			</nav>
			<div className="p-3 border-t border-white/10">
				<button
					type="button"
					onClick={handleLogout}
					className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-indigo-300 hover:bg-white/10 hover:text-white transition-colors"
				>
					<NavIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					Logout
				</button>
			</div>
		</>
	);

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Desktop sidebar */}
			<aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-56 flex-col bg-gradient-to-b from-indigo-900 to-indigo-950 z-30">
				{sidebarContent}
			</aside>

			{/* Mobile top bar */}
			<header className="lg:hidden sticky top-0 z-30 bg-indigo-900 px-4 py-3 flex items-center justify-between shadow-md">
				<div className="flex items-center gap-2">
					<div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/20">
						<svg
							className="h-3.5 w-3.5 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<title>logo</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
							/>
						</svg>
					</div>
					<span className="font-semibold text-white text-sm">InvestTrack</span>
				</div>
				<button
					type="button"
					onClick={() => setMobileOpen(true)}
					className="rounded-md p-1.5 hover:bg-white/10 transition-colors"
					aria-label="Open navigation"
				>
					<svg
						className="h-5 w-5 text-indigo-200"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<title>Open menu</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
			</header>

			{/* Mobile drawer */}
			{mobileOpen && (
				<div className="lg:hidden fixed inset-0 z-50">
					<div
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
						role="button"
						tabIndex={0}
						aria-label="Close navigation overlay"
						onClick={() => setMobileOpen(false)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") setMobileOpen(false);
						}}
					/>
					<aside className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-indigo-900 to-indigo-950 flex flex-col shadow-2xl">
						<div className="flex items-center justify-between px-5 py-5">
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
									<svg
										className="h-4 w-4 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<title>logo</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
										/>
									</svg>
								</div>
								<span className="font-semibold text-white text-sm">
									InvestTrack
								</span>
							</div>
							<button
								type="button"
								onClick={() => setMobileOpen(false)}
								className="rounded-md p-1 hover:bg-white/10 transition-colors"
								aria-label="Close navigation"
							>
								<svg
									className="h-5 w-5 text-indigo-300"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>Close menu</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5">
							{NAV_LINKS.map((l) => (
								<NavLink
									key={l.href}
									href={l.href}
									label={l.label}
									icon={l.icon}
									active={pathname === l.href}
									onClick={() => setMobileOpen(false)}
								/>
							))}
						</nav>
						<div className="p-3 border-t border-white/10">
							<button
								type="button"
								onClick={handleLogout}
								className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-indigo-300 hover:bg-white/10 hover:text-white transition-colors"
							>
								<NavIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								Logout
							</button>
						</div>
					</aside>
				</div>
			)}

			{/* Main content */}
			<main className="lg:ml-56 min-h-screen">
				<div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
					{children}
				</div>
			</main>
		</div>
	);
}
