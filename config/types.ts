export type RateLimitRule = {
	// Length of the window in seconds.
	window: number;
	// Maximum number of requests allowed per window.
	max: number;
};

export type Config = {
	appName: string;
	i18n: {
		enabled: boolean;
		locales: { [locale: string]: { currency: string; label: string } };
		defaultLocale: string;
		defaultCurrency: string;
		localeCookieName: string;
	};
	organizations: {
		enable: boolean;
		enableBilling: boolean;
		enableUsersToCreateOrganizations: boolean;
		requireOrganization: boolean;
		hideOrganization: boolean;
		forbiddenOrganizationSlugs: string[];
	};
	users: {
		enableBilling: boolean;
		enableOnboarding: boolean;
	};
	auth: {
		enableSignup: boolean;
		enableMagicLink: boolean;
		enableSocialLogin: boolean;
		enablePasskeys: boolean;
		enablePasswordLogin: boolean;
		enableTwoFactor: boolean;
		redirectAfterSignIn: string;
		redirectAfterLogout: string;
		sessionCookieMaxAge: number;
		// How often an active session is refreshed (seconds).
		sessionUpdateAge: number;
		// Lifetimes (in seconds) of the single-use links & tokens we send by email.
		// Every one of these must be finite - an link that never expires stays
		// usable forever if the mailbox is later compromised.
		magicLinkExpiresIn: number;
		emailVerificationExpiresIn: number;
		passwordResetExpiresIn: number;
		organizationInvitationExpiresIn: number;
		deleteAccountTokenExpiresIn: number;
	};
	rateLimits: {
		// Rate limiting is only enforced when this is true. better-auth
		// additionally disables its own limiter outside of production unless
		// `enabled` is forced on, so keep this in sync with your deployment.
		enabled: boolean;
		// Limits applied by better-auth to /api/auth/**
		auth: {
			default: RateLimitRule;
			signIn: RateLimitRule;
			signUp: RateLimitRule;
			passwordReset: RateLimitRule;
			magicLink: RateLimitRule;
			emailVerification: RateLimitRule;
			// Endpoints reached by CLICKING a link in an email. These must stay
			// permissive: mail scanners prefetch links, users double-click, and
			// a whole office can share one NAT'd IP.
			linkVerification: RateLimitRule;
			twoFactor: RateLimitRule;
		};
		// Limits applied by our own oRPC middleware. better-auth's limiter does
		// NOT cover these - they are separate routers.
		api: {
			contactForm: RateLimitRule;
			newsletter: RateLimitRule;
			checkout: RateLimitRule;
			slugGeneration: RateLimitRule;
		};
	};
	mails: {
		from: string;
	};
	ui: {
		enabledThemes: Array<"light" | "dark">;
		defaultTheme: Config["ui"]["enabledThemes"][number];
		saas: {
			enabled: boolean;
			useSidebarLayout: boolean;
		};
		marketing: {
			enabled: boolean;
		};
	};
	contactForm: {
		enabled: boolean;
		to: string;
		subject: string;
	};
	payments: {
		plans: {
			[id: string]: {
				hidden?: boolean;
				isFree?: boolean;
				isEnterprise?: boolean;
				recommended?: boolean;
				prices?: Array<
					{
						productId: string;
						amount: number;
						currency: string;
						hidden?: boolean;
					} & (
						| {
								type: "recurring";
								interval: "month" | "year" | "week";
								intervalCount?: number;
								trialPeriodDays?: number;
								seatBased?: boolean;
						  }
						| {
								type: "one-time";
						  }
					)
				>;
			};
		};
	};
};
