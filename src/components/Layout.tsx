"use client";

import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
	BarChart3,
	Database,
	DollarSign,
	FileSpreadsheet,
	LineChart,
	Home,
	Lightbulb,
	LogOut,
	Menu,
	TrendingUp,
	UserCircle2,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ElementType } from "react";
import { useEffect, useRef, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem {
	href: string;
	label: string;
	icon: ElementType;
}

const NAV_LINKS: NavItem[] = [
	{ href: "/dashboard", label: "Dashboard", icon: Home },
	{ href: "/accounts", label: "Accounts", icon: TrendingUp },
	{ href: "/employment", label: "Employment", icon: UserCircle2 },
	{ href: "/transactions", label: "Transactions", icon: DollarSign },
	{ href: "/valuations", label: "Valuations", icon: FileSpreadsheet },
	{ href: "/charts", label: "Charts", icon: BarChart3 },
	{ href: "/projections", label: "Projections", icon: LineChart },
	{ href: "/insights", label: "AI Insights", icon: Lightbulb },
	{ href: "/data", label: "Import / Export", icon: Database },
];

function NavLink({
	href,
	label,
	icon: Icon,
	active,
	onClick,
}: NavItem & { active: boolean; onClick?: () => void }) {
	return (
		<Link
			href={href}
			onClick={onClick}
			className={cn(
				"group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
				active
					? "text-sidebar-accent-foreground font-medium bg-sidebar-accent/10"
					: "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/5",
			)}
		>
			{active && (
				<span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-sidebar-accent dark:glow-border" />
			)}
			<Icon
				className={cn(
					"h-4 w-4 shrink-0 transition-colors duration-200",
					active
						? "text-sidebar-accent"
						: "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80",
				)}
			/>
			<span>{label}</span>
		</Link>
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [logoutOpen, setLogoutOpen] = useState(false);
	const drawerRef = useRef<HTMLDivElement | null>(null);

	async function handleLogout() {
		await apiFetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
		router.push("/login");
		router.refresh();
	}

	useEffect(() => {
		if (mobileOpen && drawerRef.current) {
			const drawer = drawerRef.current;
			const focusable = drawer.querySelectorAll<HTMLElement>(
				'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);
			focusable[0]?.focus();
		}
	}, [mobileOpen]);

	function handleDrawerKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
		if (e.key === "Escape") {
			e.stopPropagation();
			setMobileOpen(false);
			return;
		}
		if (e.key !== "Tab") return;
		const drawer = drawerRef.current;
		if (!drawer) return;
		const focusable = drawer.querySelectorAll<HTMLElement>(
			'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else if (document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	const sidebarContent = (
		<>
			{/* Logo */}
			<div className="px-5 py-5">
				<div className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-sidebar-accent/15">
						<TrendingUp className="h-4 w-4 text-primary dark:text-sidebar-accent" />
					</div>
					<span className="font-semibold text-sm tracking-wide text-sidebar-foreground">
						InvestTrack
					</span>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5">
				{NAV_LINKS.map((l) => (
					<NavLink
						key={l.href}
						{...l}
						active={
							l.href === "/dashboard"
								? pathname === "/dashboard"
								: pathname.startsWith(l.href)
						}
						onClick={mobileOpen ? () => setMobileOpen(false) : undefined}
					/>
				))}
			</nav>

			{/* Bottom section */}
			<div className="p-3 space-y-2 border-t border-sidebar-border">
				<div className="px-3 py-1">
					<ThemeToggle />
				</div>
				<button
					type="button"
					onClick={() => setLogoutOpen(true)}
					className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/5 transition-all duration-200"
				>
					<LogOut className="h-4 w-4" />
					Logout
				</button>
			</div>
		</>
	);

	return (
		<div className="min-h-screen bg-background">
			{/* Desktop sidebar */}
			<aside
				className={cn(
					"hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-56 flex-col z-30",
					"bg-sidebar border-r border-sidebar-border",
					"dark:backdrop-blur-xl dark:bg-sidebar/80 dark:border-sidebar-accent/10 dark:shadow-[1px_0_15px_-3px_hsl(var(--sidebar-accent)/0.15)]",
				)}
			>
				{sidebarContent}
			</aside>

			{/* Mobile top bar */}
			<header className="lg:hidden sticky top-0 z-30 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between dark:backdrop-blur-xl dark:bg-sidebar/80">
				<div className="flex items-center gap-2.5">
					<div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 dark:bg-sidebar-accent/15">
						<TrendingUp className="h-3.5 w-3.5 text-primary dark:text-sidebar-accent" />
					</div>
					<span className="font-semibold text-sidebar-foreground text-sm">
						InvestTrack
					</span>
				</div>
				<button
					type="button"
					onClick={() => setMobileOpen(true)}
					className="rounded-md p-1.5 hover:bg-sidebar-accent/10 transition-colors"
					aria-label="Open navigation"
				>
					<Menu className="h-5 w-5 text-sidebar-foreground/70" />
				</button>
			</header>

			{/* Mobile drawer */}
			{mobileOpen && (
				<div className="lg:hidden fixed inset-0 z-50">
					<div
						className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
						role="presentation"
						aria-hidden="true"
						onClick={() => setMobileOpen(false)}
					/>
					<aside
						ref={drawerRef}
						className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col shadow-2xl dark:bg-sidebar/95 dark:backdrop-blur-xl dark:border-r dark:border-sidebar-accent/10"
						role="dialog"
						aria-modal="true"
						aria-label="Mobile navigation"
						onKeyDown={handleDrawerKeyDown}
					>
						<div className="flex items-center justify-between px-5 py-5">
							<div className="flex items-center gap-2.5">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-sidebar-accent/15">
									<TrendingUp className="h-4 w-4 text-primary dark:text-sidebar-accent" />
								</div>
								<span className="font-semibold text-sidebar-foreground text-sm">
									InvestTrack
								</span>
							</div>
							<button
								type="button"
								onClick={() => setMobileOpen(false)}
								className="rounded-md p-1 hover:bg-sidebar-accent/10 transition-colors"
								aria-label="Close navigation"
							>
								<X className="h-5 w-5 text-sidebar-foreground/60" />
							</button>
						</div>
						<nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5">
							{NAV_LINKS.map((l) => (
								<NavLink
									key={l.href}
									{...l}
									active={
										l.href === "/dashboard"
											? pathname === "/dashboard"
											: pathname.startsWith(l.href)
									}
									onClick={() => setMobileOpen(false)}
								/>
							))}
						</nav>
						<div className="p-3 space-y-2 border-t border-sidebar-border">
							<div className="px-3 py-1">
								<ThemeToggle />
							</div>
							<button
								type="button"
									onClick={() => setLogoutOpen(true)}
								className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/5 transition-all duration-200"
							>
								<LogOut className="h-4 w-4" />
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

			<Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>Log out?</DialogTitle>
						<DialogDescription>
							Are you sure you want to log out of InvestTrack?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							variant="outline"
							onClick={() => setLogoutOpen(false)}
							type="button"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							type="button"
							onClick={() => {
								setLogoutOpen(false);
								void handleLogout();
							}}
						>
							Log out
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
