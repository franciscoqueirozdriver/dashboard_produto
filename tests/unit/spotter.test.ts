import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}), { virtual: true });

declare const global: typeof globalThis;

describe('spotter api', () => {
  const originalEnv = { ...process.env };
  let fetchMock: ReturnType<typeof vi.fn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    fetchMock = vi.fn();
    // @ts-expect-error allow override for tests
    global.fetch = fetchMock;
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    warnSpy.mockRestore();
    // @ts-expect-error cleanup
    delete global.fetch;
  });

  it('warns and returns empty array when TOKEN_EXACT is missing', async () => {
    delete process.env.TOKEN_EXACT;

    const { getFunnelActivity } = await import('@/lib/spotter/api');
    const result = await getFunnelActivity({ dataInicial: '2025-01-01', dataFinal: '2025-01-31' });

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('[Spotter] TOKEN_EXACT ausente');
  });

  it('warns and returns empty array when response is not ok', async () => {
    process.env.TOKEN_EXACT = 'test-token';

    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Error',
    });

    const { getFunnelActivity } = await import('@/lib/spotter/api');
    const params = { dataInicial: '2025-01-01', dataFinal: '2025-01-31' };
    const result = await getFunnelActivity(params);

    expect(result).toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.exactspotter.com/v3/FunnelActivity?dataInicial=2025-01-01&dataFinal=2025-01-31',
      expect.objectContaining({
        headers: expect.objectContaining({ token_exact: 'test-token' }),
      })
    );
    expect(warnSpy).toHaveBeenCalledWith(
      '[Spotter] 500 Internal Error: /FunnelActivity?dataInicial=2025-01-01&dataFinal=2025-01-31'
    );
  });

  it('resolves values when API succeeds', async () => {
    process.env.TOKEN_EXACT = 'success-token';

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: vi.fn().mockResolvedValue({
        value: [{ id: 1 }],
        '@odata.nextLink': undefined,
      }),
    });

    const { getSellerPerformance } = await import('@/lib/spotter/api');
    const params = { dataInicial: '2025-01-01', dataFinal: '2025-01-31' };
    const result = await getSellerPerformance(params);

    expect(result).toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.exactspotter.com/v3/SellerPerformance?dataInicial=2025-01-01&dataFinal=2025-01-31',
      expect.objectContaining({
        headers: expect.objectContaining({
          token_exact: 'success-token',
          'Content-Type': 'application/json',
        }),
        cache: 'no-store',
      })
    );
  });
});
