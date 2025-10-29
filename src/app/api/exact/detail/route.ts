import { NextResponse } from "next/server";
import { normalizeRow, Deal } from "@/lib/normalize";

export const revalidate = 21600;

type RowOut = {
  id: string;
  cliente?: string;
  valor: number;
  fase?: string;
  fonte?: string;
  produto?: string;
  segmento?: string;
  data?: string;
  motivoDescarte?: string;
};

function mockRaw(): any[] {
  // Exemplo proposital com SEGMENTO preenchido e PRODUTO ausente
  return Array.from({ length: 80 }).map((_, i) => ({
    id: `OP-${2025}-${String((i % 12) + 1).padStart(2, "0")}-${i}`,
    segmento: ["Indústria", "Varejo", "Agro", "Serviços"][i % 4],
    // produto: undefined  // <- simulando falta de produto
    status: i % 9 === 0 ? "Fechado Perdido" : i % 7 === 0 ? "Fechado Ganho" : "Em andamento",
    valor: 3500 + (i % 10) * 1800,
    data: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    motivo_descarte: i % 9 === 0 ? "Fora do momento de compra" : undefined,
  }));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  // filtros (ano, mes, fontes, fases) podem ser usados aqui se vierem da UI
  void url;

  const token = process.env.EXACT_API_TOKEN;
  let raw: any[] = [];

  if (token) {
    // Aqui iria a chamada real para o Exact Spotter e mapeamento da resposta.
    // raw = await fetch(...).then(r => r.json());
  } else {
    raw = mockRaw();
  }

  const deals: Deal[] = raw.map(normalizeRow);

  const out: RowOut[] = deals.map((d) => ({
    id: d.id,
    valor: d.valor ?? 0,
    fase: d.status,
    produto: d.produto,     // <- só aparece se existir
    segmento: d.segmento,
    data: d.data,
    motivoDescarte: d.motivoDescarte,
  }));

  return NextResponse.json({ ok: true, data: out });
}
