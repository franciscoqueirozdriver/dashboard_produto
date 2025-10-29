import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopProductsChart } from '@/components/graphs/top-products';
import { loadSpotterMetrics } from '@/lib/spotter/load';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const revalidate = 60;

export default async function TopProdutosPage() {
  const { topProducts } = await loadSpotterMetrics();

  return (
    <main className="space-y-10 px-12 py-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold tracking-tight">Top Produtos Vendidos</h1>
        <p className="text-xl text-muted-foreground max-w-4xl">
          Ranking de faturamento por produto considerando o valor real das vendas.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="text-2xl font-semibold text-muted-foreground">Receita por produto</CardTitle>
          <span className="text-lg text-muted-foreground/80">
            Destaque para os {topProducts.length} itens com maior impacto financeiro.
          </span>
        </CardHeader>
        <CardContent className="h-[600px]">
          <TopProductsChart data={topProducts} />
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topProducts.slice(0, 6).map((item) => (
          <div key={item.product} className="rounded-xl bg-card/60 p-6 shadow-lg ring-1 ring-white/5">
            <h2 className="text-xl font-semibold text-foreground">{item.product}</h2>
            <p className="text-3xl font-bold text-emerald-400">{currency.format(item.revenue)}</p>
            <p className="text-sm text-muted-foreground/80">{item.deals} vendas concluídas</p>
          </div>
        ))}
      </section>
    </main>
  );
}
