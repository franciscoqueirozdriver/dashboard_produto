import { fetchSpotter, type OData } from '@/lib/spotter';
import { safe } from '@/lib/safe';


export type Period = 'currentMonth' | 'currentYear' | 'last12Months';

function getPeriod(period: Period = 'last12Months') {
  const now = new Date();
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

export async function getSpotterDataset(period: Period = 'last12Months') {
  const funnelFilter = 'funnelId eq 22783';

  // Etapa 1: Buscar todos os leads do funil especificado.
  const leads = await safe(fetchPaginated<any>('/Leads', {
    $filter: `registerDate ge ${getPeriod(period)} and ${funnelFilter}`,
  }), []);

  // Etapa 2: Extrair IDs dos leads. Se não houver leads, não há necessidade de buscar vendas ou perdas.
  const leadIds = leads.map((lead: any) => lead.id).filter(Boolean);
  if (leadIds.length === 0) {
    const products = await safe(fetchPaginated<any>('/Products'), []);
    return { leads, leadsSold: [], losts: [], recommendedProducts: [], products };
  }

  // Garantir que os IDs sejam únicos para a consulta 'in'.
  const uniqueLeadIds = Array.from(new Set(leadIds));
  const leadIdFilter = `leadId in (${uniqueLeadIds.join(',')})`;

  // Etapa 3: Buscar dados relacionados (vendas, perdas, produtos) em paralelo usando os IDs dos leads.
  const [
    leadsSold,
    losts,
    recommendedProducts,
    products,
  ] = await Promise.all([
    safe(fetchPaginated<any>('/LeadsSold', {
      $select: 'leadId,saleDate,totalDealValue,saleStage,products',
      $filter: `saleDate ge ${getPeriod(period)} and ${leadIdFilter}`,
    }), []),
    safe(fetchPaginated<any>('/LeadsDiscarded', {
      $select: 'leadId,date,reason',
      $filter: `date ge ${getPeriod(period)} and ${leadIdFilter}`,
    }), []),
    safe(fetchPaginated<any>('/RecommendedProducts', {
      $filter: leadIdFilter,
    }), []),
    safe(fetchPaginated<any>('/Products'), []),
  ]);

  return { leads, leadsSold, losts, recommendedProducts, products };
}
