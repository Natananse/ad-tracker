/**
 * Resolves the name to greet a mail recipient by.
 *
 * Templates address people by name, so every call site needs a value that is
 * never empty - otherwise the greeting renders as "Hey ,". When we have no
 * stored name (magic-link sign-in for an address that has no user row yet, for
 * example) we fall back to the local part of the email address, which is a far
 * better greeting than a generic "there".
 */
export function getRecipientName(
	name: string | null | undefined,
	email: string,
): string {
	const trimmedName = name?.trim();

	if (trimmedName) {
		return trimmedName;
	}

	const localPart = email.split("@")[0] ?? "";

	// Turn "jane.doe" / "jane_doe" / "jane-doe+tag" into "Jane Doe".
	const humanized = localPart
		.replace(/\+.*$/, "")
		.split(/[._-]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ")
		.trim();

	return humanized || email;
}
