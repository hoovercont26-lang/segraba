import type {
  Creador,
  Encargo,
  Mensaje,
  Notificacion,
  Postulacion,
  Reporte,
  Usuario,
} from "@/lib/types";

type Row = Record<string, unknown>;

export function mapUsuario(row: Row): Usuario {
  return {
    id: String(row.id),
    nombre: String(row.nombre ?? ""),
    correo: String(row.correo ?? ""),
    whatsapp: String(row.whatsapp ?? ""),
    claveHash: "",
    roles: Array.isArray(row.roles) ? (row.roles as Usuario["roles"]) : ["marca"],
    createdAt: String(row.created_at ?? ""),
    plan: (row.plan as Usuario["plan"]) || null,
    planHasta: row.plan_hasta ? String(row.plan_hasta) : null,
    planEstado: (row.plan_estado as Usuario["planEstado"]) || "ninguno",
    planPago: (row.plan_pago as Usuario["planPago"]) || null,
    postulacionesUsadas: Number(row.postulaciones_usadas ?? 0),
    postulacionesPeriodo: row.postulaciones_periodo
      ? String(row.postulaciones_periodo)
      : null,
  };
}

export function mapAviso(row: Row): Encargo {
  return {
    id: String(row.id),
    autorId: row.autor_id ? String(row.autor_id) : undefined,
    marca: String(row.marca ?? ""),
    whatsapp: String(row.whatsapp ?? ""),
    nicho: row.nicho as Encargo["nicho"],
    ciudad: row.ciudad as Encargo["ciudad"],
    videos: Number(row.videos ?? 0),
    precio: Number(row.precio ?? 0),
    plazo: row.plazo as Encargo["plazo"],
    brief: String(row.brief ?? ""),
    createdAt: String(row.created_at ?? ""),
    elegidoPostulacionId: row.elegido_postulacion_id
      ? String(row.elegido_postulacion_id)
      : undefined,
    redes: Array.isArray(row.redes) ? (row.redes as Encargo["redes"]) : undefined,
    estado: (row.estado as Encargo["estado"]) || undefined,
    pago: (row.pago as Encargo["pago"]) || undefined,
  };
}

export function mapCreador(row: Row): Creador {
  return {
    id: String(row.id),
    autorId: row.autor_id ? String(row.autor_id) : undefined,
    nombre: String(row.nombre ?? ""),
    tiktok: String(row.tiktok ?? ""),
    ciudad: row.ciudad as Creador["ciudad"],
    nichos: Array.isArray(row.nichos) ? (row.nichos as Creador["nichos"]) : [],
    minPrecio: Number(row.min_precio ?? 0),
    redes: Array.isArray(row.redes) ? (row.redes as Creador["redes"]) : undefined,
    seguidores: Number(row.seguidores ?? 0),
    estilo: String(row.estilo ?? ""),
    whatsapp: String(row.whatsapp ?? ""),
    entregas: Number(row.entregas ?? 0),
  };
}

export function mapPostulacion(row: Row): Postulacion {
  return {
    id: String(row.id),
    pegaId: String(row.pega_id),
    creadorId: String(row.creador_id),
    autorId: String(row.autor_id),
    nota: String(row.nota ?? ""),
    createdAt: String(row.created_at ?? ""),
    estado: row.estado as Postulacion["estado"],
  };
}

export function mapMensaje(row: Row): Mensaje {
  return {
    id: String(row.id),
    chatId: String(row.chat_id),
    deId: String(row.de_id),
    texto: String(row.texto ?? ""),
    createdAt: String(row.created_at ?? ""),
  };
}

export function mapNoti(row: Row): Notificacion {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    para: row.para as Notificacion["para"],
    titulo: String(row.titulo ?? ""),
    cuerpo: String(row.cuerpo ?? ""),
    href: String(row.href ?? ""),
    leida: Boolean(row.leida),
    createdAt: String(row.created_at ?? ""),
  };
}

export function mapReporte(row: Row): Reporte {
  return {
    id: String(row.id),
    deId: String(row.de_id),
    contraTipo: row.contra_tipo as Reporte["contraTipo"],
    contraId: String(row.contra_id),
    contraNombre: row.contra_nombre ? String(row.contra_nombre) : undefined,
    contacto: row.contacto ? String(row.contacto) : undefined,
    motivo: row.motivo as Reporte["motivo"],
    detalle: String(row.detalle ?? ""),
    createdAt: String(row.created_at ?? ""),
  };
}

export function avisoRow(item: Encargo) {
  return {
    id: item.id,
    autor_id: item.autorId ?? null,
    marca: item.marca,
    whatsapp: item.whatsapp,
    nicho: item.nicho,
    ciudad: item.ciudad,
    videos: item.videos,
    precio: item.precio,
    plazo: item.plazo,
    brief: item.brief,
    created_at: item.createdAt,
    elegido_postulacion_id: item.elegidoPostulacionId ?? null,
    redes: item.redes ?? ["tiktok"],
    estado: item.estado ?? "publicado",
    pago: item.pago ?? null,
  };
}

export function creadorRow(item: Creador) {
  return {
    id: item.id,
    autor_id: item.autorId ?? null,
    nombre: item.nombre,
    tiktok: item.tiktok,
    ciudad: item.ciudad,
    nichos: item.nichos,
    min_precio: item.minPrecio,
    redes: item.redes ?? ["tiktok"],
    seguidores: item.seguidores,
    estilo: item.estilo,
    whatsapp: item.whatsapp,
    entregas: item.entregas ?? 0,
  };
}
