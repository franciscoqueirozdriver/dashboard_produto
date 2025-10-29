import type { SoldItem } from "../spotter/leadsSold";

export function revenueByProduct(items: SoldItem[]) {
  const m = new Map<string, number>();
  for (const it of items) {
    if (!it.productName) continue;
    m.set(it.productName, (m.get(it.productName) ?? 0) + it.finalValue * (it.quantity || 1));
  }
  return Array.from(m, ([label, value]) => ({ key: label, label, value })).sort((a, b) => b.value - a.value);
}

export function ticketByProduct(items: SoldItem[]) {
  const receita = new Map<string, number>();
  const vendas = new Map<string, Set<number>>();
  for (const it of items) {
    if (!it.productName) continue;
    receita.set(it.productName, (receita.get(it.productName) ?? 0) + it.finalValue * (it.quantity || 1));
    const set = vendas.get(it.productName) ?? new Set<number>();
    set.add(it.saleId);
    vendas.set(it.productName, set);
  }
  return Array.from(receita, ([prod, sum]) => {
    const nVendas = vendas.get(prod)?.size ?? 0;
    return { key: prod, label: prod, value: nVendas ? sum / nVendas : 0 };
  }).sort((a, b) => b.value - a.value);
}

export function statusByProduct(items: SoldItem[], salesStageById: Map<number, string>) {
  const m = new Map<string, { ganho: number; perdido: number; emAndamento: number }>();
  for (const it of items) {
    if (!it.productName) continue;
    const st = salesStageById.get(it.saleId) ?? "";
    const rec = m.get(it.productName) ?? { ganho: 0, perdido: 0, emAndamento: 0 };
    if (/ganh|won|fechad.*ganho/i.test(st)) rec.ganho++;
    else if (/perd|lost|fechad.*perdid/i.test(st)) rec.perdido++;
    else rec.emAndamento++;
    m.set(it.productName, rec);
  }
  return Array.from(m, ([produto, v]) => ({ produto, ...v }));
}
