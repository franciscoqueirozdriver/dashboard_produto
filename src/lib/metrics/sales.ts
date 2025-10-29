import type { LeadSold } from "../spotter/leadsSold";

export function kpisDeVendas(sales: LeadSold[]) {
  const ids = new Set(sales.map((s) => s.id));
  const nVendas = ids.size;
  const receitaTotal = sales.reduce((acc, s) => acc + Number(s.totalDealValue ?? 0), 0);
  const ticketMedio = nVendas ? receitaTotal / nVendas : 0;

  const stage = (s: LeadSold) => String(s.saleStage || "");
  const ganho = sales.filter((s) => /ganh|won|fechad.*ganho/i.test(stage(s))).length;
  const perdido = sales.filter((s) => /perd|lost|fechad.*perdid/i.test(stage(s))).length;
  const emAndamento = nVendas - ganho - perdido;

  return {
    nVendas,
    receitaTotal,
    ticketMedio,
    statusGeral: { ganho, emAndamento, perdido },
  };
}

export function receitaPorMes(sales: LeadSold[]) {
  const m = new Map<string, number>();
  for (const s of sales) {
    const ym = s.saleDate?.slice(0, 7);
    if (!ym) continue;
    m.set(ym, (m.get(ym) ?? 0) + Number(s.totalDealValue ?? 0));
  }
  return Array.from(m, ([mes, valor]) => ({ mes, valor })).sort((a, b) => a.mes.localeCompare(b.mes));
}

export function statusPorMes(sales: LeadSold[]) {
  const m = new Map<string, { ganho: number; perdido: number; emAndamento: number }>();
  for (const s of sales) {
    const ym = s.saleDate?.slice(0, 7);
    if (!ym) continue;
    const st = String(s.saleStage || "");
    const obj = m.get(ym) ?? { ganho: 0, perdido: 0, emAndamento: 0 };
    if (/ganh|won|fechad.*ganho/i.test(st)) obj.ganho++;
    else if (/perd|lost|fechad.*perdid/i.test(st)) obj.perdido++;
    else obj.emAndamento++;
    m.set(ym, obj);
  }
  return Array.from(m, ([mes, v]) => ({ mes, ...v })).sort((a, b) => a.mes.localeCompare(b.mes));
}
