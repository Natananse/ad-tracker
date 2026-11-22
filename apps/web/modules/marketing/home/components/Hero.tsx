import { LocaleLink } from "@i18n/routing";
import { config } from "@repo/config";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { CampaignPreview } from "./CampaignPreview";

export function Hero() {
	return (
		<section className="overflow-hidden bg-[#08131d] text-white">
			<div className="mx-auto max-w-[1440px] border-x border-[#16303b] pt-12 text-center min-[900px]:w-[90%] lg:pt-[70px]">
				<div className="px-5">
					<span className="inline-block rounded-full border border-[#195443] bg-[#0c231f] px-5 py-2 text-xs font-bold tracking-[.15em] text-[#53dfab] uppercase italic sm:text-sm">
						Marketing attribution
					</span>
					<h1 className="mx-auto mt-7 max-w-[24ch] text-balance text-[2.2rem] leading-[1.14] font-bold tracking-[-.045em] sm:text-5xl lg:mt-9 lg:text-[3.65rem]">
						See which ads bring your store a profit
					</h1>
					<p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-relaxed text-[#c5d2d8] lg:text-lg">
						Compare Meta and Google campaigns against your Shopify
						sales. See what each campaign leaves after refunds,
						product costs, and ad spend.
					</p>
					<div className="mx-auto mt-8 flex max-w-xs flex-col justify-center gap-5 sm:max-w-none sm:flex-row sm:gap-4 lg:mt-10">
						{config.ui.saas.enabled && (
							<Link
								href={
									config.auth.enableSignup
										? "/auth/signup"
										: "/auth/login"
								}
								className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#007b60] px-6 font-semibold text-white hover:bg-[#00684f]"
							>
								Open a workspace <ArrowRightIcon size={17} />
							</Link>
						)}
						<LocaleLink
							href="/demo"
							className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#8495a9] px-6 text-white hover:bg-white/10"
						>
							View demo store
						</LocaleLink>
					</div>
				</div>
				<div className="mt-12 border-t border-[#17333f] bg-[linear-gradient(#142d381f_1px,transparent_1px),linear-gradient(90deg,#142d38_1px,transparent_1px)] bg-size-[70px_70px] px-3 py-6 sm:px-8 sm:py-9 lg:mt-16 lg:px-14 lg:pb-16">
					<CampaignPreview />
				</div>
			</div>
		</section>
	);
}
