export type OData<T> = {
  value: T[];
  "@odata.nextLink"?: string;
};

function buildUrl(path: string, qs: string): string {
  const baseWithV3 = process.env.SPOTTER_BASE_URL || 'https://api.exactspotter.com/v3';
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  if (qs && /^https?:\/\//i.test(qs)) {
    return qs;
  }

  // If path already contains /v3, use a base URL without /v3 to avoid duplication.
  if (path.startsWith('/v3/')) {
    const baseWithoutV3 = baseWithV3.replace('/v3', '');
    return `${baseWithoutV3}${path}${qs}`;
  }

  return `${baseWithV3}${path}${qs}`;
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
      const body = await response.text().catch(() => '');
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
