import { NextResponse } from "next/server";
import { getLeadsSold } from "@/lib/spotter/leadsSold";
import { kpisDeVendas, receitaPorMes, statusPorMes } from "@/lib/metrics/sales";

export const revalidate = 21600;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const ano = url.searchParams.get("ano") ? Number(url.searchParams.get("ano")) : undefined;
    const mes = url.searchParams.get("mes") ? Number(url.searchParams.get("mes")) : undefined;

    const sales = await getLeadsSold({ ano, mes });
    return NextResponse.json({
      ok: true,
      data: {
        kpis: kpisDeVendas(sales),
        receitaPorMes: receitaPorMes(sales),
        statusPorMes: statusPorMes(sales),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
