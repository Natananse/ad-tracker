import { computeAttribution } from "@repo/api/modules/tracking/attribution/compute";
import example from "@repo/api/modules/tracking/attribution/example.json";
import type { AttributionInput } from "@repo/api/modules/tracking/attribution/model";
import {
	buildCampaignReport,
	campaignOverview,
} from "@saas/tracking/lib/campaign-report";

export const demoCurrency = example.currency;
export const demoReportDate = example.spend[0].date;
export const demoWindowDays = 28;

function demoReport(model: AttributionInput["model"]) {
	const { rows, evidence } = computeAttribution({
		snapshot: example,
		model,
		windowDays: demoWindowDays,
	});
	const summaries = buildCampaignReport(rows, {
		currency: demoCurrency,
		start: "",
		end: "",
	});
	const overview = campaignOverview(summaries);
	const campaigns = summaries.map((campaign) => ({
		...campaign,
		orders: evidence.filter(
			(order) =>
				order.channel === campaign.channel &&
				order.campaign === campaign.campaign,
		).length,
		share:
			overview.netRevenue > 0
				? campaign.netRevenue / overview.netRevenue
				: 0,
	}));
	return { campaigns, overview };
}

export const demoCampaignReports = {
	"first-click": demoReport("first-click"),
	"last-click": demoReport("last-click"),
};
