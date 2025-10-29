import { NextResponse } from "next/server";
import { fetchLeadsSold } from "@/lib/spotter/leadsSold";
import { performanceMensal, salesKpis, statusPorMes } from "@/lib/metrics/sales";

export const revalidate = 21600;

export async function GET(req: Request) {
  const u = new URL(req.url);
  const ano = u.searchParams.get("ano") ? Number(u.searchParams.get("ano")) : undefined;
  const mes = u.searchParams.get("mes") ? Number(u.searchParams.get("mes")) : undefined;

  const sales = await fetchLeadsSold({ ano, mes });
  return NextResponse.json({
    ok: true,
    data: {
      kpis: salesKpis(sales),
      performanceMensal: performanceMensal(sales),
      statusPorMes: statusPorMes(sales),
    },
  });
}
