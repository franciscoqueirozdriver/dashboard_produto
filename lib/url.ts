export function readFunnelsFromURL(): number[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('funnels');
  if (!raw || raw.trim().length === 0) {
    return [];
  }
  return raw
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((id) => Number.isFinite(id));
}

export function writeFunnelsToURL(ids: number[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  const unique = Array.from(new Set(ids.filter((id) => Number.isFinite(id))));

  if (unique.length === 0) {
    url.searchParams.delete('funnels');
  } else {
    url.searchParams.set('funnels', unique.join(','));
  }
  window.history.replaceState(null, '', url.toString());
}
