import { safe } from '@/lib/safe';

export type ActiveFunnel = { id: number; name: string };

type FunnelCache = { expiresAt: number; data: ActiveFunnel[] } | null;

const FIVE_MINUTES = 5 * 60 * 1000;
let cache: FunnelCache = null;

function getToken() {
  return (
    process.env.TOKEN_EXACT ??
    process.env.NEXT_PUBLIC_EXACTSPOTTER_TOKEN ??
    process.env.NEXT_PUBLIC_TOKEN_EXACT ??
    ''
  );
}

export async function fetchActiveFunnels(): Promise<ActiveFunnel[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.data;
  }

  const token = getToken();
  if (!token) {
    return [];
  }

  try {
    const response = await fetch('https://api.exactspotter.com/v3/Funnels', {
      headers: {
        'Content-Type': 'application/json',
        token_exact: token,
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload = await safe(response.json(), { value: [] as any[] });
    const rows = Array.isArray(payload?.value) ? payload.value : [];
    const mapped = rows
      .filter((item: any) => item?.active === true)
      .map((item: any) => ({
        id: Number(item?.id),
        name: String(item?.value ?? ''),
      }))
      .filter((item) => Number.isFinite(item.id) && item.name.length > 0);

    cache = {
      data: mapped,
      expiresAt: now + FIVE_MINUTES,
    };

    return mapped;
  } catch (error) {
    return [];
  }
}

function normalizeFunnelsParam(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return { ids: [] as number[], explicit: false };
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { ids: [] as number[], explicit: true };
  }

  if (trimmed.toLowerCase() === 'none') {
    return { ids: [] as number[], explicit: true };
  }

  const ids = trimmed
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id));

  return { ids, explicit: true };
}

export async function resolveFunnelSelection(
  searchParams: { [key: string]: string | string[] | undefined } = {}
) {
  const rawParam = searchParams?.funnels;
  const rawValue = Array.isArray(rawParam) ? rawParam[0] : rawParam ?? null;
  const { ids, explicit } = normalizeFunnelsParam(rawValue);

  const activeFunnels = await fetchActiveFunnels();
  const activeSet = new Set(activeFunnels.map((item) => item.id));

  if (explicit) {
    const filtered = ids.filter((id) => activeSet.has(id));
    return {
      selectedIds: filtered,
      explicit,
      available: activeFunnels,
    };
  }

  const selectedIds = activeFunnels.map((item) => item.id);
  return {
    selectedIds,
    explicit,
    available: activeFunnels,
  };
}
