// Lista de candidatos por campo, da API/ETL.
// Nunca usar "segmento" como "produto".
export const CANDIDATES = {
  produto: [
    "produto",
    "product",
    "produto_nome",
    "nome_produto",
    "item",
    "negocio_produto",
  ],
  segmento: ["segmento", "industry", "setor", "categoria", "cnae_descricao"],
  status: [
    "status",
    "situacao",
    "stage",
    "fase",
    "negocio_status",
    "pipeline_stage",
  ],
  valor: ["valor", "amount", "receita", "faturamento", "negocio_valor"],
  data: ["data", "date", "created_at", "fechamento", "data_fechamento"],
  motivoDescarte: [
    "motivo_descarte",
    "reason",
    "loss_reason",
    "motivo_perda",
    "descarta_motivo",
  ],
  ganhoFlag: ["ganho", "is_won", "won", "fechado_ganho"],
  perdidoFlag: ["perdido", "is_lost", "lost", "fechado_perdido"],
} as const;

export function pickFirst<T extends object>(row: T, keys: string[]): any {
  for (const k of keys) {
    if (k in (row as any)) return (row as any)[k];
    // tenta variações com case/underscore
    const hit = Object.keys(row as any).find(
      (x) => x.toLowerCase() === k.toLowerCase()
    );
    if (hit) return (row as any)[hit];
  }
  return undefined;
}
