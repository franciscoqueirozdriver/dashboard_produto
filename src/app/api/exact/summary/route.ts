import { NextResponse } from "next/server";
import { normalizeRow, Deal } from "@/lib/normalize";

export const revalidate = 21600;

type Kpi = { id: string; label: string; value: number; delta?: number };
type XY = { x: string; y: number; group?: string };
type Slice = { key: string; label: string; value: number };

type SummaryOut = {
  kpis: Kpi[];
  ticketMedioPorProduto: Slice[];     // usa APENAS deals com produto && ganho
  topProdutosVendidos: Slice[];       // soma valor por produto (ganhos)
  statusPorProduto: Array<{ produto: string; ganho: number; emAndamento: number; perdido: number }>;
  motivosDescartePorProduto: Array<{ produto: string; motivo: string; qtd: number }>;
  performanceGeral: XY[];
  performancePorMes: XY[];
};

function mockRaw(): any[] {
  // Mesmo mock do detail — sem produto, para validar que não cruzaremos com "segmento".
  return Array.from({ length: 80 }).map((_, i) => ({
    id: `OP-${2025}-${String((i % 12) + 1).padStart(2, "0")}-${i}`,
    segmento: ["Indústria", "Varejo", "Agro", "Serviços"][i % 4],
    status: i % 9 === 0 ? "Fechado Perdido" : i % 7 === 0 ? "Fechado Ganho" : "Em andamento",
    valor: 3500 + (i % 10) * 1800,
    data: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    motivo_descarte: i % 9 === 0 ? "Fora do momento de compra" : undefined,
  }));
}

function group<T>(arr: T[], key: (t: T) => string | undefined) {
  const m = new Map<string, T[]>();
  for (const it of arr) {
    const k = key(it);
    if (!k) continue;
    m.set(k, [...(m.get(k) ?? []), it]);
  }
  return m;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  void url;

  const token = process.env.EXACT_API_TOKEN;
  let raw: any[] = [];

  if (token) {
    // Chamada real aqui; manter por enquanto mock para comportamento estável
    // raw = await fetch(...).then(r => r.json());
  } else {
    raw = mockRaw();
  }

  const deals: Deal[] = raw.map(normalizeRow);

  // KPIs genéricos
  const ganhos = deals.filter((d) => d.ganho && d.valor);
  const totalVendas = ganhos.length;
  const receitaTotal = ganhos.reduce((s, d) => s + (d.valor ?? 0), 0);
  const leadsCriados = new Set(deals.map((d) => d.id)).size; // placeholder
  const pctGanho = (totalVendas / Math.max(deals.length, 1)) * 100;

  const kpis: Kpi[] = [
    { id: "k1", label: "Total de Vendas", value: totalVendas },
    { id: "k2", label: "Receita Total", value: Math.round(receitaTotal) },
    { id: "k3", label: "Ticket Médio", value: totalVendas ? Math.round(receitaTotal / totalVendas) : 0 },
    { id: "k4", label: "Leads Criados", value: leadsCriados },
    { id: "k5", label: "Status Geral (ganho %)", value: Math.round(pctGanho) },
  ];

  // Ticket médio por produto — somente se houver produto
  const byProdGanhos = group(ganhos.filter((d) => d.produto), (d) => d.produto!);
  const ticketMedioPorProduto: Slice[] = Array.from(byProdGanhos.entries()).map(([prod, arr]) => {
    const soma = arr.reduce((s, d) => s + (d.valor ?? 0), 0);
    return { key: prod, label: prod, value: soma / Math.max(arr.length, 1) };
  }).sort((a, b) => b.value - a.value);

  // Top produtos vendidos — soma por produto (ganhos)
  const topProdutosVendidos: Slice[] = Array.from(byProdGanhos.entries()).map(([prod, arr]) => {
    const soma = arr.reduce((s, d) => s + (d.valor ?? 0), 0);
    return { key: prod, label: prod, value: soma };
  }).sort((a, b) => b.value - a.value);

  // Status por produto — se não há produto, retorna vazio
  const byProdAll = group(deals.filter((d) => d.produto), (d) => d.produto!);
  const statusPorProduto = Array.from(byProdAll.entries()).map(([prod, arr]) => ({
    produto: prod,
    ganho: arr.filter((d) => d.ganho).length,
    emAndamento: arr.filter((d) => !d.ganho && !d.perdido).length,
    perdido: arr.filter((d) => d.perdido).length,
  })).sort((a, b) => (b.ganho + b.emAndamento + b.perdido) - (a.ganho + a.emAndamento + a.perdido));

  // Motivos de descarte POR PRODUTO — apenas onde ambos existem
  const descartes = deals.filter((d) => d.perdido && d.motivoDescarte && d.produto);
  const byProdMotivo = new Map<string, Map<string, number>>();
  for (const d of descartes) {
    const p = d.produto!;
    const m = d.motivoDescarte!;
    if (!byProdMotivo.has(p)) byProdMotivo.set(p, new Map());
    const inner = byProdMotivo.get(p)!;
    inner.set(m, (inner.get(m) ?? 0) + 1);
  }
  const motivosDescartePorProduto = Array.from(byProdMotivo.entries()).flatMap(([prod, map]) =>
    Array.from(map.entries()).map(([motivo, qtd]) => ({ produto: prod, motivo, qtd }))
  );

  // Performance (exemplos simples)
  const byMes = new Map<string, number>();
  for (const d of ganhos) {
    const ym = (d.data ?? "").slice(0, 7);
    if (!ym) continue;
    byMes.set(ym, (byMes.get(ym) ?? 0) + (d.valor ?? 0));
  }
  const performanceGeral = Array.from(byMes.entries()).map(([x, y]) => ({ x, y }));
  const performancePorMes = performanceGeral; // pode duplicar com outro agrupamento se necessário

  const out: SummaryOut = {
    kpis,
    ticketMedioPorProduto,
    topProdutosVendidos,
    statusPorProduto,
    motivosDescartePorProduto,
    performanceGeral,
    performancePorMes,
  };

  // Telemetria mínima para detectar fonte errada
  if (ticketMedioPorProduto.length === 0 && topProdutosVendidos.length === 0 && statusPorProduto.length === 0) {
    console.warn("[summary] Nenhum 'produto' detectado. Verifique mapeamento de campos na integração.");
  }

  return NextResponse.json({ ok: true, data: out });
}
