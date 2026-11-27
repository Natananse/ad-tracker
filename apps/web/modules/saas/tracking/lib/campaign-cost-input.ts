export function parseCostInput(
	input: string,
	unit: "percent" | "money",
	currencyPlaces: number,
): { value: number } | { error: string } {
	const text = input.trim();
	if (!text) {
		return { error: "Enter an amount. Use 0 if this cost is zero." };
	}
	if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) {
		return {
			error: "Use a positive number or 0, with a decimal point if needed.",
		};
	}
	const places = unit === "percent" ? 2 : currencyPlaces;
	const [whole, fraction = ""] = text.split(".");
	if (fraction.length > places) {
		return {
			error:
				places === 0
					? "Use a whole amount in this currency."
					: `Use up to ${places} decimal places.`,
		};
	}
	// Assemble minor units or basis points from digits to keep the last cent exact.
	const value = Number((whole || "0") + fraction.padEnd(places, "0"));
	if (unit === "percent" && value > 10_000) {
		return { error: "Enter a percentage between 0 and 100." };
	}
	if (!Number.isSafeInteger(value)) {
		return { error: "This amount is too large to store accurately." };
	}
	return { value };
}
