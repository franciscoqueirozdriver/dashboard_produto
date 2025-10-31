import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AverageTicketChart } from '@/components/graphs/average-ticket';
import { loadSpotterMetrics } from '@/lib/spotter/load';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export const revalidate = 21600;
export const dynamic = 'force-static';

export default async function TicketMedioPage() {
  const { averageTicketByProduct } = await loadSpotterMetrics();

  return (
    <main className="space-y-10 px-12 py-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold tracking-tight">Ticket Médio por Produto</h1>
        <p className="text-xl text-muted-foreground max-w-4xl">
          Comparativo do valor médio de cada negociação concluída por produto.
        </p>
      </header>

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
    </main>
  );
}
