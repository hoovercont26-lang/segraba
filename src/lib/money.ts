import type { Encargo } from "./types";

export function paquete(encargo: Pick<Encargo, "videos" | "precio">) {
  return encargo.videos * encargo.precio;
}

export const REGLAS_PAGO = [
  "SeGraba no guarda ni mueve tu Yape. El pago es entre marca y creador.",
  "Acuerden el monto, el plazo y una revisión por WhatsApp antes de yapear.",
  "No grabes si no hay un acuerdo escrito en el chat. No yapees a un número que no está en el aviso.",
  "Si algo huele mal, no sigas. Reporta aquí. Con dos reportes el perfil queda marcado.",
] as const;
