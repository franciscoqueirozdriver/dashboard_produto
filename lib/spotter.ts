export type OData<T> = {
  value: T[];
  "@odata.nextLink"?: string;
};

function buildUrl(path: string, qs: string): string {
  const base = process.env.SPOTTER_BASE_URL || 'https://api.exactspotter.com/v3';
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  if (qs && /^https?:\/\//i.test(qs)) {
    return qs;
  }
  return `${base}${path}${qs}`;
}

export async function fetchSpotter<T>(path: string, qs = ''): Promise<OData<T>> {
  const token = process.env.TOKEN_EXACT;

  if (!token) {
    console.error('[SPOTTER] TOKEN_EXACT ausente');
    return { value: [] };
  }

  const url = buildUrl(path, qs);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        token_exact: token,
      },
    });

    if (!response.ok) {
      const body = await response.clone().text().catch(() => '');
      console.error('[SPOTTER] FAIL', response.status, url, body.slice(0, 500));
      return { value: [] };
    }

    return (await response.json()) as OData<T>;
  } catch (error) {
    console.error('[SPOTTER] FAIL', error);
    return { value: [] };
  }
}

export const getLeads = (qs = '') => fetchSpotter<any>('/Leads', qs);
export const getLeadsSold = (qs = '') => fetchSpotter<any>('/LeadsSold', qs);
export const getLosts = (qs = '') => fetchSpotter<any>('/Losts', qs);
