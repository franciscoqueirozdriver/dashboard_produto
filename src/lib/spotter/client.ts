const BASE = "https://api.exactspotter.com/v3";

function getToken(): string {
  const t = process.env.EXACT_API_TOKEN || process.env.TOKEN_EXACT;
  if (!t) throw new Error("EXACT_API_TOKEN/TOKEN_EXACT ausente");
  return t;
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", token_exact: getToken() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

/** Carrega todas as páginas OData seguindo @odata.nextLink */
export async function fetchAllOData(path: string): Promise<any[]> {
  let url = `${BASE}/${path}`;
  const out: any[] = [];
  for (let i = 0; i < 50 && url; i++) {
    const data = await fetchJson(url);
    const rows = Array.isArray(data?.value) ? data.value : [];
    out.push(...rows);
    const next: string | undefined = (data as any)?.["@odata.nextLink"];
    url = next ?? "";
  }
  return out;
}
