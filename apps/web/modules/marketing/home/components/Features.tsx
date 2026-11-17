"use client";

import {
	Lock,
	Sparkles,
	Zap,
	BarChart3Icon,
	UsersIcon,
} from "lucide-react";

const features = [
	{
		id: "feature1",
		title: "Security First",
		icon: Lock,
		description: "Enterprise-grade security",
	},
	{
		id: "feature2",
		title: "AI-Powered",
		icon: Sparkles,
		description: "Smart recommendations",
	},
	{
		id: "feature3",
		title: "Lightning Fast",
		icon: Zap,
		description: "Optimized performance",
	},
	{
		id: "feature4",
		title: "Deep Analytics",
		icon: BarChart3Icon,
		description: "Actionable insights",
	},
	{
		id: "feature5",
		title: "Team Ready",
		icon: UsersIcon,
		description: "Built for collaboration",
	},
];

export function Features() {
	return (
		<section className="scroll-mt-20 border-t py-12 lg:py-16 bg-gradient-to-b from-background to-primary/5">
			<div className="container max-w-6xl">
				<div className="mb-12 text-center">
					<h2 className="mb-4 font-bold text-4xl lg:text-5xl">
						Built for success
					</h2>
					<p className="text-lg text-foreground/70">
						Everything your team needs to thrive
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
					{features.map((feature) => (
						<div
							key={feature.id}
							className="rounded-lg border border-border bg-card p-6 text-center hover:border-primary hover:shadow-md transition-all"
						>
							<div className="mb-4 flex justify-center">
								<div className="rounded-lg bg-primary/10 p-3">
									<feature.icon className="size-6 text-primary" />
								</div>
							</div>
							<h3 className="mb-2 font-semibold">{feature.title}</h3>
							<p className="text-sm text-foreground/60">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
