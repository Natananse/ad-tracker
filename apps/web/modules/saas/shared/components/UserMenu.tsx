"use client";

import { DropdownMenuSub } from "@radix-ui/react-dropdown-menu";
import { authClient } from "@repo/auth/client";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { UserAvatar } from "@shared/components/UserAvatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import {
	ChartColumnIcon,
	HardDriveIcon,
	HomeIcon,
	LogOutIcon,
	MoonIcon,
	MoreVerticalIcon,
	SettingsIcon,
	SunIcon,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useState } from "react";

export function UserMenu({ showUserName }: { showUserName?: boolean }) {
	const t = useTranslations();
	const { user } = useSession();
	const { setTheme: setCurrentTheme, theme: currentTheme } = useTheme();
	const [theme, setTheme] = useState<string>(currentTheme ?? "system");

	const colorModeOptions = [
		{
			value: "system",
			label: "System",
			icon: HardDriveIcon,
		},
		{
			value: "light",
			label: "Light",
			icon: SunIcon,
		},
		{
			value: "dark",
			label: "Dark",
			icon: MoonIcon,
		},
	];

	const onLogout = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: async () => {
					window.location.href = new URL(
						config.auth.redirectAfterLogout,
						window.location.origin,
					).toString();
				},
			},
		});
	};

	if (!user) {
		return null;
	}

	const { name, email } = user;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-1.5 text-foreground outline-hidden hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
					aria-label={t("app.userMenu.title")}
				>
					<span className="flex min-w-0 items-center gap-2">
						<UserAvatar name={name ?? ""} />
						{showUserName && (
							<span className="hidden min-w-0 text-left leading-tight md:block">
								<span className="block truncate font-medium text-sm">
									{name}
								</span>
								<span className="block truncate text-xs text-muted-foreground">
									{email}
								</span>
							</span>
						)}
					</span>

					{showUserName && (
						<MoreVerticalIcon
							className="hidden size-4 shrink-0 md:block"
							aria-hidden="true"
						/>
					)}
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuLabel>
					{name}
					<span className="block font-normal text-xs opacity-70">
						{email}
					</span>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				{/* Color mode selection */}
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<SunIcon className="mr-2 size-4" />
						{t("app.userMenu.colorMode")}
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuRadioGroup
								value={theme}
								onValueChange={(value) => {
									setTheme(value);
									setCurrentTheme(value);
								}}
							>
								{colorModeOptions.map((option) => (
									<DropdownMenuRadioItem
										key={option.value}
										value={option.value}
									>
										<option.icon className="mr-2 size-4 opacity-50" />
										{option.label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>

				<DropdownMenuSeparator />

				<DropdownMenuItem asChild>
					<Link href="/app/settings/general">
						<SettingsIcon className="mr-2 size-4" />
						{t("app.userMenu.accountSettings")}
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem asChild>
					<Link href="/demo">
						<ChartColumnIcon className="mr-2 size-4" />
						{t("app.userMenu.sampleReport")}
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem asChild>
					<Link href="/">
						<HomeIcon className="mr-2 size-4" />
						{t("app.userMenu.home")}
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem onClick={onLogout}>
					<LogOutIcon className="mr-2 size-4" />
					{t("app.userMenu.logout")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
