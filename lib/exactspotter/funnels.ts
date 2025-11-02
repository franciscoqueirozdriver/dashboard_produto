import { safe } from '@/lib/safe';
import { DEFAULT_SALES_FUNNEL_ID } from '@/lib/funnels/constants';

export type ActiveFunnel = { id: number; name: string };

type FunnelCache = { expiresAt: number; data: ActiveFunnel[] } | null;

const FIVE_MINUTES = 5 * 60 * 1000;
let cache: FunnelCache = null;

function getToken() {
  return process.env.NEXT_PUBLIC_EXACTSPOTTER_TOKEN ?? '';
}

export async function fetchActiveFunnels(): Promise<ActiveFunnel[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.data;
  }

  const token = getToken();
  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Missing NEXT_PUBLIC_EXACTSPOTTER_TOKEN for ExactSpotter funnels request');
    }
    return [];
  }

  try {
    const response = await fetch('https://api.exactspotter.com/v3/Funnels', {
      headers: {
        'Content-Type': 'application/json',
        token_exact: token,
      },
      cache: 'no-store',
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

  const defaultSelection = [DEFAULT_SALES_FUNNEL_ID];

  if (explicit) {
    const filtered = ids.filter((id) => (activeSet.size === 0 ? true : activeSet.has(id)));
    const selection = filtered.length > 0 ? filtered : defaultSelection;
    return {
      selectedIds: selection,
      explicit,
      available: activeFunnels,
    };
  }

  return {
    selectedIds: defaultSelection,
    explicit,
    available: activeFunnels,
  };
}
