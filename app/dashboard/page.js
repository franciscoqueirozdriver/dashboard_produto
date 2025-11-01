import { Suspense } from 'react';
import { loadDashboardMetrics } from '@/lib/spotter/load.ts';
import { DashboardRotator } from '@/components/dashboard-rotator';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';

export const revalidate = 21600;
export const dynamic = 'force-dynamic';

async function DashboardData({ searchParams }) {
  const allMetrics = await loadDashboardMetrics(searchParams);

  // Normaliza a estrutura de métricas para que DashboardRotator sempre receba as 3 chaves esperadas.
  const metricsToDisplay = allMetrics.customPeriod
    ? {
        currentMonth: allMetrics.customPeriod,
        currentYear: allMetrics.customPeriod,
        last12Months: allMetrics.customPeriod,
      }
    : allMetrics;

  return <DashboardRotator allMetrics={metricsToDisplay} />;
}

export default function DashboardPage({ searchParams }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData searchParams={searchParams} />
    </Suspense>
  );
}
