import type { computeAttribution } from "./attribution/compute";
import type { AttributionInput } from "./attribution/model";
import type { WorkspaceCostDefaults } from "./cost-settings";

export type CostSource = "entered" | "estimated" | "mixed" | "unknown";

interface DailyCosts {
	date: string;
	channel: string;
	campaign: string;
	currency: string;
	sales: number;
	costs: number | null;
	orders?: number | null;
}

interface AttributionDetails {
	source: AttributionInput;
	result: Pick<ReturnType<typeof computeAttribution>, "evidence">;
}

function estimateCosts(
	sales: number,
	orders: number,
	settings: WorkspaceCostDefaults,
) {
	const perOrder =
		BigInt(settings.fixedPaymentFeeMinor) +
		BigInt(settings.fulfillmentCostMinor);
	// Round each percentage separately to the nearest minor unit, with halves rounded up.
	const percentage = (bps: number) =>
		(BigInt(sales) * BigInt(bps) + BigInt(5_000)) / BigInt(10_000);
	return (
		percentage(settings.productCostBps) +
		percentage(settings.paymentFeeBps) +
		perOrder * BigInt(orders)
	);
}

function dailyKey(row: Pick<DailyCosts, "date" | "channel" | "campaign">) {
	return JSON.stringify([row.date, row.channel, row.campaign]);
}

function costsFromOrders(
	{ source, result }: AttributionDetails,
	settings: WorkspaceCostDefaults,
) {
	const groups = new Map<
		string,
		{ cost: bigint; hasEntered: boolean; hasEstimate: boolean }
	>();
	if (source.snapshot.orders.length !== result.evidence.length) {
		return null;
	}
	const orders = new Map(
		source.snapshot.orders.map((order) => [order.id, order]),
	);
	for (const evidence of result.evidence) {
		const order = orders.get(evidence.orderId);
		if (!order) {
			return null;
		}
		const key = dailyKey(evidence);
		const group = groups.get(key) ?? {
			cost: BigInt(0),
			hasEntered: false,
			hasEstimate: false,
		};
		if (order.costs === null) {
			// Each order pays its own rounded percentage fees and fixed charges.
			group.cost += estimateCosts(order.sales, 1, settings);
			group.hasEstimate = true;
		} else {
			group.cost += BigInt(order.costs);
			group.hasEntered = true;
		}
		groups.set(key, group);
	}
	return groups;
}

/** Display estimates always leave the imported costs (including null or zero) intact. */
export function applyWorkspaceCosts<T extends DailyCosts>(
	rows: T[],
	settings: WorkspaceCostDefaults | null,
	attribution?: AttributionDetails,
): (T & { costSource: CostSource; estimatedCosts: number | null })[] {
	const byOrder =
		settings &&
		attribution &&
		attribution.source.snapshot.currency === settings.currency
			? costsFromOrders(attribution, settings)
			: null;
	return rows.map((row) => {
		if (row.costs !== null) {
			return { ...row, costSource: "entered", estimatedCosts: null };
		}
		let estimate: bigint | null = null;
		let source: CostSource = "estimated";
		if (settings && settings.currency === row.currency) {
			if (attribution) {
				const group = byOrder?.get(dailyKey(row));
				if (group?.hasEstimate) {
					estimate = group.cost;
					source = group.hasEntered ? "mixed" : "estimated";
				}
			} else if (
				row.orders != null ||
				(settings.fixedPaymentFeeMinor === 0 &&
					settings.fulfillmentCostMinor === 0)
			) {
				estimate = estimateCosts(row.sales, row.orders ?? 0, settings);
			}
		}
		if (estimate === null || estimate > BigInt(Number.MAX_SAFE_INTEGER)) {
			return { ...row, costSource: "unknown", estimatedCosts: null };
		}
		return { ...row, costSource: source, estimatedCosts: Number(estimate) };
	});
}
