import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiscardReasonsChart } from '@/components/graphs/discard-reasons';
import { loadSpotterMetrics } from '@/lib/spotter/load.ts';
import { CardSkeleton } from '@/components/ui/card-skeleton';
import { resolveFunnelSelection } from '@/lib/exactspotter/funnels';
import FunnelPickerControl from '@/components/FunnelPickerControl';

export const revalidate = 21600;
export const dynamic = 'force-dynamic';

async function ChartData({ funnels }) {
  const { discardChartData, discardReasonKeys } = await loadSpotterMetrics('currentYear', funnels);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-muted-foreground">Motivos por produto</CardTitle>
      </CardHeader>
      <CardContent className="h-[600px]">
        <DiscardReasonsChart data={discardChartData} keys={discardReasonKeys} />
      </CardContent>
    </Card>
  );
}

export default async function MotivosDescartePage({ searchParams }) {
  const { selectedIds } = await resolveFunnelSelection(searchParams);

  return (
    <main className="space-y-10 px-12 py-10">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-5xl font-bold tracking-tight">Motivos de Descarte</h1>
          <FunnelPickerControl value={selectedIds} />
        </div>
        <p className="text-xl text-muted-foreground max-w-4xl">
          Visão dos principais motivos de descarte por produto para atuar na redução de perdas.
        </p>
      </header>

      <Suspense fallback={<CardSkeleton />}>
        <ChartData funnels={selectedIds} />
      </Suspense>
    </main>
  );
}
