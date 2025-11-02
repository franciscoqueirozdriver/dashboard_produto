import { fetchSpotter, type OData } from '@/lib/spotter';
import { safe } from '@/lib/safe';
import { DEFAULT_SALES_FUNNEL_ID } from '@/lib/funnels/constants';


export type Period = 'currentMonth' | 'currentYear' | 'last12Months' | 'custom';

function getPeriod(period: Period = 'last12Months', from?: string, to?: string) {
  const now = new Date();
  if (period === 'custom' && from) {
    return from;
  }

  let startDate: Date;

  switch (period) {
    case 'currentMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'currentYear':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'last12Months':
    default:
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
      break;
  }

  startDate.setHours(0, 0, 0, 0);
  return startDate.toISOString();
}

function getFilterDate(period: Period = 'last12Months', from?: string, to?: string) {
  if (period === 'custom' && from && to) {
    return 'date ge ' + from + ' and date le ' + to;
  }
  return 'date ge ' + getPeriod(period);
}

function getLeadFilterDate(period: Period = 'last12Months', from?: string, to?: string) {
  if (period === 'custom' && from && to) {
    return 'registerDate ge ' + from + ' and registerDate le ' + to;
  }
  return 'registerDate ge ' + getPeriod(period);
}

function getSaleFilterDate(period: Period = 'last12Months', from?: string, to?: string) {
  if (period === 'custom' && from && to) {
    return 'saleDate ge ' + from + ' and saleDate le ' + to;
  }
  return 'saleDate ge ' + getPeriod(period);
}

function buildQuery(params?: Record<string, unknown>) {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    query.append(key, String(value));
  });
  const serialized = query.toString().replace(/\+/g, '%20');
  return serialized ? `?${serialized}` : '';
}

async function fetchPaginated<T>(path: string, params?: Record<string, unknown>) {
  const data: T[] = [];
  let nextPath: string | null = path;
  let nextQuery = buildQuery(params);

  while (nextPath) {
    const page: OData<T> = await fetchSpotter<T>(nextPath, nextQuery);
    const values = Array.isArray(page?.value) ? page.value : [];
    
    // Se recebeu 0 items, para a paginação mesmo que haja nextLink
    if (values.length === 0) {
      break;
    }
    
    data.push(...values);

    const nextLink = page?.['@odata.nextLink'];
    if (!nextLink) {
      nextPath = null;
      nextQuery = '';
      continue;
    }

    if (/^https?:\/\//i.test(nextLink)) {
      const url = new URL(nextLink);
      nextPath = url.pathname;
      nextQuery = url.search;
    } else {
      nextPath = nextLink.startsWith('/') ? nextLink : `/${nextLink}`;
      nextQuery = '';
    }
  }

  return data;
}

export async function getLeads(period: Period = 'last12Months', params?: Record<string, unknown>) {
  return fetchPaginated('/Leads', {
    $filter: `registerDate ge ${getPeriod(period)}`,
    ...(params || {}),
  });
}

export async function getLeadsSold(period: Period = 'last12Months', params?: Record<string, unknown>) {
  return fetchPaginated('/LeadsSold', {
    $select: 'leadId,saleDate,totalDealValue,saleStage,products',
    $filter: `saleDate ge ${getPeriod(period)}`,
    ...(params || {}),
  });
}

export async function getLosts(period: Period = 'last12Months', params?: Record<string, unknown>) {
  return fetchPaginated('/LeadsDiscarded', {
    $select: 'leadId,date,reason',
    $filter: `date ge ${getPeriod(period)}`,
    ...(params || {}),
  });
}

export async function getRecommendedProducts(params?: Record<string, unknown>) {
  return fetchPaginated('/RecommendedProducts', {
    ...(params || {}),
  });
}

export async function getProducts(params?: Record<string, unknown>) {
  return fetchPaginated('/Products', {
    ...(params || {}),
  });
}

export async function getSpotterDataset(
  period: Period = 'currentYear',
  from?: string,
  to?: string,
  funnelIds?: number[]
) {
  const normalized = Array.isArray(funnelIds)
    ? Array.from(new Set(funnelIds.filter((id) => Number.isFinite(id))))
    : undefined;

  const funnels = normalized && normalized.length > 0 ? normalized : [DEFAULT_SALES_FUNNEL_ID];

  const leadBatches = await Promise.all(
    funnels.map((funnelId) =>
      safe(
        fetchPaginated<any>('/Leads', {
          $filter: `${getLeadFilterDate(period, from, to)} and funnelId eq ${funnelId}`,
        }),
        []
      )
    )
  );

  const leadMap = new Map<number, any>();
  for (const batch of leadBatches) {
    for (const lead of batch) {
      const id = lead?.id;
      if (!Number.isFinite(id)) continue;
      if (!leadMap.has(id)) {
        leadMap.set(id, lead);
      }
    }
  }

  const leads = Array.from(leadMap.values());

  const leadIds = Array.from(leadMap.keys());
  if (leadIds.length === 0) {
    const products = await safe(fetchPaginated<any>('/Products'), []);
    return { leads, leadsSold: [], losts: [], recommendedProducts: [], products };
  }

  const leadIdFilter = `leadId in (${leadIds.join(',')})`;

  const lostsPromise = safe(
    (async () => {
      const pages = await Promise.all(
        funnels.map((funnelId) =>
          fetchPaginated<any>('/LeadsDiscarded', {
            $select:
              'leadId,date,reason,discardReason,funnelId,funnel,value,productName,source,leadSource',
            $filter: `${getFilterDate(period, from, to)} and funnelId eq ${funnelId}`,
          })
        )
      );

      const merged = new Map<number, any>();
      for (const batch of pages) {
        for (const entry of batch) {
          const id = Number(entry?.leadId ?? entry?.leadID);
          if (!Number.isFinite(id)) continue;
          if (!merged.has(id)) {
            merged.set(id, entry);
          }
        }
      }

      return Array.from(merged.values());
    })(),
    []
  );

  const [leadsSold, losts, recommendedProducts, products] = await Promise.all([
    safe(
      fetchPaginated<any>('/LeadsSold', {
        $select: 'leadId,saleDate,totalDealValue,saleStage,products',
        $filter: `${getSaleFilterDate(period, from, to)} and ${leadIdFilter}`,
      }),
      []
    ),
    lostsPromise,
    safe(
      fetchPaginated<any>('/RecommendedProducts', {
        $filter: leadIdFilter,
      }),
      []
    ),
    safe(fetchPaginated<any>('/Products'), []),
  ]);

  return { leads, leadsSold, losts, recommendedProducts, products };
}
