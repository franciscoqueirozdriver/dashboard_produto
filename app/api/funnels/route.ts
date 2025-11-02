import { NextResponse } from 'next/server';

type RawFunnel = { value?: string; active?: boolean; id?: number };
type RawResp = { value?: RawFunnel[]; ['@odata.nextLink']?: string };

export async function GET() {
  const token = process.env.EXACTSPOTTER_TOKEN ?? '';
  const base =
    process.env.EXACTSPOTTER_BASE_URL ?? 'http://apiv3.exactspotter.com:81/api/v3';

  if (!token) {
    return NextResponse.json({ value: [] }, { status: 200 });
  }

  const all: { id: number; name: string; active: boolean }[] = [];
  let nextUrl: string | null = `${base}/Funnels?$top=500`;

  while (nextUrl) {
    let response: Response;
    try {
      response = await fetch(nextUrl, {
        headers: {
          'Content-Type': 'application/json',
          token_exact: token,
        },
        cache: 'no-store',
      });
    } catch {
      break;
    }

    if (!response.ok) {
      break;
    }

    let payload: RawResp;
    try {
      payload = (await response.json()) as RawResp;
    } catch {
      break;
    }

    const rows = Array.isArray(payload?.value) ? payload.value : [];
    for (const row of rows) {
      const id = Number(row?.id);
      const name = String(row?.value ?? '');
      const active = Boolean(row?.active);
      if (Number.isFinite(id)) {
        all.push({ id, name, active });
      }
    }

    const link = payload?.['@odata.nextLink'];
    if (typeof link === 'string' && link.length > 0) {
      try {
        const url = new URL(link, base);
        nextUrl = url.toString();
      } catch {
        nextUrl = null;
      }
    } else {
      nextUrl = null;
    }
  }

  const activeFunnels = all
    .filter((item) => item.active)
    .map((item) => ({ id: item.id, name: item.name }));

  return NextResponse.json({ value: activeFunnels }, { status: 200 });
}
