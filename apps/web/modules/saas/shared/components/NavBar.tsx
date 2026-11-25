"use client";

import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { OrganizationSelect } from "@saas/organizations/components/OrganizationSelect";
import { UserMenu } from "@saas/shared/components/UserMenu";
import { Logo } from "@shared/components/Logo";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { cn } from "@ui/lib";
import {
	BotMessageSquareIcon,
	ChartColumnIcon,
	MenuIcon,
	PanelLeftCloseIcon,
	PanelLeftOpenIcon,
	SettingsIcon,
	ShieldCheckIcon,
	UserCogIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function NavBar({
	collapsed,
	onToggle,
}: {
	collapsed: boolean;
	onToggle: () => void;
}) {
	const t = useTranslations("app.menu");
	const pathname = usePathname();
	const { organizationSlug } = useParams<{ organizationSlug?: string }>();
	const { user } = useSession();
	const rail = config.ui.saas.useSidebarLayout;
	const compact = rail && collapsed;
	const base = organizationSlug ? `/app/${organizationSlug}` : "/app";
	const report = `${base}/reports/campaigns`;

	const items = [
		{ href: report, label: t("campaignReport"), icon: ChartColumnIcon },
		{
			href: `${base}/chatbot`,
			label: t("aiChatbot"),
			icon: BotMessageSquareIcon,
		},
		...(organizationSlug && !config.organizations.hideOrganization
			? [
					{
						href: `${base}/settings`,
						label: t("organizationSettings"),
						icon: SettingsIcon,
					},
				]
			: []),
		{
			href: "/app/settings",
			label: t("accountSettings"),
			icon: UserCogIcon,
		},
		...(user?.role === "admin"
			? [{ href: "/app/admin", label: t("admin"), icon: ShieldCheckIcon }]
			: []),
	];
	const toggleLabel = t(compact ? "expandSidebar" : "collapseSidebar");
	const ToggleIcon = compact ? PanelLeftOpenIcon : PanelLeftCloseIcon;
	const isActive = (href: string) =>
		pathname === href || pathname.startsWith(`${href}/`);

	return (
		<nav
			aria-label={t("workspaceNavigation")}
			className={cn(
				"border-b bg-card",
				rail &&
					"md:sticky md:top-0 md:h-dvh md:flex-none md:overflow-y-auto md:border-r md:border-b-0",
				rail && (compact ? "md:w-[4.5rem]" : "md:w-[17rem]"),
			)}
		>
			<div
				className={cn(
					"mx-auto flex max-w-[90rem] flex-wrap items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-5",
					rail &&
						"md:h-full md:flex-nowrap md:flex-col md:items-stretch md:px-3 md:py-5",
				)}
			>
				<Link
					href={report}
					aria-label={config.appName}
					className={cn(
						"flex shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-ring",
						rail && "md:mb-3 md:self-start md:px-1",
						compact && "md:self-center md:px-0",
					)}
				>
					<Logo
						className={cn(
							"max-sm:[&>span:last-child]:sr-only",
							compact && "md:[&>span:last-child]:sr-only",
						)}
					/>
				</Link>

				{config.organizations.enable &&
					!config.organizations.hideOrganization && (
						<OrganizationSelect
							className={cn(
								"mr-auto min-w-0 max-w-60 flex-1",
								rail && "md:mr-0 md:max-w-none md:flex-none",
							)}
							isCollapsed={compact}
						/>
					)}

				<ul
					className={cn(
						"hidden md:order-last md:flex md:w-full md:flex-wrap md:gap-1",
						rail && "md:order-none md:mt-3 md:flex-col",
					)}
				>
					{items.map(({ href, label, icon: Icon }, index) => (
						<li
							key={href}
							className={cn(
								rail && index === 1 && "mt-3 border-t pt-3",
							)}
						>
							<Link
								href={href}
								aria-current={
									isActive(href) ? "page" : undefined
								}
								title={compact ? label : undefined}
								className={cn(
									"flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-indigo-50 aria-[current=page]:text-indigo-800 dark:aria-[current=page]:bg-indigo-400/15 dark:aria-[current=page]:text-indigo-200",
									compact && "justify-center px-1",
								)}
							>
								<Icon
									className="size-[1.05rem] shrink-0"
									aria-hidden="true"
								/>
								<span
									className={compact ? "sr-only" : undefined}
								>
									{label}
								</span>
							</Link>
						</li>
					))}
				</ul>

				<div className="ml-auto flex md:hidden">
					<DropdownMenu>
						<DropdownMenuTrigger
							aria-label={t("workspaceNavigation")}
							className="grid size-10 place-items-center rounded-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
						>
							<MenuIcon className="size-5" aria-hidden="true" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{items.map(({ href, label, icon: Icon }) => (
								<DropdownMenuItem key={href} asChild>
									<Link
										href={href}
										aria-current={
											isActive(href) ? "page" : undefined
										}
										className="min-h-10 gap-2.5 aria-[current=page]:font-semibold aria-[current=page]:text-primary"
									>
										<Icon
											className="size-4"
											aria-hidden="true"
										/>
										{label}
									</Link>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{rail && (
					<button
						type="button"
						onClick={onToggle}
						aria-label={toggleLabel}
						title={toggleLabel}
						className={cn(
							"mt-auto hidden min-h-10 items-center gap-2.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring md:flex",
							compact && "justify-center px-0",
						)}
					>
						<ToggleIcon
							className="size-4 shrink-0"
							aria-hidden="true"
						/>
						<span className={compact ? "sr-only" : undefined}>
							{toggleLabel}
						</span>
					</button>
				)}

				<div
					className={cn(
						"shrink-0",
						rail ? "md:border-t md:pt-3" : "md:ml-auto",
					)}
				>
					<UserMenu showUserName={rail && !compact} />
				</div>
			</div>
		</nav>
	);
}
