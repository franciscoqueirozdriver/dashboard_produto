import { NextResponse } from 'next/server';

type RawFunnel = { value?: string; active?: boolean; id?: number };
type RawResp = { value?: RawFunnel[]; ['@odata.nextLink']?: string };

export async function GET() {
  const token = process.env.TOKEN_EXACT ?? '';
  const base = (process.env.SPOTTER_BASE_URL ?? 'https://api.exactspotter.com/v3').replace(
    /\/+$/,
    ''
  );

  const debug: string[] = [];
  if (!token) {
    const res = NextResponse.json({ value: [] }, { status: 200 });
    res.headers.set('x-debug', 'missing_TOKEN_EXACT');
    return res;
  }

  const all: { id: number; name: string; active: boolean }[] = [];
  let url: string | null = `${base}/Funnels?$top=500`;

  try {
    while (url) {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          token_exact: token,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        debug.push(`http_${response.status}`);
        break;
      }

      const payload = (await response.json()) as RawResp;
      const rows = Array.isArray(payload?.value) ? payload.value : [];
      for (const row of rows) {
        const id = Number(row?.id);
        if (Number.isFinite(id)) {
          all.push({
            id,
            name: String(row?.value ?? ''),
            active: Boolean(row?.active),
          });
        }
      }

      const next = payload?.['@odata.nextLink'];
      if (typeof next === 'string' && next.length > 0) {
        try {
          url = new URL(next, base).toString();
        } catch {
          url = null;
          debug.push('bad_nextLink');
        }
      } else {
        url = null;
      }
    }
  } catch (error) {
    debug.push('fetch_error');
    console.error('funnels_api_error', error);
  }

  const active = all.filter((item) => item.active).map((item) => ({ id: item.id, name: item.name }));
  const res = NextResponse.json({ value: active }, { status: 200 });
  res.headers.set('x-debug', debug.length ? debug.join(',') : 'ok');
  return res;
}
