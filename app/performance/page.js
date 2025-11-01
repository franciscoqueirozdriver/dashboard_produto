import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceLine } from '@/components/graphs/performance-line';
import { SalesByMonthChart } from '@/components/graphs/monthly-sales';
import { loadSpotterMetrics } from '@/lib/spotter/load.ts';

export const revalidate = 21600;
export const dynamic = 'force-dynamic';

export default async function PerformancePage() {
  const { performanceLine, salesByMonth } = await loadSpotterMetrics();

  return (
    <main className="space-y-10 px-12 py-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold tracking-tight">Performance de Vendas</h1>
        <p className="text-xl text-muted-foreground max-w-4xl">
          Evolução mensal de receita e volume de vendas nos últimos 12 meses.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-muted-foreground">Receita acumulada</CardTitle>
          </CardHeader>
          <CardContent className="h-[420px]">
            <PerformanceLine data={performanceLine} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-muted-foreground">Performance por Mês</CardTitle>
          </CardHeader>
          <CardContent className="h-[420px]">
            <SalesByMonthChart data={salesByMonth} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
