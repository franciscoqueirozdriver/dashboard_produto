import { Suspense } from 'react';
import { loadDashboardMetrics } from '@/lib/spotter/load';
import { DashboardRotator } from '@/components/dashboard-rotator';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { resolveFunnelSelection } from '@/lib/exactspotter/funnels';

export const revalidate = 21600;
export const dynamic = 'force-dynamic';

interface DashboardDataProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

interface DashboardDataExtraProps {
  funnels: number[];
  explicit: boolean;
  hasActive: boolean;
}

async function DashboardData({ searchParams, funnels, explicit, hasActive }: DashboardDataProps & DashboardDataExtraProps) {
  const allMetrics = await loadDashboardMetrics(searchParams, funnels, explicit);
  return (
    <DashboardRotator
      allMetrics={allMetrics}
      selectedFunnels={funnels}
      funnelsExplicit={explicit}
      hasActiveFunnels={hasActive}
    />
  );
}

interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { selectedIds, explicit, available } = await resolveFunnelSelection(searchParams);
  const hasActive = available.length > 0;

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData
        searchParams={searchParams}
        funnels={selectedIds}
        explicit={explicit}
        hasActive={hasActive}
      />
    </Suspense>
  );
}
