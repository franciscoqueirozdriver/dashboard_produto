import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchSpotter } from '@/lib/spotter';

declare const global: typeof globalThis;

describe('fetchSpotter', () => {
  const originalEnv = { ...process.env };
  let fetchMock: ReturnType<typeof vi.fn>;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    consoleSpy.mockRestore();
    delete global.fetch;
  });

  it('returns empty value and logs when TOKEN_EXACT is missing', async () => {
    delete process.env.TOKEN_EXACT;

    const result = await fetchSpotter('/Leads');

    expect(result).toEqual({ value: [] });
    expect(consoleSpy).toHaveBeenCalledWith('[SPOTTER] TOKEN_EXACT ausente');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns empty value and logs when response is not ok', async () => {
    process.env.TOKEN_EXACT = 'test-token';
    process.env.SPOTTER_BASE_URL = 'https://example.com';

    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue('server error'),
      clone: vi.fn().mockReturnThis(),
    });

    const result = await fetchSpotter('/Leads');

    expect(result).toEqual({ value: [] });
    expect(consoleSpy).toHaveBeenCalledWith(
      '[SPOTTER] FAIL',
      500,
      'https://example.com/Leads',
      'server error'
    );
  });
});
