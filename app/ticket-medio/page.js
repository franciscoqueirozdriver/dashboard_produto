import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AverageTicketChart } from '@/components/graphs/average-ticket';
import { loadSpotterMetrics } from '@/lib/spotter/load';
import { CardSkeleton } from '@/components/ui/card-skeleton';
import { resolveFunnelSelection } from '@/lib/exactspotter/funnels';
import FunnelPickerControl from '@/components/FunnelPickerControl';
import { FunnelsEmptyState } from '@/components/funnels-empty-state';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export const revalidate = 21600;
export const dynamic = 'force-dynamic';

async function TicketData({ funnels }) {
  const { averageTicketByProduct } = await loadSpotterMetrics('currentYear', funnels);
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-muted-foreground">Ticket médio</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px]">
          <AverageTicketChart data={averageTicketByProduct} />
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {averageTicketByProduct.slice(0, 8).map((item) => (
          <div key={item.product} className="rounded-xl bg-card/60 p-6 shadow-lg ring-1 ring-white/5">
            <h2 className="text-lg font-semibold text-foreground">{item.product}</h2>
            <p className="text-3xl font-bold text-emerald-400">{currency.format(item.ticket)}</p>
          </div>
        ))}
      </section>
    </>
  );
}

export default async function TicketMedioPage({ searchParams }) {
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
          <h1 className="text-5xl font-bold tracking-tight">Ticket Médio por Produto</h1>
          <FunnelPickerControl value={selectedIds} />
        </div>
        <p className="text-xl text-muted-foreground max-w-4xl">
          Comparativo do valor médio de cada negociação concluída por produto.
        </p>
      </header>

      {showEmptyState ? (
        <FunnelsEmptyState message={emptyMessage} />
      ) : (
        <Suspense fallback={<CardSkeleton />}>
          <TicketData funnels={selectedIds} />
        </Suspense>
      )}
    </main>
  );
}
