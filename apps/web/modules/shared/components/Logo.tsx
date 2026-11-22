import { config } from "@repo/config";
import { cn } from "@ui/lib";
import { ChartNoAxesCombinedIcon } from "lucide-react";

export function Logo({
	withLabel = true,
	className,
}: {
	withLabel?: boolean;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-2 text-foreground",
				className,
			)}
		>
			<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#263bfb] text-white">
				<ChartNoAxesCombinedIcon
					className="size-5"
					strokeWidth={2.5}
					aria-hidden="true"
				/>
			</span>
			{withLabel ? (
				<span className="text-xl font-bold tracking-tight">
					{config.appName}
				</span>
			) : (
				<span className="sr-only">{config.appName}</span>
			)}
		</span>
	);
}
