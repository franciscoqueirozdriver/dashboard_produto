import { fetchAllOData } from "./client";

export type LeadSold = {
  id: number;
  leadId: number;
  saleDate: string; // ISO
  saleStage?: string;
  cycle?: number;
  totalDealValue?: number;
  products?: Array<{
    id?: number;
    name?: string;
    quantity?: number;
    individualValue?: number;
    discountAmount?: number;
    discountType?: string;
    fullValue?: number;
    finalValue?: number;
  }>;
};

export async function getLeadsSold(params?: { ano?: number; mes?: number }): Promise<LeadSold[]> {
  const all = await fetchAllOData("LeadsSold");
  const { ano, mes } = params || {};
  return (all as LeadSold[]).filter((s) => {
    const d = s?.saleDate ? new Date(s.saleDate) : null;
    if (!d || Number.isNaN(+d)) return false;
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    if (ano && y !== ano) return false;
    if (mes && m !== mes) return false;
    return true;
  });
}

export type SoldItem = {
  saleId: number;
  saleMonth: string; // YYYY-MM
  productId?: number;
  productName?: string;
  quantity: number;
  value: number;
};

export function explodeItems(sales: LeadSold[]): SoldItem[] {
  const out: SoldItem[] = [];
  for (const s of sales) {
    const ym = s.saleDate?.slice(0, 7) || "";
    const arr = Array.isArray(s.products) ? s.products : [];
    for (const p of arr) {
      const quantity = Number(p?.quantity);
      const qty = Number.isFinite(quantity) ? quantity : 1;
      const rawValue = Number(p?.finalValue ?? p?.individualValue ?? 0);
      const unitValue = Number.isFinite(rawValue) ? rawValue : 0;
      out.push({
        saleId: s.id,
        saleMonth: ym,
        productId: p?.id,
        productName: p?.name?.trim() || undefined,
        quantity: qty,
        value: qty * unitValue,
      });
    }
  }
  return out;
}
