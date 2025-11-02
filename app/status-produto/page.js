import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusByProductChart } from '@/components/graphs/status-by-product';
import { loadSpotterMetrics } from '@/lib/spotter/load.ts';
import { CardSkeleton } from '@/components/ui/card-skeleton';
import { resolveFunnelSelection } from '@/lib/exactspotter/funnels';
import FunnelPickerControl from '@/components/FunnelPickerControl';

export const revalidate = 21600;
export const dynamic = 'force-dynamic';

async function ChartData({ funnels }) {
  const { statusByProduct } = await loadSpotterMetrics('currentYear', funnels);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-muted-foreground">Status consolidado</CardTitle>
      </CardHeader>
      <CardContent className="h-[580px]">
        <StatusByProductChart data={statusByProduct} />
      </CardContent>
    </Card>
  );
}

export default async function StatusProdutoPage({ searchParams }) {
  const { selectedIds } = await resolveFunnelSelection(searchParams);

  return (
    <main className="space-y-10 px-12 py-10">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-5xl font-bold tracking-tight">Status por Produto</h1>
          <FunnelPickerControl value={selectedIds} />
        </div>
        <p className="text-xl text-muted-foreground max-w-4xl">
          Distribuição de negociações ganhas, perdidas e em andamento por produto nos últimos 12 meses.
        </p>
      </header>

      <Suspense fallback={<CardSkeleton />}>
        <ChartData funnels={selectedIds} />
      </Suspense>
    </main>
  );
}
