import { Suspense } from 'react';
import { loadDashboardMetrics } from '@/lib/spotter/load';
import { DashboardRotator } from '@/components/dashboard-rotator';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';

export const revalidate = 21600;
export const dynamic = 'force-dynamic';

interface DashboardDataProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function DashboardData({ searchParams }: DashboardDataProps) {
  const allMetrics = await loadDashboardMetrics(searchParams);
  return <DashboardRotator allMetrics={allMetrics} />;
}

interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData searchParams={searchParams} />
    </Suspense>
  );
}
