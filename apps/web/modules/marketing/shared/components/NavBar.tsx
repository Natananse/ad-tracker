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
import { ArrowUpRightIcon, MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Suspense, useState } from "react";

export function NavBar() {
	const t = useTranslations();
	const { user } = useSession();
	const pathname = useLocalePathname();
	const [open, setOpen] = useState(false);
	const [showExample, setShowExample] = useState(true);
	const links = [
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
		<header className="sticky top-0 z-40 bg-[#08131d] text-white">
			{pathname === "/" && showExample && (
				<div className="relative flex min-h-10 items-center justify-center gap-3 bg-linear-to-r from-[#103979] via-[#0c1d37] to-[#104438] px-9 py-3 text-center text-xs font-medium sm:min-h-14 sm:text-base">
					<span>Which campaign earned more after refunds?</span>
					<LocaleLink
						href="/demo"
						className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/25 bg-[#244e8c] px-2.5 py-1.5 font-semibold text-white hover:bg-[#315f9e] sm:px-4"
					>
						See the example{" "}
						<ArrowUpRightIcon size={14} aria-hidden="true" />
					</LocaleLink>
					<button
						type="button"
						className="absolute right-1.5 p-1.5 text-white/80"
						aria-label="Dismiss announcement"
						onClick={() => setShowExample(false)}
					>
						<XIcon size={14} />
					</button>
				</div>
			)}
			<nav
				aria-label="Main navigation"
				data-test="navigation"
				className="border-b border-[#18323d]"
			>
				<div className="mx-auto flex h-16 max-w-[1440px] items-center gap-10 px-4 sm:px-8 lg:h-[76px] lg:px-14">
					<LocaleLink href="/">
						<Logo className="text-white" />
					</LocaleLink>
					<div className="hidden items-center gap-7 lg:flex">
						{links.map(({ href, label }) => (
							<LocaleLink
								key={href}
								href={href}
								className="text-sm font-medium text-white/85 hover:text-emerald-300"
							>
								{label}
							</LocaleLink>
						))}
					</div>
					<div className="ml-auto flex items-center gap-3">
						<div className="hidden items-center gap-2 sm:flex">
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
										className="hidden rounded-lg border border-slate-500 px-4 py-2.5 text-sm hover:border-white lg:block"
									>
										{t("common.menu.login")}
									</Link>
								)}
								<Link
									href={accountHref}
									className="hidden rounded-lg bg-[#007b60] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00684f] sm:block"
								>
									{accountLabel}
								</Link>
							</>
						)}
						<Sheet open={open} onOpenChange={setOpen}>
							<SheetTrigger
								aria-label="Open navigation"
								className="p-2 lg:hidden"
							>
								<MenuIcon size={22} />
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
											{!user &&
												config.auth.enableSignup && (
													<Link
														href="/auth/login"
														onClick={() =>
															setOpen(false)
														}
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
									<div className="flex items-center gap-2 sm:hidden">
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
				</div>
			</nav>
		</header>
	);
}
