"use client";

import { config } from "@repo/config";
import { NavBar } from "@saas/shared/components/NavBar";
import { cn } from "@ui/lib";
import { type PropsWithChildren, useEffect, useState } from "react";

export function AppWrapper({ children }: PropsWithChildren) {
	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		setCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
	}, []);

	function toggleSidebar() {
		const next = !collapsed;
		setCollapsed(next);
		localStorage.setItem("sidebar-collapsed", String(next));
	}

	return (
		<div
			className={cn(
				"min-h-dvh bg-background",
				config.ui.saas.useSidebarLayout && "md:flex md:items-start",
			)}
		>
			<NavBar collapsed={collapsed} onToggle={toggleSidebar} />
			<main className="min-w-0 flex-1">
				<div className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-7 sm:py-8 xl:px-10">
					{children}
				</div>
			</main>
		</div>
	);
}
