import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiscardReasonsChart } from '@/components/graphs/discard-reasons';
import { loadSpotterMetrics } from '@/lib/spotter/load.ts';

export const revalidate = 21600;
export const dynamic = 'force-dynamic';

export default async function MotivosDescartePage() {
  const { discardChartData, discardReasonKeys } = await loadSpotterMetrics();

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
