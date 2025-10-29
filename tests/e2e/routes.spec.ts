import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/dashboard',
  '/status-produto',
  '/top-produtos',
  '/ticket-medio',
  '/motivos-descarte',
  '/performance',
];

test.describe('application routes', () => {
  for (const route of ROUTES) {
    test(`renders ${route}`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator('main')).toBeVisible();
    });
  }

  test('health endpoint responds with 200', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(typeof body.now).toBe('string');
  });

  test('dashboard handles Spotter API failures without 404', async ({ page }) => {
    await page.route('https://api.exactspotter.com/v3/**', (route) => {
      return route.fulfill({ status: 500, body: 'server error' });
    });

    const response = await page.goto('/dashboard');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Painel Geral' })).toBeVisible();
  });
});
