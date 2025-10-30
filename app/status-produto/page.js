import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusByProductChart } from '@/components/graphs/status-by-product';
import { loadSpotterMetrics } from '@/lib/spotter/load';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export default async function StatusProdutoPage() {
  let statusByProduct;
  try {
    ({ statusByProduct } = await loadSpotterMetrics());
  } catch (error) {
    console.error('[status-produto] failed to load spotter metrics:', error);
    return (
      <main className="space-y-10 px-12 py-10">
        <header className="flex flex-col gap-4">
          <h1 className="text-5xl font-bold tracking-tight">Status por Produto</h1>
          <p className="text-xl text-muted-foreground max-w-4xl">
            Distribuição de negociações ganhas, perdidas e em andamento por produto nos últimos 12 meses.
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
        <h1 className="text-5xl font-bold tracking-tight">Status por Produto</h1>
        <p className="text-xl text-muted-foreground max-w-4xl">
          Distribuição de negociações ganhas, perdidas e em andamento por produto nos últimos 12 meses.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-muted-foreground">Status consolidado</CardTitle>
        </CardHeader>
        <CardContent className="h-[580px]">
          <StatusByProductChart data={statusByProduct} />
        </CardContent>
      </Card>
    </main>
  );
}
