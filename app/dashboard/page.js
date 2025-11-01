import { Suspense } from 'react';
import { loadDashboardMetrics } from '@/lib/spotter/load.ts';
import { DashboardRotator } from '@/components/dashboard-rotator';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';

export const revalidate = 21600;
export const dynamic = 'force-dynamic';

async function DashboardData({ searchParams }) {
  const allMetrics = await loadDashboardMetrics(searchParams);
  return <DashboardRotator allMetrics={allMetrics} />;
}

export default function DashboardPage({ searchParams }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData searchParams={searchParams} />
    </Suspense>
  );
}
