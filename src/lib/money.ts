import type { Encargo } from "./types";

export const PRECIO_MIN = 100;
export const PRECIO_MAX = 2000;
export const VIDEOS_MIN = 1;
export const VIDEOS_MAX = 12;

export type NumDraft = number | "";

export function parseDigits(value: string): NumDraft {
  const digits = value.replace(/\D/g, "");
  if (digits === "") return "";
  const n = Number(digits);
  return Number.isFinite(n) ? n : "";
}

export function precioOk(n: NumDraft): n is number {
  return typeof n === "number" && n >= PRECIO_MIN && n <= PRECIO_MAX;
}

export function videosOk(n: NumDraft): n is number {
  return typeof n === "number" && n >= VIDEOS_MIN && n <= VIDEOS_MAX;
}

export function paquete(encargo: Pick<Encargo, "videos" | "precio">) {
  return encargo.videos * encargo.precio;
}

/** Fee por cada aviso que publica el negocio. */
export const FEE_AVISO = 9.9;
/** @deprecated usar FEE_AVISO */
export const FEE_PRIMERA = FEE_AVISO;

export const YAPE_PLIN_SEGRABA = "987848117";
export const ADMIN_EMAIL = "hoover.cont26@gmail.com";

export type PlanCreadorId = "base" | "pro";

export type PlanCreador = {
  id: PlanCreadorId;
  nombre: string;
  precio: number;
  postulaciones: number;
  /** null = sin techo */
  precioMaxAviso: number | null;
  blurb: string;
  beneficios: string[];
};

export const PLANES_CREADOR: Record<PlanCreadorId, PlanCreador> = {
  base: {
    id: "base",
    nombre: "Base",
    precio: 9.9,
    postulaciones: 8,
    precioMaxAviso: 400,
    blurb: "Para empezar a apuntarte sin pagar de más.",
    beneficios: [
      "8 apuntadas por cada ciclo de 30 días",
      "Avisos con pago máximo de S/ 400 c/u",
      "Ves todos los avisos; te apuntas a los que entren en tu techo",
      "El pago del video es 100% tuyo (entre tú y el negocio)",
    ],
  },
  pro: {
    id: "pro",
    nombre: "Pro",
    precio: 14.9,
    postulaciones: 25,
    precioMaxAviso: null,
    blurb: "Para apuntarte más y a los mejores pagos.",
    beneficios: [
      "25 apuntadas por cada ciclo de 30 días",
      "Sin tope de precio: también avisos de más de S/ 400 c/u",
      "Acceso a los mejores pagos del listado",
      "El pago del video es 100% tuyo (entre tú y el negocio)",
    ],
  },
};

export function planDe(id?: PlanCreadorId | null): PlanCreador | null {
  if (!id) return null;
  return PLANES_CREADOR[id] ?? null;
}

export function periodoMes(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Duración de cada ciclo de plan (30 días desde la activación). */
export const DIAS_PLAN = 30;

export function finPlanDesde(fecha = new Date()) {
  const hasta = new Date(fecha);
  hasta.setDate(hasta.getDate() + DIAS_PLAN);
  return hasta;
}

export function diasRestantesPlan(planHasta: string | null | undefined) {
  if (!planHasta) return 0;
  const ms = new Date(planHasta).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function formatoFechaPlan(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function solesFee(n: number) {
  return `S/ ${n.toFixed(2)}`;
}

/** Aviso visible en el feed y abierto a postulaciones. */
export function avisoPublico(
  encargo: Pick<Encargo, "estado" | "elegidoPostulacionId">,
) {
  if (encargo.elegidoPostulacionId) return false;
  if (encargo.estado === "cerrado") return false;
  return !encargo.estado || encargo.estado === "publicado";
}

export const REGLAS_PAGO = [
  "SeGraba no guarda ni mueve tu Yape. El pago es entre el negocio y el creador.",
  "Acuerden el monto, el plazo y una revisión por WhatsApp antes de yapear.",
  "No grabes si no hay un acuerdo escrito en el chat. No yapees a un número que no está en el aviso.",
  "Si algo huele mal, no sigas. Reporta aquí. Con dos reportes el perfil queda marcado.",
] as const;
