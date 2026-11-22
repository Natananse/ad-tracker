import { LocaleLink } from "@i18n/routing";
import { config } from "@repo/config";
import { Logo } from "@shared/components/Logo";

export function Footer() {
	return (
		<footer className="border-t border-border bg-card py-10 text-sm text-muted-foreground">
			<div className="container flex flex-wrap justify-between gap-8">
				<div>
					<LocaleLink href="/">
						<Logo className="text-card-foreground" />
					</LocaleLink>
					<p className="mt-3">
						© {new Date().getFullYear()} {config.appName}
					</p>
				</div>
				<div className="grid grid-cols-2 gap-x-8 gap-y-3">
					<LocaleLink href="/#features">Attribution</LocaleLink>
					<LocaleLink href="/legal/privacy-policy">
						Privacy policy
					</LocaleLink>
					<LocaleLink href="/demo">Demo store</LocaleLink>
					<LocaleLink href="/legal/terms">
						Terms and conditions
					</LocaleLink>
					<LocaleLink href="/#pricing">Pricing</LocaleLink>
					{config.contactForm.enabled && (
						<LocaleLink href="/contact">Contact</LocaleLink>
					)}
				</div>
			</div>
		</footer>
	);
}
