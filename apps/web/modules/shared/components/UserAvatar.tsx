import { Avatar, AvatarFallback } from "@ui/components/avatar";
import { useMemo } from "react";

export const UserAvatar = ({
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
			<AvatarFallback className="bg-secondary/10 text-secondary">
				{initials}
			</AvatarFallback>
		</Avatar>
	);
};

UserAvatar.displayName = "UserAvatar";
