const BASE_URL = 'https://api.exactspotter.com/v3';
const REVALIDATE_SECONDS = 21600;

function getHeaders() {
  const token = process.env.TOKEN_EXACT ?? '';
  if (!token) {
    throw new Error('TOKEN_EXACT não configurado. Defina a variável de ambiente antes de executar o painel.');
  }
  return {
    'Content-Type': 'application/json',
    token_exact: token,
  };
}

function getPeriodStart(months = 12) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
}

async function fetchJson(url, fetchOptions = {}) {
  const headers = getHeaders();
  const { headers: overrideHeaders, next, ...rest } = fetchOptions;
  const response = await fetch(url, {
    ...rest,
    headers: {
      ...headers,
      ...(overrideHeaders || {}),
    },
    next: {
      revalidate: REVALIDATE_SECONDS,
      ...(next || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Exact Spotter request failed (${response.status}): ${message}`);
  }

  return response.json();
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

async function fetchPaginated(endpoint, params) {
  let nextUrl = `${BASE_URL}${endpoint}${buildQuery(params)}`;
  const data = [];

  while (nextUrl) {
    const result = await fetchJson(nextUrl);
    if (Array.isArray(result.value)) {
      data.push(...result.value);
    }

    if (result['@odata.nextLink']) {
      const link = result['@odata.nextLink'];
      nextUrl = link.startsWith('http') ? link : `${BASE_URL}${link}`;
    } else {
      nextUrl = null;
    }
  }

  return data;
}

export async function getLeads() {
  return fetchPaginated('/Leads', {
    $filter: `registerDate ge ${getPeriodStart()}`,
  });
}

export async function getLeadsSold() {
  return fetchPaginated('/LeadsSold', {
    $select: 'leadId,saleDate,totalDealValue,products,saleStage',
    $filter: `saleDate ge ${getPeriodStart()}`,
  });
}

export async function getLosts() {
  return fetchPaginated('/Losts', {
    $select: 'leadId,date,reason',
    $filter: `date ge ${getPeriodStart()}`,
  });
}

export async function getProductsDictionary() {
  return fetchPaginated('/products');
}

export async function getSpotterDataset() {
  const [leadsResult, leadsSoldResult, lostsResult, productsDictionaryResult] =
    await Promise.allSettled([getLeads(), getLeadsSold(), getLosts(), getProductsDictionary()]);

  const leads = leadsResult.status === 'fulfilled' ? leadsResult.value : [];
  const leadsSold = leadsSoldResult.status === 'fulfilled' ? leadsSoldResult.value : [];
  const losts = lostsResult.status === 'fulfilled' ? lostsResult.value : [];
  const productsDictionary =
    productsDictionaryResult.status === 'fulfilled' ? productsDictionaryResult.value : [];

  if (leadsResult.status === 'rejected') {
    console.error('Falha ao carregar leads Exact Spotter', leadsResult.reason);
  }
  if (leadsSoldResult.status === 'rejected') {
    console.error('Falha ao carregar vendas Exact Spotter', leadsSoldResult.reason);
  }
  if (lostsResult.status === 'rejected') {
    console.error('Falha ao carregar perdas Exact Spotter', lostsResult.reason);
  }
  if (productsDictionaryResult.status === 'rejected') {
    console.error('Falha ao carregar catálogo de produtos Exact Spotter', productsDictionaryResult.reason);
  }

  return { leads, leadsSold, losts, productsDictionary };
}
