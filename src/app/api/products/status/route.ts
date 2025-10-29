import { NextResponse } from "next/server";
import { explodeSoldItems, fetchLeadsSold } from "@/lib/spotter/leadsSold";
import { statusByProduct } from "@/lib/metrics/products";

export const revalidate = 21600;

export async function GET(req: Request) {
  const u = new URL(req.url);
  const ano = u.searchParams.get("ano") ? Number(u.searchParams.get("ano")) : undefined;
  const mes = u.searchParams.get("mes") ? Number(u.searchParams.get("mes")) : undefined;

  const sales = await fetchLeadsSold({ ano, mes });
  const items = explodeSoldItems(sales);
  const stageMap = new Map<number, string>(sales.map((s) => [s.id, String(s.saleStage ?? "")]));
  return NextResponse.json({ ok: true, data: statusByProduct(items, stageMap) });
}
