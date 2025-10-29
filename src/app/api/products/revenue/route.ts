import { NextResponse } from "next/server";
import { getLeadsSold, explodeItems } from "@/lib/spotter/leadsSold";
import { receitaPorProduto } from "@/lib/metrics/products";

export const revalidate = 21600;

const SEM_PRODUTO = "Sem produto informado";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const ano = url.searchParams.get("ano") ? Number(url.searchParams.get("ano")) : undefined;
    const mes = url.searchParams.get("mes") ? Number(url.searchParams.get("mes")) : undefined;

    const sales = await getLeadsSold({ ano, mes });
    const items = explodeItems(sales);
    const data = receitaPorProduto(items).map(({ produto, valor }) => ({
      produto: produto || SEM_PRODUTO,
      valor,
    }));
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
