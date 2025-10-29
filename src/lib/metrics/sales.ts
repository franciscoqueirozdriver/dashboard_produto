import type { LeadSold } from "../spotter/leadsSold";

export function salesKpis(sales: LeadSold[]) {
  const totalVendas = new Set(sales.map((s) => s.id)).size;
  const receitaTotal = sales.reduce((sum, s) => sum + Number(s.totalDealValue ?? 0), 0);
  const ticketMedio = totalVendas ? receitaTotal / totalVendas : 0;

  const ganho = sales.filter((s) => /ganh|won|fechad.*ganho/i.test(String(s.saleStage ?? ""))).length;
  const perdido = sales.filter((s) => /perd|lost|fechad.*perdid/i.test(String(s.saleStage ?? ""))).length;
  const emAberto = totalVendas - ganho - perdido;

  return { totalVendas, receitaTotal, ticketMedio, statusGeral: { ganho, emAberto, perdido } };
}

export function performanceMensal(sales: LeadSold[]) {
  const m = new Map<string, number>();
  for (const s of sales) {
    const ym = s.saleDate?.slice(0, 7);
    if (!ym) continue;
    m.set(ym, (m.get(ym) ?? 0) + Number(s.totalDealValue ?? 0));
  }
  return Array.from(m, ([x, y]) => ({ x, y })).sort((a, b) => a.x.localeCompare(b.x));
}

export function statusPorMes(sales: LeadSold[]) {
  const m = new Map<string, { ganho: number; perdido: number; emAberto: number }>();
  for (const s of sales) {
    const ym = s.saleDate?.slice(0, 7);
    if (!ym) continue;
    const it = m.get(ym) ?? { ganho: 0, perdido: 0, emAberto: 0 };
    const st = String(s.saleStage ?? "");
    if (/ganh|won|fechad.*ganho/i.test(st)) it.ganho++;
    else if (/perd|lost|fechad.*perdid/i.test(st)) it.perdido++;
    else it.emAberto++;
    m.set(ym, it);
  }
  return Array.from(m, ([mes, v]) => ({ mes, ...v })).sort((a, b) => a.mes.localeCompare(b.mes));
}
