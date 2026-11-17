import { LocaleLink } from "@i18n/routing";
import { Button } from "@ui/components/button";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";

export function Hero() {
	return (
		<div className="relative max-w-full overflow-x-hidden bg-linear-to-b from-0% from-card to-[50vh] to-background">
			<div className="absolute left-1/2 z-10 ml-[-500px] h-[500px] w-[1000px] rounded-full bg-linear-to-r from-primary to-accent opacity-20 blur-[150px]" />
			<div className="container relative z-20 pt-44 pb-12 text-center lg:pb-16">
				<div className="mb-6 flex justify-center">
					<div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2">
						<SparklesIcon className="size-4 text-primary" />
						<span className="text-sm font-medium text-foreground">
							Introducing TaskFlow Pro
						</span>
					</div>
				</div>

				<h1 className="mx-auto max-w-4xl text-balance font-bold text-5xl lg:text-7xl">
					Manage your team's workflow effortlessly
				</h1>

				<p className="mx-auto mt-6 max-w-2xl text-balance text-foreground/70 text-lg">
					TaskFlow Pro helps teams collaborate, track progress, and deliver projects on time. 
					Built for modern teams that move fast.
				</p>

				<div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row">
					<Button size="lg" asChild>
						<Link href="/auth/login">
							Start free trial
							<ArrowRightIcon className="ml-2 size-4" />
						</Link>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<LocaleLink href="/docs">Watch demo</LocaleLink>
					</Button>
				</div>

				<p className="mt-6 text-sm text-foreground/50">
					No credit card required • 14-day free trial
				</p>
			</div>
		</div>
	);
}
