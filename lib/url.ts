export function readFunnelsFromURL(): number[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('funnels');
  if (!raw || raw.trim().length === 0 || raw.toLowerCase() === 'none') {
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
  if (ids.length === 0) {
    url.searchParams.set('funnels', 'none');
  } else {
    const unique = Array.from(new Set(ids.filter((id) => Number.isFinite(id))));
    url.searchParams.set('funnels', unique.join(','));
  }
  window.history.replaceState(null, '', url.toString());
}
