"use client";
import { config } from "@repo/config";
import { NavBar } from "@saas/shared/components/NavBar";
import { cn } from "@ui/lib";
import type { PropsWithChildren } from "react";
import { useState, useEffect } from "react";

export function AppWrapper({ children }: PropsWithChildren) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	useEffect(() => {
		const saved = localStorage.getItem("sidebar-collapsed");
		if (saved !== null) {
			setIsCollapsed(saved === "true");
		}
	}, []);

	return (
		<div
			className={cn(
				"bg-[radial-gradient(farthest-corner_at_0%_0%,color-mix(in_oklch,var(--color-primary),transparent_95%)_0%,var(--color-background)_50%)] dark:bg-[radial-gradient(farthest-corner_at_0%_0%,color-mix(in_oklch,var(--color-primary),transparent_90%)_0%,var(--color-background)_50%)]",
				[config.ui.saas.useSidebarLayout ? "" : ""],
			)}
		>
			<NavBar onCollapsedChange={setIsCollapsed} />
			<div
				className={cn(" md:pr-4 py-4 flex transition-all duration-300", [
					config.ui.saas.useSidebarLayout && !isCollapsed
						? "min-h-[calc(100vh)] md:ml-[280px]"
						: "",
					config.ui.saas.useSidebarLayout && isCollapsed
						? "min-h-[calc(100vh)] md:ml-[80px]"
						: "",
				])}
			>
				<main
					className={cn(
						"py-6 border rounded-2xl bg-card px-4 md:p-8 min-h-full w-full",
						[config.ui.saas.useSidebarLayout ? "" : ""],
					)}
				>
					<div className="container px-0">{children}</div>
				</main>
			</div>
		</div>
	);
}
