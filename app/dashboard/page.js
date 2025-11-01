import { loadDashboardMetrics } from '@/lib/spotter/load.ts';
import { DashboardRotator } from '@/components/dashboard-rotator';
import { DashboardContent } from '@/components/dashboard-content';

export const revalidate = 21600;
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const allMetrics = await loadDashboardMetrics();

  return (
    <DashboardRotator allMetrics={allMetrics} />
  );
}
