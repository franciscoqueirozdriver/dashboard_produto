'use client'

import { KpiCard } from '@/components/cards/kpi-card';
import { MiniChartCard } from '@/components/cards/mini-chart-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceLine } from '@/components/graphs/performance-line';
import { StatusMiniChart } from '@/components/graphs/status-mini';
import { SalesByMonthChart } from '@/components/graphs/monthly-sales';
import { StatusByProductChart } from '@/components/graphs/status-by-product';
import { TopProductsChart } from '@/components/graphs/top-products';
import { AverageTicketChart } from '@/components/graphs/average-ticket';
import { DiscardReasonsChart } from '@/components/graphs/discard-reasons';
import FunnelPickerControl from '@/components/FunnelPickerControl';
import { FunnelsEmptyState } from '@/components/funnels-empty-state';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function DashboardContent({
  metrics,
  periodTitle,
  periodDescription,
  selectedFunnels = [],
  funnelsExplicit = false,
  hasActiveFunnels = true,
}) {
  const {
    summary,
    performanceLine,
    statusTrend,
    salesByMonth,
    statusByProduct,
    topProducts,
    averageTicketByProduct,
    discardReasonKeys,
    discardChartData,
  } = metrics;

  const openRate = Math.max(0, 1 - summary.winRate - summary.lossRate);
  const statusPercentages = [
    { label: 'Ganho', value: percent.format(summary.winRate) },
    { label: 'Perdido', value: percent.format(summary.lossRate) },
    {
      label: 'Em andamento',
      value: percent.format(openRate),
    },
  ];

  const hasSelection = Array.isArray(selectedFunnels) && selectedFunnels.length > 0;
  const emptyMessage = hasActiveFunnels
    ? 'Selecione ao menos um funil para visualizar os dados.'
    : 'Nenhum funil ativo disponível no momento.';
  const showEmptyState = !hasSelection && (funnelsExplicit || !hasActiveFunnels);

  return (
    <main className="space-y-12 px-12 py-10">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Painel Geral
            <span className="ml-4 text-3xl text-muted-foreground/80">({periodTitle})</span>
          </h1>
          <FunnelPickerControl value={selectedFunnels} />
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          {periodDescription}
        </p>
      </header>

      {showEmptyState ? (
        <FunnelsEmptyState message={emptyMessage} />
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-5">
            <KpiCard title="Total de Vendas" value={summary.totalSales.toLocaleString('pt-BR')} description="Pedidos fechados" />
            <KpiCard title="Receita Total" value={currency.format(summary.revenue)} description="Valor somado das negociações" />
            <KpiCard title="Ticket Médio" value={currency.format(summary.averageTicket)} description="Ticket médio por venda" />
            <KpiCard title="Leads Criados" value={summary.leadsCreated.toLocaleString('pt-BR')} description="Novos leads cadastrados" />
            <KpiCard
              title="Status Geral"
              value={`${statusPercentages[0].value} ganho`}
              description={`${statusPercentages[1].value} perdidos • ${statusPercentages[2].value} em andamento`}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <MiniChartCard title="Performance Geral" subtitle="Receita consolidada mês a mês">
              <PerformanceLine data={performanceLine} />
            </MiniChartCard>
            <MiniChartCard title="Status por Mês" subtitle="Ganhos, perdas e negociações abertas">
              <StatusMiniChart data={statusTrend} />
            </MiniChartCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-muted-foreground">Performance por Mês (Vendas)</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                <SalesByMonthChart data={salesByMonth} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-muted-foreground">Status por Produto</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                <StatusByProductChart data={statusByProduct.slice(0, 6)} />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-muted-foreground">Top Produtos Vendidos (R$)</CardTitle>
              </CardHeader>
              <CardContent className="h-[360px]">
                <TopProductsChart data={topProducts.slice(0, 8)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-muted-foreground">Ticket Médio por Produto</CardTitle>
              </CardHeader>
              <CardContent className="h-[360px]">
                <AverageTicketChart data={averageTicketByProduct.slice(0, 8)} />
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-muted-foreground">Motivos de Descarte por Produto</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <DiscardReasonsChart data={discardChartData} keys={discardReasonKeys} />
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </main>
  );
}
