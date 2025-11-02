import { safe } from '@/lib/safe';
import { getSpotterDataset, Period } from '@/lib/spotter/api';
import { resolveFunnelSelection } from '@/lib/exactspotter/funnels';
import { DEFAULT_SALES_FUNNEL_ID } from '@/lib/funnels/constants';
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

const EMPTY_DATASET = {
  leads: [],
  leadsSold: [],
  losts: [],
  recommendedProducts: [],
  products: [],
};

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

export async function loadSpotterMetrics(period: Period = 'currentYear', funnelIds?: number[]) {
  try {
    const effective = Array.isArray(funnelIds) && funnelIds.length > 0 ? funnelIds : undefined;
    const rawData = await safe(getSpotterDataset(period, undefined, undefined, effective), EMPTY_DATASET);

    const dataset = buildDataset(rawData);
    return assembleMetrics(dataset);
  } catch (error) {
    console.error(`[METRICS] Failed to load metrics for period: ${period}`, error);
    // Retorna estrutura vazia em vez de null para evitar erros de renderização
    return assembleMetrics(buildDataset(EMPTY_DATASET));
  }
}

export async function loadSpotterMetricsCustom(from: string, to: string, funnelIds?: number[]) {
  try {
    const effective = Array.isArray(funnelIds) && funnelIds.length > 0 ? funnelIds : undefined;
    const rawData = await safe(getSpotterDataset('custom', from, to, effective), EMPTY_DATASET);

    const dataset = buildDataset(rawData);
    return assembleMetrics(dataset);
  } catch (error) {
    console.error(`[METRICS] Failed to load custom metrics from ${from} to ${to}`, error);
    // Retorna estrutura vazia em vez de null para evitar erros de renderização
    return assembleMetrics(buildDataset(EMPTY_DATASET));
  }
}

export async function loadDashboardMetrics(
  searchParams: { [key: string]: string | string[] | undefined },
  funnelIds?: number[],
  explicitSelection = false
) {
  const from = searchParams.from as string | undefined;
  const to = searchParams.to as string | undefined;

  let selection = funnelIds;
  let explicit = explicitSelection;

  if (!Array.isArray(selection)) {
    const resolved = await resolveFunnelSelection(searchParams);
    selection = resolved.selectedIds;
    explicit = resolved.explicit;
  }

  const normalizedSelection = Array.isArray(selection)
    ? Array.from(new Set(selection.filter((id) => Number.isFinite(id))))
    : [];

  const selectedFunnels = normalizedSelection.length > 0
    ? normalizedSelection
    : [DEFAULT_SALES_FUNNEL_ID];

  if (from && to) {
    const customPeriod = await loadSpotterMetricsCustom(from, to, selectedFunnels);
    return { customPeriod, selectedFunnels, funnelsExplicit: explicit };
  }


  // Ajustado para usar currentYear como padrão já que dados só existem a partir de 06/2025
  const [currentMonth, currentYear, last12Months] = await Promise.all([
    loadSpotterMetrics('currentMonth', selectedFunnels),
    loadSpotterMetrics('currentYear', selectedFunnels),
    loadSpotterMetrics('currentYear', selectedFunnels), // Usando currentYear em vez de last12Months
  ]);

  return {
    currentMonth,
    currentYear,
    last12Months,
    selectedFunnels,
    funnelsExplicit: explicit,
  };
}
