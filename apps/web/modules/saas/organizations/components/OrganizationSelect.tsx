"use client";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { useOrganizationListQuery } from "@saas/organizations/lib/api";
import { ActivePlanBadge } from "@saas/payments/components/ActivePlanBadge";
import { UserAvatar } from "@shared/components/UserAvatar";
import { useRouter } from "@shared/hooks/router";
import { clearCache } from "@shared/lib/cache";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { cn } from "@ui/lib";
import { ChevronsUpDownIcon, LayersIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { OrganizationLogo } from "./OrganizationLogo";

export function OrganizationSelect({
	className,
	isCollapsed,
}: {
	className?: string;
	isCollapsed?: boolean;
}) {
	const t = useTranslations();
	const { user } = useSession();
	const router = useRouter();
	const { activeOrganization, setActiveOrganization } =
		useActiveOrganization();
	const { data: allOrganizations } = useOrganizationListQuery();

	if (!user) {
		return null;
	}

	const workspaceName =
		activeOrganization?.name ?? t("app.menu.personalWorkspace");
	const switchLabel = t("app.menu.switchWorkspace", { name: workspaceName });

	return (
		<div className={className}>
			<DropdownMenu>
				<DropdownMenuTrigger
					aria-label={switchLabel}
					title={switchLabel}
					className={cn(
						"flex min-h-10 w-full items-center gap-2 rounded-lg border bg-background px-2 text-left text-sm font-medium hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring",
						isCollapsed && "md:justify-center md:px-0",
					)}
				>
					{activeOrganization ? (
						<OrganizationLogo
							className="size-6 shrink-0"
							name={activeOrganization.name}
						/>
					) : (
						<LayersIcon
							className="size-4 shrink-0 text-indigo-600 dark:text-indigo-300"
							aria-hidden="true"
						/>
					)}
					<span
						className={cn(
							"min-w-0 flex-1 truncate",
							isCollapsed && "md:sr-only",
						)}
					>
						{workspaceName}
					</span>
					{!isCollapsed && (
						<span className="hidden shrink-0 xl:inline-flex">
							{activeOrganization
								? config.organizations.enableBilling && (
										<ActivePlanBadge
											organizationId={
												activeOrganization.id
											}
										/>
									)
								: config.users.enableBilling && (
										<ActivePlanBadge />
									)}
						</span>
					)}
					<ChevronsUpDownIcon
						className={cn(
							"size-3.5 shrink-0 text-muted-foreground",
							isCollapsed && "md:hidden",
						)}
						aria-hidden="true"
					/>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-52 max-w-[calc(100vw-2rem)] overflow-y-auto"
				>
					{!config.organizations.requireOrganization && (
						<>
							<DropdownMenuRadioGroup
								value={activeOrganization?.id ?? user.id}
								onValueChange={async (value: string) => {
									if (value === user.id) {
										await clearCache();
										router.replace("/app");
									}
								}}
							>
								<DropdownMenuLabel className="text-foreground/60 text-xs">
									{t(
										"organizations.organizationSelect.personalAccount",
									)}
								</DropdownMenuLabel>
								<DropdownMenuRadioItem
									value={user.id}
									className="flex cursor-pointer items-center justify-center gap-2 pl-3"
								>
									<div className="flex min-w-0 flex-1 items-center gap-2">
										<UserAvatar
											className="size-8 shrink-0"
											name={user.name ?? ""}
										/>
										<span className="truncate">
											{user.name}
										</span>
									</div>
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
							<DropdownMenuSeparator />
						</>
					)}
					<DropdownMenuRadioGroup
						value={activeOrganization?.slug}
						onValueChange={async (organizationSlug: string) => {
							await clearCache();
							setActiveOrganization(organizationSlug);
						}}
					>
						{!!allOrganizations?.length && (
							<DropdownMenuLabel className="text-foreground/60 text-xs">
								{t(
									"organizations.organizationSelect.organizations",
								)}
							</DropdownMenuLabel>
						)}
						{allOrganizations?.map((organization) => (
							<DropdownMenuRadioItem
								key={organization.slug}
								value={organization.slug}
								className="flex cursor-pointer items-center justify-center gap-2 pl-3"
							>
								<div className="flex min-w-0 flex-1 items-center gap-2">
									<OrganizationLogo
										className="size-8 shrink-0"
										name={organization.name}
									/>
									<span className="truncate">
										{organization.name}
									</span>
								</div>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>

					{config.organizations.enableUsersToCreateOrganizations && (
						<DropdownMenuGroup>
							<DropdownMenuItem
								asChild
								className="text-primary! cursor-pointer text-sm"
							>
								<Link href="/new-organization">
									<PlusIcon className="mr-2 size-6 rounded-md bg-primary/20 p-1" />
									{t(
										"organizations.organizationSelect.createNewOrganization",
									)}
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
