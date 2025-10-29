// src/lib/fieldMap.ts
// Lista de candidatos por campo v2 — usa arrays readonly e utilitário que aceita ReadonlyArray<string>

export const CANDIDATES = {
  produto: [
    "produto",
    "product",
    "produto_nome",
    "nome_produto",
    "item",
    "negocio_produto",
  ] as const,
  segmento: ["segmento", "industry", "setor", "categoria", "cnae_descricao"] as const,
  status: ["status", "situacao", "stage", "fase", "negocio_status", "pipeline_stage"] as const,
  valor: ["valor", "amount", "receita", "faturamento", "negocio_valor"] as const,
  data: ["data", "date", "created_at", "fechamento", "data_fechamento"] as const,
  motivoDescarte: [
    "motivo_descarte",
    "reason",
    "loss_reason",
    "motivo_perda",
    "descarta_motivo",
  ] as const,
  ganhoFlag: ["ganho", "is_won", "won", "fechado_ganho"] as const,
  perdidoFlag: ["perdido", "is_lost", "lost", "fechado_perdido"] as const,
} as const;

// Aceita ReadonlyArray<string> para compatibilidade com tuplas readonly (as const)
export function pickFirst<T extends object>(row: T, keys: ReadonlyArray<string>): any {
  const obj = row as any;
  for (const k of keys) {
    if (k in obj) return obj[k];
    // variação case-insensitive
    const hit = Object.keys(obj).find((x) => x.toLowerCase() === k.toLowerCase());
    if (hit) return obj[hit];
  }
  return undefined;
}
