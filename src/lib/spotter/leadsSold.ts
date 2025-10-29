export type LeadSold = {
  id: number;
  leadId: number;
  saleDate: string;
  saleStage?: string;
  cycle?: number;
  totalDealValue?: number;
  salesRep?: { name?: string; lastName?: string; email?: string };
  products?: Array<{
    id?: number;
    quantity?: number;
    individualValue?: number;
    discountAmount?: number;
    discountType?: string;
    fullValue?: number;
    finalValue?: number;
    name?: string;
  }>;
};

const parseJSON = async (res: Response) => {
  const j = await res.json();
  return Array.isArray(j?.value) ? (j.value as any[]) : [];
};

export async function fetchLeadsSold(params: { ano?: number; mes?: number }): Promise<LeadSold[]> {
  const token = process.env.EXACT_API_TOKEN;
  if (!token) throw new Error("EXACT_API_TOKEN ausente");
  const url = "https://api.exactspotter.com/v3/LeadsSold";
  const res = await fetch(url, { headers: { "Content-Type": "application/json", token_exact: token } });
  if (!res.ok) throw new Error(`LeadsSold ${res.status}`);
  const rows = await parseJSON(res);

  const { ano, mes } = params;
  return rows.filter((r: any) => {
    const d = r?.saleDate ? new Date(r.saleDate) : null;
    if (!d || isNaN(+d)) return false;
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    if (ano && y !== ano) return false;
    if (mes && m !== mes) return false;
    return true;
  }) as LeadSold[];
}

export type SoldItem = {
  saleId: number;
  saleDate: string; // YYYY-MM
  productId?: number;
  productName?: string; // nosso produto
  quantity: number;
  finalValue: number;
};

export function explodeSoldItems(sales: LeadSold[]): SoldItem[] {
  const out: SoldItem[] = [];
  for (const s of sales) {
    const ym = s.saleDate?.slice(0, 7);
    const arr = Array.isArray(s.products) ? s.products : [];
    for (const p of arr) {
      out.push({
        saleId: s.id,
        saleDate: ym ?? "",
        productId: p.id,
        productName: p.name?.trim() || undefined,
        quantity: Number.isFinite(p.quantity) ? (p.quantity as number) : 1,
        finalValue: Number(p.finalValue ?? p.individualValue ?? 0),
      });
    }
  }
  return out;
}
