import { NextResponse } from "next/server";
import { getLeadsSold, explodeItems } from "@/lib/spotter/leadsSold";

export const revalidate = 21600;

const SEM_PRODUTO = "Sem produto informado";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const ano = url.searchParams.get("ano") ? Number(url.searchParams.get("ano")) : undefined;
    const mes = url.searchParams.get("mes") ? Number(url.searchParams.get("mes")) : undefined;

    const sales = await getLeadsSold({ ano, mes });
    const items = explodeItems(sales);
    const set = new Set(items.map((i) => (i.productName ?? "").trim()));
    const data = Array.from(set)
      .map((produto) => produto || SEM_PRODUTO)
      .sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
