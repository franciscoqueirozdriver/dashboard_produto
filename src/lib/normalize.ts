import { CANDIDATES, pickFirst } from "./fieldMap";

export type Deal = {
  id: string;
  produto?: string;   // nunca derivar de segmento
  segmento?: string;
  status?: string;
  valor?: number;
  data?: string;      // YYYY-MM-DD
  motivoDescarte?: string;
  ganho?: boolean;
  perdido?: boolean;
};

const NUM = (v: any) => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
};

export function normalizeRow(r: any): Deal {
  const id = String(r.id ?? r.ID ?? r.codigo ?? cryptoRandom());
  const produtoRaw = pickFirst(r, CANDIDATES.produto);
  const segmentoRaw = pickFirst(r, CANDIDATES.segmento);
  const statusRaw = (pickFirst(r, CANDIDATES.status) ?? "").toString();
  const valor = NUM(pickFirst(r, CANDIDATES.valor));
  const data = toISO(pickFirst(r, CANDIDATES.data));
  const motivoDescarte = pickFirst(r, CANDIDATES.motivoDescarte)?.toString();

  // flags de ganho/perda
  const ganhoFlag = boolFlag(pickFirst(r, CANDIDATES.ganhoFlag));
  const perdidoFlag = boolFlag(pickFirst(r, CANDIDATES.perdidoFlag));

  const deal: Deal = {
    id,
    produto: clean(produtoRaw),
    segmento: clean(segmentoRaw),
    status: clean(statusRaw),
    valor,
    data,
    motivoDescarte: clean(motivoDescarte),
    ganho: ganhoFlag ?? /ganh|won|fechad.o? ganho/i.test(statusRaw),
    perdido: perdidoFlag ?? /perd|lost|fechad.o? perdid/i.test(statusRaw),
  };

  // regra: se "produto" está vazio OU igual a "segmento", mantém como undefined (não forçar)
  if (!deal.produto || (deal.segmento && eqFold(deal.produto, deal.segmento))) {
    deal.produto = undefined;
  }

  return deal;
}

function eqFold(a?: string, b?: string) {
  return (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();
}
function clean(v: any): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}
function toISO(v: any): string | undefined {
  if (!v) return undefined;
  const s = new Date(v);
  if (Number.isNaN(+s)) return undefined;
  return s.toISOString().slice(0, 10);
}
function boolFlag(v: any): boolean | undefined {
  if (v === true || v === false) return v;
  const s = String(v ?? "").toLowerCase();
  if (!s) return undefined;
  if (["1", "true", "yes", "sim"].includes(s)) return true;
  if (["0", "false", "no", "nao", "não", "não"].includes(s)) return false;
  return undefined;
}
function cryptoRandom() {
  // id simples para mocks/casos sem id
  return "ID-" + Math.random().toString(36).slice(2, 10);
}
