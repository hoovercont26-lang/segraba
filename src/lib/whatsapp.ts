import type { Creador, Encargo } from "./types";
import { soles } from "./match";

function digits(phone: string) {
  const clean = phone.replace(/\D/g, "");
  if (clean.startsWith("51") && clean.length >= 11) return clean;
  return `51${clean}`;
}

export function waLink(phone: string, text: string) {
  return `https://wa.me/${digits(phone)}?text=${encodeURIComponent(text)}`;
}

export function mensajeMarcaACreador(encargo: Encargo, creador: Creador) {
  return `Hola ${creador.nombre.split(" ")[0]}, vi tu perfil en SeGraba. Necesito ${encargo.videos} videos ${encargo.nicho.toLowerCase()} a ${soles(encargo.precio)} c/u. ${encargo.brief}`;
}

export function mensajeCreadorAMarca(encargo: Encargo, creador: Creador) {
  return `Hola, soy ${creador.nombre} (@${creador.tiktok}). Acepto ${encargo.videos} videos a ${soles(encargo.precio)} c/u. ¿Cuándo grabo?`;
}

export const COPY_MARCA =
  "Hola, soy [tu local]. Quiero 5 TikToks foodie esta semana a S/ 350 c/u, en SeGraba. ¿Te late?";

export const COPY_CREADOR =
  "Hay pega foodie S/ 380 en Barranco, precio cerrado. Entras, aceptas y escribes.";

export const COPY_IG =
  "Se graba esta semana. El precio ya está.\n5 TikToks · Barranco · S/ 380\nEntra y acepta.";
