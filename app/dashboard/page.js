import { Suspense } from 'react';
import { loadDashboardMetrics } from '@/lib/spotter/load.ts';
import { DashboardRotator } from '@/components/dashboard-rotator';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';

export const revalidate = 21600;
export const dynamic = 'force-dynamic';

async function DashboardData() {
  const allMetrics = await loadDashboardMetrics();
  return <DashboardRotator allMetrics={allMetrics} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}
