import { safe } from '@/lib/safe';
import { getFunnelActivity, getSpotterDataset, getStages, Period, Stage } from '@/lib/spotter/api';
import {
  buildDataset,
  getAverageTicketByProduct,
  getDiscardReasons,
  getPerformanceByMonth,
  getPerformanceLine,
  getStatusByProduct,
  getStatusTrend,
  getSummary,
  getTopProducts,
} from '@/lib/spotter/kpis';

function assembleMetrics(dataset) {
  const summary = getSummary(dataset);
  const performanceLine = getPerformanceLine(dataset);
  const statusTrend = getStatusTrend(dataset);
  const salesByMonth = getPerformanceByMonth(dataset);
  const statusByProductRaw = getStatusByProduct(dataset);
  const topProductsRaw = getTopProducts(dataset, 12);
  const averageTicketRaw = getAverageTicketByProduct(dataset);

  const statusByProduct = statusByProductRaw.length
    ? statusByProductRaw
    : [{ product: 'Sem dados', won: 0, lost: 0, open: 0 }];

  const topProducts = topProductsRaw.length
    ? topProductsRaw
    : [{ product: 'Sem dados', revenue: 0, deals: 0 }];
  const averageTicketByProduct = averageTicketRaw.length
    ? averageTicketRaw
    : [{ product: 'Sem dados', ticket: 0 }];
  const discardReasons = getDiscardReasons(dataset);

  const discardReasonKeys = Array.from(
    discardReasons.reduce((set, item) => {
      for (const entry of item.breakdown) {
        set.add(entry.reason);
      }
      return set;
    }, new Set<string>())
  );

  if (!discardReasonKeys.length) {
    discardReasonKeys.push('Sem motivo informado');
  }

  const discardChartData = discardReasons.length
    ? discardReasons.map((item) => {
        const row: { [key: string]: any } = { product: item.product };
        for (const key of discardReasonKeys) {
          row[key] = 0;
        }
        for (const entry of item.breakdown) {
          row[entry.reason] = entry.count;
        }
        return row;
      })
    : [
        Object.fromEntries([
          ['product', 'Sem dados'],
          ...discardReasonKeys.map((reason) => [reason, 0]),
        ]),
      ];

  return {
    summary,
    performanceLine,
    statusTrend,
    salesByMonth,
    statusByProduct,
    topProducts,
    averageTicketByProduct,
    discardReasonKeys,
    discardChartData,
  };
}

export async function loadSpotterMetrics(
  period: Period = 'last12Months',
  funnelIds?: string[],
) {
  const rawData = await safe(getSpotterDataset(period), {
    leads: [],
    leadsSold: [],
    losts: [],
    recommendedProducts: [],
    products: [],
  });

  const dataset = buildDataset(rawData);
  const metrics = assembleMetrics(dataset);

  let finalFunnelIds = funnelIds;
  if (!finalFunnelIds) {
    const stages = await safe(getStages(), []);
    finalFunnelIds = Array.from(
      new Set(stages.map((s) => s.funnelId).filter(Boolean)),
    );
  }

  const funnelActivities = [];
  for (const funnelId of finalFunnelIds) {
    const activity = await safe(getFunnelActivity(period, funnelId), []);
    funnelActivities.push(activity);
  }

  return { ...metrics, funnelActivities };
}

export async function loadDashboardMetrics() {
  const stages = await safe(getStages(), []);
  const funnelIds = Array.from(
    new Set(stages.map((s) => s.funnelId).filter(Boolean)),
  );

  const currentMonth = await loadSpotterMetrics('currentMonth', funnelIds);
  const currentYear = await loadSpotterMetrics('currentYear', funnelIds);
  const last12Months = await loadSpotterMetrics('last12Months', funnelIds);

  return { currentMonth, currentYear, last12Months };
}
