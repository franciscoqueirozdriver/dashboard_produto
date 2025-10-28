import { safe } from '@/lib/safe';

const BASE_URL = 'https://api.exactspotter.com/v3';
const REVALIDATE_SECONDS = 21600;

function getPeriodStart(months = 12) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
}

function buildQuery(params) {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    query.append(key, String(value));
  });
  const serialized = query.toString().replace(/\+/g, '%20');
  return serialized ? `?${serialized}` : '';
}

async function fetchSpotter(url, init = {}) {
  const token = process.env.TOKEN_EXACT;

  if (!token) {
    console.error('TOKEN_EXACT ausente');
    return { value: [] };
  }

  let response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        token_exact: token,
        ...(init.headers || {}),
      },
      next: {
        revalidate: REVALIDATE_SECONDS,
        ...(init.next || {}),
      },
    });
  } catch (error) {
    console.error('Spotter FAIL fetch', url, error);
    return { value: [] };
  }

  if (!response.ok) {
    const text = await safe(response.text(), '');
    console.error(`Spotter FAIL ${response.status} ${url} -> ${text}`);
    return { value: [] };
  }

  try {
    return await response.json();
  } catch (error) {
    console.error('Spotter FAIL parse', url, error);
    return { value: [] };
  }
}

async function fetchPaginated(endpoint, params) {
  let nextUrl = `${BASE_URL}${endpoint}${buildQuery(params)}`;
  const data = [];

  while (nextUrl) {
    const page = await fetchSpotter(nextUrl);

    if (!page || !Array.isArray(page.value)) {
      break;
    }

    data.push(...page.value);

    if (page['@odata.nextLink']) {
      const link = page['@odata.nextLink'];
      nextUrl = link.startsWith('http') ? link : `${BASE_URL}${link}`;
    } else {
      nextUrl = null;
    }
  }

  return data;
}

export async function getLeads(params) {
  return fetchPaginated('/Leads', {
    $filter: `registerDate ge ${getPeriodStart()}`,
    ...(params || {}),
  });
}

export async function getLeadsSold(params) {
  return fetchPaginated('/LeadsSold', {
    $select: 'leadId,saleDate,totalDealValue,products,saleStage',
    $filter: `saleDate ge ${getPeriodStart()}`,
    ...(params || {}),
  });
}

export async function getLosts(params) {
  return fetchPaginated('/Losts', {
    $select: 'leadId,date,reason',
    $filter: `date ge ${getPeriodStart()}`,
    ...(params || {}),
  });
}

export async function getProductsDictionary(params) {
  return fetchPaginated('/products', params);
}

export async function getSpotterDataset() {
  const [leads, leadsSold, losts, productsDictionary] = await Promise.all([
    safe(getLeads(), []),
    safe(getLeadsSold(), []),
    safe(getLosts(), []),
    safe(getProductsDictionary(), []),
  ]);

  return { leads, leadsSold, losts, productsDictionary };
}
