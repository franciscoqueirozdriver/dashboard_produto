import { safe } from '@/lib/safe';

const BASE_URL = 'https://api.exactspotter.com/v3';

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

async function fetchSpotter(url) {
  const token = process.env.TOKEN_EXACT;
  if (!token) {
    console.error("TOKEN_EXACT ausente");
    return { value: [] };
  }
  const r = await fetch(url, {
    headers: { "Content-Type": "application/json", "token_exact": token },
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    console.error(`Spotter FAIL ${r.status} ${url} -> ${text}`);
    return { value: [] };
  }
  return r.json();
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

export const getLeads = (qs = "") =>
  fetchSpotter(`https://api.exactspotter.com/v3/Leads${qs}`);

export const getLeadsSold = (qs = "") =>
  fetchSpotter(`https://api.exactspotter.com/v3/LeadsSold${qs}`);

export const getLosts = (qs = "") =>
  fetchSpotter(`https://api.exactspotter.com/v3/Losts${qs}`);

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
