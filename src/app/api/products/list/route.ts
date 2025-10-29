import { NextResponse } from "next/server";
import { explodeSoldItems, fetchLeadsSold } from "@/lib/spotter/leadsSold";

export const revalidate = 21600;

export async function GET(req: Request) {
  const u = new URL(req.url);
  const ano = u.searchParams.get("ano") ? Number(u.searchParams.get("ano")) : undefined;
  const mes = u.searchParams.get("mes") ? Number(u.searchParams.get("mes")) : undefined;

  const sales = await fetchLeadsSold({ ano, mes });
  const items = explodeSoldItems(sales);
  const set = new Set(items.map((i) => i.productName).filter(Boolean));
  return NextResponse.json({ ok: true, data: Array.from(set).sort() });
}
