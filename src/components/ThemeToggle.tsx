"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const MODES = ["light", "dark", "system"] as const;

const ICONS = {
	light: Sun,
	dark: Moon,
	system: Monitor,
} as const;

const LABELS = {
	light: "Light",
	dark: "Dark",
	system: "System",
} as const;

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<div className="flex items-center gap-1 rounded-lg bg-muted p-1">
				{MODES.map((m) => (
					<div key={m} className="h-7 w-7 rounded-md" />
				))}
			</div>
		);
	}

	return (
		<div className="flex items-center gap-1 rounded-lg bg-muted p-1">
			{MODES.map((mode) => {
				const Icon = ICONS[mode];
				const isActive = theme === mode;
				return (
					<button
						key={mode}
						type="button"
						onClick={() => setTheme(mode)}
						className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
							isActive
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
						title={LABELS[mode]}
						aria-label={`Switch to ${LABELS[mode]} theme`}
					>
						<Icon className="h-3.5 w-3.5" />
					</button>
				);
			})}
		</div>
	);
}
