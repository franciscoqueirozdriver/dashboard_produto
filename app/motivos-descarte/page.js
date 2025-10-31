import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiscardReasonsChart } from '@/components/graphs/discard-reasons';
import { loadSpotterMetrics } from '@/lib/spotter/load';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export default async function MotivosDescartePage() {
  let discardChartData, discardReasonKeys;
  try {
    ({ discardChartData, discardReasonKeys } = await loadSpotterMetrics());
  } catch (error) {
    console.error('[motivos-descarte] failed to load spotter metrics:', error);
    return (
      <main className="space-y-10 px-12 py-10">
        <header className="flex flex-col gap-4">
          <h1 className="text-5xl font-bold tracking-tight">Motivos de Descarte</h1>
          <p className="text-xl text-muted-foreground max-w-4xl">
            Análise dos principais motivos de descarte de leads por produto nos últimos 12 meses.
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
        <h1 className="text-5xl font-bold tracking-tight">Motivos de Descarte</h1>
        <p className="text-xl text-muted-foreground max-w-4xl">
          Visão dos principais motivos de descarte por produto para atuar na redução de perdas.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-muted-foreground">Motivos por produto</CardTitle>
        </CardHeader>
        <CardContent className="h-[600px]">
          <DiscardReasonsChart data={discardChartData} keys={discardReasonKeys} />
        </CardContent>
      </Card>
    </main>
  );
}
