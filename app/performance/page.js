import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceLine } from '@/components/graphs/performance-line';
import { SalesByMonthChart } from '@/components/graphs/monthly-sales';
import { loadSpotterMetrics } from '@/lib/spotter/load.ts';
import { CardSkeleton } from '@/components/ui/card-skeleton';
import { resolveFunnelSelection } from '@/lib/exactspotter/funnels';
import FunnelPickerControl from '@/components/FunnelPickerControl';
import { FunnelsEmptyState } from '@/components/funnels-empty-state';

export const revalidate = 21600;
export const dynamic = 'force-dynamic';

async function PerformanceChart({ funnels }) {
  const { performanceLine } = await loadSpotterMetrics('currentYear', funnels);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-muted-foreground">Receita acumulada</CardTitle>
      </CardHeader>
      <CardContent className="h-[420px]">
        <PerformanceLine data={performanceLine} />
      </CardContent>
    </Card>
  );
}

async function SalesChart({ funnels }) {
  const { salesByMonth } = await loadSpotterMetrics('currentYear', funnels);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-muted-foreground">Performance por Mês</CardTitle>
      </CardHeader>
      <CardContent className="h-[420px]">
        <SalesByMonthChart data={salesByMonth} />
      </CardContent>
    </Card>
  );
}

export default async function PerformancePage({ searchParams }) {
  const { selectedIds, explicit, available } = await resolveFunnelSelection(searchParams);
  const hasActive = available.length > 0;
  const hasSelection = selectedIds.length > 0;
  const showEmptyState = !hasSelection && (explicit || !hasActive);
  const emptyMessage = hasActive
    ? 'Selecione ao menos um funil para visualizar os dados.'
    : 'Nenhum funil ativo disponível no momento.';

  return (
    <main className="space-y-10 px-12 py-10">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-5xl font-bold tracking-tight">Performance de Vendas</h1>
          <FunnelPickerControl value={selectedIds} />
        </div>
        <p className="text-xl text-muted-foreground max-w-4xl">
          Evolução mensal de receita e volume de vendas nos últimos 12 meses.
        </p>
      </header>

      {showEmptyState ? (
        <FunnelsEmptyState message={emptyMessage} />
      ) : (
        <section className="grid gap-6 xl:grid-cols-2">
          <Suspense fallback={<CardSkeleton />}>
            <PerformanceChart funnels={selectedIds} />
          </Suspense>
          <Suspense fallback={<CardSkeleton />}>
            <SalesChart funnels={selectedIds} />
          </Suspense>
        </section>
      )}
    </main>
  );
}
