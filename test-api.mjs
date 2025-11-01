import { loadSpotterMetrics } from './lib/spotter/load.ts';

async function test() {
  console.log('Testing loadSpotterMetrics...');
  try {
    const metrics = await loadSpotterMetrics('last12Months');
    console.log('\n=== METRICS SUMMARY ===');
    console.log('Total Sales:', metrics.summary.totalSales);
    console.log('Revenue:', metrics.summary.revenue);
    console.log('Average Ticket:', metrics.summary.averageTicket);
    console.log('Leads Created:', metrics.summary.leadsCreated);
    console.log('Win Rate:', metrics.summary.winRate);
    console.log('Loss Rate:', metrics.summary.lossRate);
    console.log('\n=== PERFORMANCE LINE ===');
    console.log('Data points:', metrics.performanceLine.length);
    console.log('First 3:', JSON.stringify(metrics.performanceLine.slice(0, 3), null, 2));
    console.log('\n=== STATUS BY PRODUCT ===');
    console.log('Products:', metrics.statusByProduct.length);
    console.log('First 3:', JSON.stringify(metrics.statusByProduct.slice(0, 3), null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
