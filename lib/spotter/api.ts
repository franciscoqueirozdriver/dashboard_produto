import 'server-only';

const BASE = 'https://api.exactspotter.com/v3';
const TOKEN = process.env.TOKEN_EXACT;

type ODataList<T> = { value: T[]; ['@odata.nextLink']?: string };

const headers = () =>
  TOKEN
    ? {
        'Content-Type': 'application/json',
        token_exact: TOKEN, // V3 exige este header
      }
    : { 'Content-Type': 'application/json' };

async function fetchJson<T>(endpoint: string): Promise<T> {
  if (!TOKEN) {
    console.warn('[Spotter] TOKEN_EXACT ausente');
    return ([] as unknown) as T;
  }
  const res = await fetch(`${BASE}${endpoint}`, { headers: headers(), cache: 'no-store' });
  if (!res.ok) {
    console.warn(`[Spotter] ${res.status} ${res.statusText}: ${endpoint}`);
    return ([] as unknown) as T;
  }
  return res.json();
}

async function fetchPaged<T>(endpoint: string): Promise<T[]> {
  const all: T[] = [];
  let url = endpoint;
  for (let i = 0; i < 200; i++) {
    const data = await fetchJson<ODataList<T>>(url);
    if (data?.value) all.push(...data.value);
    if (!data?.['@odata.nextLink']) break;
    url = data['@odata.nextLink'].replace(/^https?:\/\/[^/]+\/v3/i, '');
    await new Promise((r) => setTimeout(r, 800));
  }
  return all;
}

/* ------------------ Endpoints de Dashboard (doc V3) ------------------ */
// Funil Gerencial
export async function getFunnelActivity(params: {
  dataInicial: string;
  dataFinal: string;
  funilId?: number;
}) {
  const q = new URLSearchParams({
    dataInicial: params.dataInicial,
    dataFinal: params.dataFinal,
    ...(params.funilId ? { funilId: String(params.funilId) } : {}),
  });
  return fetchPaged<any>(`/FunnelActivity?${q.toString()}`);
}
// Desempenho de Vendas — Vendedores
export async function getSellerPerformance(params: {
  dataInicial: string;
  dataFinal: string;
  funilId?: number;
}) {
  const q = new URLSearchParams({
    dataInicial: params.dataInicial,
    dataFinal: params.dataFinal,
    ...(params.funilId ? { funilId: String(params.funilId) } : {}),
  });
  return fetchPaged<any>(`/SellerPerformance?${q.toString()}`);
}
// Desempenho de Vendas — Pré-vendedores
export async function getPreSalesPerformance(params: {
  dataInicial: string;
  dataFinal: string;
  funilId?: number;
}) {
  const q = new URLSearchParams({
    dataInicial: params.dataInicial,
    dataFinal: params.dataFinal,
    ...(params.funilId ? { funilId: String(params.funilId) } : {}),
  });
  return fetchPaged<any>(`/PreSalesPerformance?${q.toString()}`);
}
// Métricas de Vendedores
export async function getSellersMetrics(params: {
  dataInicial: string;
  dataFinal: string;
  funilId?: number;
}) {
  const q = new URLSearchParams({
    dataInicial: params.dataInicial,
    dataFinal: params.dataFinal,
    ...(params.funilId ? { funilId: String(params.funilId) } : {}),
  });
  return fetchPaged<any>(`/SellersMetrics?${q.toString()}`);
}
// Previsão de Negócios por Mês ($)
export async function getMonthlyDealForecast(params: {
  dataInicial: string;
  dataFinal: string;
  funilId?: number;
}) {
  const q = new URLSearchParams({
    dataInicial: params.dataInicial,
    dataFinal: params.dataFinal,
    ...(params.funilId ? { funilId: String(params.funilId) } : {}),
  });
  return fetchPaged<any>(`/MonthlyDealForecast?${q.toString()}`);
}

/* ------------------ Dataset usado hoje nas telas ------------------ */
export async function getSpotterDataset() {
  // Ajuste os períodos conforme sua UI (mantendo API estável).
  const params = { dataInicial: '2025-01-01', dataFinal: '2025-12-31' };
  const [funnel, sellers, presales, metrics, forecast] = await Promise.all([
    getFunnelActivity(params),
    getSellerPerformance(params),
    getPreSalesPerformance(params),
    getSellersMetrics(params),
    getMonthlyDealForecast(params),
  ]);
  return { funnel, sellers, presales, metrics, forecast };
}

/* ------------------ Endpoints futuros (somente código, sem UI) ------------------ */
// Exemplos de brutos: Persons, Leads, Tasks etc. Mantidos prontos p/ consumo futuro.
export async function listPersonsRaw(query = '?$top=500') {
  return fetchPaged<any>(`/Persons${query.startsWith('?') ? query : '?' + query}`);
}
export async function listLeadsRaw(query = '?$top=500') {
  return fetchPaged<any>(`/Leads${query.startsWith('?') ? query : '?' + query}`);
}
export async function listTasksRaw(query = '?$top=500') {
  return fetchPaged<any>(`/Tasks${query.startsWith('?') ? query : '?' + query}`);
}
