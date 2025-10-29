const BASE_URL = 'https://api.exactspotter.com/v3';
const HEADERS = {
  'Content-Type': 'application/json',
  token_exact: process.env.TOKEN_EXACT ?? '',
};

function getPeriodStart(months = 12) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
}

async function fetchJson(url, fetchOptions = {}) {
  if (!HEADERS.token_exact) {
    throw new Error('TOKEN_EXACT não configurado. Defina a variável de ambiente antes de executar o painel.');
  }
  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...HEADERS,
      ...(fetchOptions.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Exact Spotter request failed (${response.status}): ${message}`);
  }

  return response.json();
}

async function fetchPaginated(endpoint, searchParams = new URLSearchParams()) {
  let nextUrl = `${BASE_URL}${endpoint}`;
  const query = searchParams.toString().replace(/\+/g, '%20');
  if (query) {
    nextUrl = `${nextUrl}?${query}`;
  }
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
  const params = new URLSearchParams({
    $filter: `registerDate ge ${getPeriodStart()}`,
  });
  return fetchPaginated('/Leads', params);
}

export async function getLeadsSold() {
  const params = new URLSearchParams({
    $select: 'leadId,saleDate,totalDealValue,products,saleStage',
    $filter: `saleDate ge ${getPeriodStart()}`,
  });
  return fetchPaginated('/LeadsSold', params);
}

export async function getLosts() {
  const params = new URLSearchParams({
    $select: 'leadId,date,reason,products',
    $filter: `date ge ${getPeriodStart()}`,
  });
  return fetchPaginated('/Losts', params);
}

export async function getProductsDictionary() {
  return fetchPaginated('/products');
}

export async function getSpotterDataset() {
  const [leads, leadsSold, losts, productsDictionary] = await Promise.all([
    getLeads(),
    getLeadsSold(),
    getLosts(),
    getProductsDictionary(),
  ]);

  return { leads, leadsSold, losts, productsDictionary };
}
