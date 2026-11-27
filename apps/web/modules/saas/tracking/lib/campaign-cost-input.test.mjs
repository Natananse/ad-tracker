import assert from "node:assert/strict";
import test from "node:test";
import { parseCostInput } from "./campaign-cost-input.ts";

test("percentages convert exactly into basis points", () => {
	for (const [text, basisPoints] of [
		["0", 0],
		[".01", 1],
		["2.90", 290],
		["32.95", 3295],
		["100", 10_000],
	]) {
		assert.deepEqual(parseCostInput(text, "percent", 0), {
			value: basisPoints,
		});
	}
	assert.match(
		parseCostInput("100.01", "percent", 2).error,
		/between 0 and 100/,
	);
	assert.match(
		parseCostInput("2.999", "percent", 3).error,
		/2 decimal places/,
	);
});

test("per-order amounts respect currency precision and the largest exact integer", () => {
	assert.deepEqual(parseCostInput(" 0.29 ", "money", 2), { value: 29 });
	assert.deepEqual(parseCostInput("1.001", "money", 3), { value: 1001 });
	assert.deepEqual(parseCostInput("500", "money", 0), { value: 500 });
	assert.deepEqual(parseCostInput("90071992547409.91", "money", 2), {
		value: Number.MAX_SAFE_INTEGER,
	});
	assert.match(
		parseCostInput("90071992547409.92", "money", 2).error,
		/too large/,
	);
	assert.match(parseCostInput("0.01", "money", 0).error, /whole amount/);
});

test("blank fields and invalid numeric syntax are errors while confirmed zero is accepted", () => {
	for (const unit of ["percent", "money"]) {
		for (const text of ["", " ", "-2", "1,000", "1e2", "3%", "$1", "."]) {
			assert.ok(parseCostInput(text, unit, 2).error, `${unit}: ${text}`);
		}
		assert.deepEqual(parseCostInput("0.00", unit, 2), { value: 0 });
	}
});
