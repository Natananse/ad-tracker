"use client";

import { LocaleLink, useLocalePathname } from "@i18n/routing";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { ColorModeToggle } from "@shared/components/ColorModeToggle";
import { LocaleSwitch } from "@shared/components/LocaleSwitch";
import { Logo } from "@shared/components/Logo";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@ui/components/sheet";
import { cn } from "@ui/lib";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import styles from "./NavBar.module.css";

export function NavBar() {
	const t = useTranslations();
	const { user } = useSession();
	const pathname = useLocalePathname();
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const home = pathname === "/";
	useEffect(() => {
		if (!home) {
			return;
		}
		const update = () => setScrolled(window.scrollY > 24);
		update();
		window.addEventListener("scroll", update, { passive: true });
		return () => window.removeEventListener("scroll", update);
	}, [home]);
	const links = [
		{ href: "/", label: "Home" },
		{ href: "/#features", label: "Attribution" },
		{ href: "/demo", label: "Demo store" },
		{ href: "/#pricing", label: t("common.menu.pricing") },
		...(config.contactForm.enabled
			? [{ href: "/contact", label: t("common.menu.contact") }]
			: []),
	];
	const accountHref = user
		? "/app/reports/campaigns"
		: config.auth.enableSignup
			? "/auth/signup"
			: "/auth/login";
	const accountLabel = user
		? "Open report"
		: config.auth.enableSignup
			? "Get started"
			: "Sign in";
	return (
		<header
			className={cn(
				styles.header,
				home && styles.overlay,
				(!home || scrolled) && styles.solid,
			)}
		>
			<nav
				aria-label="Main navigation"
				data-test="navigation"
				className={styles.nav}
			>
				<LocaleLink className={styles.brand} href="/">
					<Logo className="text-[#151d2a]" />
				</LocaleLink>
				<div className={styles.pill}>
					{links.map(({ href, label }) => (
						<LocaleLink
							href={href}
							key={href}
							aria-current={
								pathname === href ? "page" : undefined
							}
							className={cn(
								styles.link,
								pathname === href &&
									(href !== "/" || !scrolled) &&
									styles.selected,
							)}
						>
							{label}
						</LocaleLink>
					))}
				</div>
				<div className={styles.account}>
					<div className={styles.options}>
						<ColorModeToggle />
						{config.i18n.enabled && (
							<Suspense>
								<LocaleSwitch />
							</Suspense>
						)}
					</div>
					{config.ui.saas.enabled && (
						<>
							{!user && config.auth.enableSignup && (
								<Link
									href="/auth/login"
									className={styles.login}
								>
									{t("common.menu.login")}
								</Link>
							)}
							<Link className={styles.start} href={accountHref}>
								{accountLabel}
							</Link>
						</>
					)}
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger
							aria-label="Open navigation"
							className={styles.menu}
						>
							<MenuIcon size={20} />
						</SheetTrigger>
						<SheetContent side="right" className="w-72">
							<SheetTitle>Menu</SheetTitle>
							<div className="mt-6 flex flex-col gap-5">
								{links.map(({ href, label }) => (
									<LocaleLink
										key={href}
										href={href}
										onClick={() => setOpen(false)}
									>
										{label}
									</LocaleLink>
								))}
								{config.ui.saas.enabled && (
									<>
										{!user && config.auth.enableSignup && (
											<Link
												href="/auth/login"
												onClick={() => setOpen(false)}
											>
												{t("common.menu.login")}
											</Link>
										)}
										<Link
											href={accountHref}
											onClick={() => setOpen(false)}
										>
											{accountLabel}
										</Link>
									</>
								)}
								<div className="flex items-center gap-2">
									<ColorModeToggle />
									{config.i18n.enabled && (
										<Suspense>
											<LocaleSwitch />
										</Suspense>
									)}
								</div>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</nav>
		</header>
	);
}
