const { loadDashboardMetrics } = require('./lib/spotter/load.ts');

async function test() {
  console.log('Testing loadDashboardMetrics...');
  const metrics = await loadDashboardMetrics({});
  console.log('Metrics loaded:', JSON.stringify(metrics, null, 2));
}

test().catch(console.error);
