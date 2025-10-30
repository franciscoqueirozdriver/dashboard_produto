import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceLine } from '@/components/graphs/performance-line';
import { SalesByMonthChart } from '@/components/graphs/monthly-sales';
import { loadSpotterMetrics } from '@/lib/spotter/load';

export const revalidate = 21600;
export const dynamic = 'force-static';

export default async function PerformancePage() {
  let performanceLine, salesByMonth;
  try {
    ({ performanceLine, salesByMonth } = await loadSpotterMetrics());
  } catch (error) {
    console.error('[performance] failed to load spotter metrics:', error);
    return (
      <main className="space-y-10 px-12 py-10">
        <header className="flex flex-col gap-4">
          <h1 className="text-5xl font-bold tracking-tight">Performance de Vendas</h1>
          <p className="text-xl text-muted-foreground max-w-4xl">
            Análise detalhada da performance de vendas e receita da sua equipe nos últimos 12 meses.
          </p>
        </header>
        <div className="flex items-center justify-center h-96">
          <p className="text-2xl text-destructive">
            Não foi possível carregar os dados do Spotter. Verifique o token e tente novamente.
          </p>
        </div>
      </main>
    );
  }

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
