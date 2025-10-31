import { loadDashboardMetrics } from '@/lib/spotter/load.ts';
import { DashboardRotator } from '@/components/dashboard-rotator';

export const revalidate = 21600;
export const dynamic = 'force-static';

export default async function DashboardPage() {
  const allMetrics = await loadDashboardMetrics();

  return (
    <DashboardRotator allMetrics={allMetrics} />
  );
}
