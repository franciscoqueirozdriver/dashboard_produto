import { fetchSpotter, type OData } from '@/lib/spotter';
import { safe } from '@/lib/safe';

function getPeriodStart(months = 12) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
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
      nextPath = nextLink;
      nextQuery = '';
    } else {
      nextPath = nextLink.startsWith('/') ? nextLink : `/${nextLink}`;
      nextQuery = '';
    }
  }

  return data;
}

export async function getLeads(params?: Record<string, unknown>) {
  return fetchPaginated('/Leads', {
    $filter: `registerDate ge ${getPeriodStart()}`,
    ...(params || {}),
  });
}

export async function getLeadsSold(params?: Record<string, unknown>) {
  return fetchPaginated('/LeadsSold', {
    $select: 'leadId,saleDate,totalDealValue,saleStage,product',
    $filter: `saleDate ge ${getPeriodStart()}`,
    ...(params || {}),
  });
}

export async function getLosts(params?: Record<string, unknown>) {
  return fetchPaginated('/Losts', {
    $select: 'leadId,date,reason',
    $filter: `date ge ${getPeriodStart()}`,
    ...(params || {}),
  });
}

export async function getSpotterDataset() {
  const [{ value: leads }, { value: leadsSold }, { value: losts }] = await Promise.all([
    safe(fetchSpotter<any>('/Leads', buildQuery({
      $filter: `registerDate ge ${getPeriodStart()}`,
    })), { value: [] }),
    safe(fetchSpotter<any>('/LeadsSold', buildQuery({
      $select: 'leadId,saleDate,totalDealValue,saleStage,product',
      $filter: `saleDate ge ${getPeriodStart()}`,
    })), { value: [] }),
    safe(fetchSpotter<any>('/Losts', buildQuery({
      $select: 'leadId,date,reason',
      $filter: `date ge ${getPeriodStart()}`,
    })), { value: [] }),
  ]);

  return { leads, leadsSold, losts, productsDictionary: [] as any[] };
}

