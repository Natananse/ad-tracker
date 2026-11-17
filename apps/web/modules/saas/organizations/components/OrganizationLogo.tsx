"use client";

import { Avatar, AvatarFallback } from "@ui/components/avatar";
import { useMemo } from "react";

export const OrganizationLogo = ({
	name,
	className,
	ref,
}: React.ComponentProps<typeof Avatar> & {
	name: string;
	className?: string;
}) => {
	const initials = useMemo(
		() =>
			name
				.split(" ")
				.slice(0, 2)
				.map((n) => n[0])
				.join(""),
		[name],
	);

	return (
		<Avatar ref={ref} className={className}>
			<AvatarFallback className="bg-primary/10 text-primary font-bold">
				{initials}
			</AvatarFallback>
		</Avatar>
	);
};

OrganizationLogo.displayName = "OrganizationLogo";
