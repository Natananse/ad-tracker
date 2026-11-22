import type { AttributionInput, AttributionSnapshot } from "./model";

type Order = AttributionSnapshot["orders"][number];
type Click = Order["clicks"][number];
type DailyRow = {
	date: string;
	channel: string;
	campaign: string;
	currency: string;
	sales: number;
	refunds: number;
	spend: number | null;
	costs: number | null;
};

export class AttributionInputError extends Error {}

function remember(seen: Set<string>, value: string, kind: string) {
	if (seen.has(value)) {
		throw new AttributionInputError(`The snapshot repeats a ${kind}.`);
	}
	seen.add(value);
}

function selectClick(
	order: Order,
	model: AttributionInput["model"],
	windowDays: number,
) {
	const conversion = Date.parse(order.paidAt);
	const earliest = conversion - windowDays * 86_400_000;
	const ids = new Set<string>();
	let chosen: Click | null = null;
	let chosenTime = 0;
	for (const click of order.clicks) {
		remember(ids, click.id, "click ID within one order");
		const time = Date.parse(click.at);
		if (!click.eligible || time < earliest || time > conversion) {
			continue;
		}
		if (
			!chosen ||
			(model === "first-click" ? time < chosenTime : time > chosenTime) ||
			(time === chosenTime && click.id < chosen.id)
		) {
			chosen = click;
			chosenTime = time;
		}
	}
	return chosen;
}

function compareText(a: string, b: string) {
	return a < b ? -1 : a > b ? 1 : 0;
}

/** Input must first pass attributionInput. The report restates refunds on the UTC paid date. */
export function computeAttribution({
	snapshot,
	model,
	windowDays,
}: AttributionInput) {
	const byDay = new Map<string, DailyRow>();
	const orderIds = new Set<string>();
	const refundIds = new Set<string>();
	let magnitude = 0;
	let matchedOrders = 0;

	function rowFor(date: string, channel: string, campaign: string) {
		const key = JSON.stringify([date, channel, campaign]);
		let row = byDay.get(key);
		if (!row) {
			row = {
				date,
				channel,
				campaign,
				currency: snapshot.currency,
				sales: 0,
				refunds: 0,
				costs: 0,
				spend: channel === "Unmatched" ? 0 : null,
			};
			byDay.set(key, row);
		}
		return row;
	}

	// Spend is keyed independently of conversions so campaigns with no orders still appear.
	const spending = new Set<string>();
	for (const { date, channel, campaign, amount } of snapshot.spend) {
		remember(
			spending,
			JSON.stringify([date, channel, campaign]),
			"daily campaign spend record",
		);
		rowFor(date, channel, campaign).spend = amount;
		magnitude += amount ?? 0;
	}

	const evidence = snapshot.orders.map((order) => {
		remember(orderIds, order.id, "paid order ID");
		const click = selectClick(order, model, windowDays);
		if (click) {
			matchedOrders++;
		}
		const date = order.paidAt.slice(0, 10);
		const channel = click?.channel ?? "Unmatched";
		const campaign = click?.campaign ?? "No eligible click";
		const row = rowFor(date, channel, campaign);
		row.sales += order.sales;
		row.costs =
			row.costs === null || order.costs === null
				? null
				: row.costs + order.costs;
		magnitude += order.sales + (order.costs ?? 0);
		for (const refund of order.refunds) {
			remember(refundIds, refund.id, "refund ID");
			row.refunds += refund.amount;
			magnitude += refund.amount;
		}
		return {
			orderId: order.id,
			date,
			channel,
			campaign,
			clickId: click?.id ?? null,
			clickedAt: click?.at ?? null,
		};
	});
	if (!Number.isSafeInteger(magnitude)) {
		throw new AttributionInputError(
			"The snapshot exceeds the range for exact totals in this currency.",
		);
	}

	const rows = [...byDay.values()].sort(
		(a, b) =>
			compareText(a.date, b.date) ||
			compareText(a.channel, b.channel) ||
			compareText(a.campaign, b.campaign),
	);
	evidence.sort(
		(a, b) =>
			compareText(a.date, b.date) || compareText(a.orderId, b.orderId),
	);
	return {
		rows,
		evidence,
		matchedOrders,
		totalOrders: snapshot.orders.length,
	};
}
