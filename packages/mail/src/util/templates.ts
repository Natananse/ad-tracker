import { render } from "@react-email/render";
import type { Locale, Messages } from "@repo/i18n";
import { getMessagesForLocale } from "@repo/i18n";
import { mailTemplates } from "../../emails";

export async function getTemplate<T extends TemplateId>({
	templateId,
	context,
	locale,
}: {
	templateId: T;
	context: Omit<
		Parameters<(typeof mailTemplates)[T]>[0],
		"locale" | "translations"
	>;
	locale: Locale;
}) {
	const template = mailTemplates[templateId];
	const translations = await getMessagesForLocale(locale);

	const email = template({
		...(context as any),
		locale,
		translations,
	});

	const subject =
		templateId in translations.mail &&
		"subject" in (translations.mail[templateId as keyof Messages["mail"]] as any)
			? (translations.mail[templateId as keyof Messages["mail"]] as any).subject
			: "";

	const html = await render(email);
	const text = await render(email, { plainText: true });
	return { html, text, subject };
}

export type TemplateId = keyof typeof mailTemplates;
