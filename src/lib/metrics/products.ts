import type { LeadSold, SoldItem } from "../spotter/leadsSold";

export function receitaPorProduto(items: SoldItem[]) {
  const m = new Map<string, number>();
  for (const it of items) {
    const produto = (it.productName ?? "").trim();
    const atual = m.get(produto) ?? 0;
    m.set(produto, atual + Number(it.value ?? 0));
  }
  return Array.from(m, ([produto, valor]) => ({ produto, valor })).sort((a, b) => b.valor - a.valor);
}

export function ticketMedioPorProduto(items: SoldItem[]) {
  const receita = new Map<string, number>();
  const vendas = new Map<string, Set<number>>();
  for (const it of items) {
    const produto = (it.productName ?? "").trim();
    const valor = Number(it.value ?? 0);
    receita.set(produto, (receita.get(produto) ?? 0) + valor);
    const set = vendas.get(produto) ?? new Set<number>();
    set.add(it.saleId);
    vendas.set(produto, set);
  }
  return Array.from(receita, ([produto, sum]) => {
    const n = vendas.get(produto)?.size ?? 0;
    return { produto, ticketMedio: n ? sum / n : 0 };
  }).sort((a, b) => b.ticketMedio - a.ticketMedio);
}

export function statusPorProduto(items: SoldItem[], sales: LeadSold[]) {
  const stageBySale = new Map<number, string>(sales.map((s) => [s.id, String(s.saleStage || "")]));
  const m = new Map<string, { ganho: number; perdido: number; emAndamento: number }>();
  for (const it of items) {
    const produto = (it.productName ?? "").trim();
    const st = stageBySale.get(it.saleId) || "";
    const obj = m.get(produto) ?? { ganho: 0, perdido: 0, emAndamento: 0 };
    if (/ganh|won|fechad.*ganho/i.test(st)) obj.ganho++;
    else if (/perd|lost|fechad.*perdid/i.test(st)) obj.perdido++;
    else obj.emAndamento++;
    m.set(produto, obj);
  }
  return Array.from(m, ([produto, v]) => ({ produto, ...v }));
}
