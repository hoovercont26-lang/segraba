import { CREADORES, ENCARGOS } from "./data";
import type {
  Creador,
  Encargo,
  Mensaje,
  MotivoReporte,
  Postulacion,
  Reporte,
} from "./types";

const K_ENCARGOS = "segraba.pegas";
const K_CREADORES = "segraba.creadores";
const K_REPORTES = "segraba.reportes";
const K_POSTULACIONES = "segraba.postulaciones";
const K_MENSAJES = "segraba.mensajes";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function withEntregas(creador: Creador): Creador {
  return { ...creador, entregas: creador.entregas ?? 0 };
}

export function listEncargos(): Encargo[] {
  const extra = read<Encargo[]>(K_ENCARGOS, []);
  const seen = new Set(extra.map((e) => e.id));
  return [...extra, ...ENCARGOS.filter((e) => !seen.has(e.id))];
}

export function listPegasPublicas(): Encargo[] {
  return listEncargos();
}

export function getEncargo(id: string): Encargo | undefined {
  return listEncargos().find((e) => e.id === id);
}

export function saveEncargo(encargo: Encargo) {
  const extra = read<Encargo[]>(K_ENCARGOS, []);
  write(K_ENCARGOS, [encargo, ...extra.filter((e) => e.id !== encargo.id)]);
}

export function pegasDe(autorId: string) {
  return listEncargos().filter((e) => e.autorId === autorId);
}

export function listCreadores(): Creador[] {
  const extra = read<Creador[]>(K_CREADORES, []).map(withEntregas);
  const seen = new Set(extra.map((c) => c.id));
  return [
    ...extra,
    ...CREADORES.filter((c) => !seen.has(c.id)).map(withEntregas),
  ];
}

export function getCreador(id: string) {
  return listCreadores().find((c) => c.id === id);
}

export function saveCreador(creador: Creador) {
  const extra = read<Creador[]>(K_CREADORES, []);
  write(K_CREADORES, [creador, ...extra.filter((c) => c.id !== creador.id)]);
}

export function perfilDe(autorId: string) {
  return listCreadores().find((c) => c.autorId === autorId);
}

export function listReportes(): Reporte[] {
  return read<Reporte[]>(K_REPORTES, []);
}

export function countReportes(tipo: Reporte["contraTipo"], id: string) {
  return listReportes().filter((r) => r.contraTipo === tipo && r.contraId === id)
    .length;
}

export function yaReporto(deId: string, tipo: Reporte["contraTipo"], id: string) {
  return listReportes().some(
    (r) => r.deId === deId && r.contraTipo === tipo && r.contraId === id,
  );
}

export function saveReporte(input: {
  deId: string;
  contraTipo: Reporte["contraTipo"];
  contraId: string;
  motivo: MotivoReporte;
  detalle: string;
}) {
  if (yaReporto(input.deId, input.contraTipo, input.contraId)) {
    throw new Error("Ya reportaste a este perfil.");
  }
  const reporte: Reporte = {
    id: `rep-${Date.now().toString(36)}`,
    ...input,
    detalle: input.detalle.trim(),
    createdAt: new Date().toISOString(),
  };
  write(K_REPORTES, [reporte, ...listReportes()]);
  return reporte;
}

export function reportesDe(deId: string) {
  return listReportes().filter((r) => r.deId === deId);
}

export function marcado(tipo: Reporte["contraTipo"], id: string) {
  return countReportes(tipo, id) >= 2;
}

export function listPostulaciones(): Postulacion[] {
  return read<Postulacion[]>(K_POSTULACIONES, []);
}

export function postulacionesDePega(pegaId: string) {
  return listPostulaciones()
    .filter((p) => p.pegaId === pegaId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function postulacionesDe(autorId: string) {
  return listPostulaciones().filter((p) => p.autorId === autorId);
}

export function getPostulacion(id: string) {
  return listPostulaciones().find((p) => p.id === id);
}

export function yaPostulo(autorId: string, pegaId: string) {
  return listPostulaciones().some((p) => p.autorId === autorId && p.pegaId === pegaId);
}

export function postular(input: {
  pegaId: string;
  creadorId: string;
  autorId: string;
  nota: string;
}) {
  if (yaPostulo(input.autorId, input.pegaId)) {
    throw new Error("Ya postulaste a esta pega.");
  }
  const postulacion: Postulacion = {
    id: `pos-${Date.now().toString(36)}`,
    pegaId: input.pegaId,
    creadorId: input.creadorId,
    autorId: input.autorId,
    nota: input.nota.trim(),
    createdAt: new Date().toISOString(),
    estado: "pendiente",
  };
  write(K_POSTULACIONES, [postulacion, ...listPostulaciones()]);
  return postulacion;
}

export function elegirPostulacion(id: string) {
  const chosen = getPostulacion(id);
  if (!chosen) return;
  const next = listPostulaciones().map((p) => {
    if (p.pegaId !== chosen.pegaId) return p;
    if (p.id === id) return { ...p, estado: "elegido" as const };
    if (p.estado === "elegido") return p;
    return { ...p, estado: "no-elegido" as const };
  });
  write(K_POSTULACIONES, next);
  const pega = getEncargo(chosen.pegaId);
  if (pega) saveEncargo({ ...pega, elegidoPostulacionId: id });
  return getPostulacion(id);
}

export function listMensajes(chatId: string) {
  return read<Mensaje[]>(K_MENSAJES, [])
    .filter((m) => m.chatId === chatId)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

export function enviarMensaje(chatId: string, deId: string, texto: string) {
  const mensaje: Mensaje = {
    id: `msg-${Date.now().toString(36)}`,
    chatId,
    deId,
    texto: texto.trim(),
    createdAt: new Date().toISOString(),
  };
  write(K_MENSAJES, [...read<Mensaje[]>(K_MENSAJES, []), mensaje]);
  return mensaje;
}

export function chatsDe(userId: string) {
  const pegas = pegasDe(userId).map((p) => p.id);
  return listPostulaciones().filter(
    (p) =>
      p.estado === "elegido" &&
      (p.autorId === userId || pegas.includes(p.pegaId)),
  );
}

export function puedeVerChat(userId: string, postulacion: Postulacion) {
  if (postulacion.estado !== "elegido") return false;
  if (postulacion.autorId === userId) return true;
  const pega = getEncargo(postulacion.pegaId);
  return pega?.autorId === userId;
}
