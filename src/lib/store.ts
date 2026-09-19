import { CREADORES, ENCARGOS } from "./data";
import {
  FEE_AVISO,
  PLANES_CREADOR,
  avisoPublico,
  diasRestantesPlan,
  finPlanDesde,
  formatoFechaPlan,
  planDe,
  type PlanCreadorId,
} from "./money";
import { createClient, supabaseConfigured } from "./supabase/client";
import {
  avisoRow,
  creadorRow,
  mapAviso,
  mapCreador,
  mapMensaje,
  mapNoti,
  mapPostulacion,
  mapReporte,
  mapUsuario,
} from "./supabase/map";
import type {
  Creador,
  Encargo,
  Mensaje,
  MetodoPago,
  MotivoReporte,
  Notificacion,
  Postulacion,
  Reporte,
  Usuario,
} from "./types";

function fail(message: string): never {
  throw new Error(message);
}

function dbError(error: { message: string; code?: string } | null) {
  if (!error) return;
  if (error.code === "23505") fail("Eso ya está registrado.");
  fail(error.message);
}

export async function listEncargos(): Promise<Encargo[]> {
  if (!supabaseConfigured()) return ENCARGOS;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("avisos")
    .select("*")
    .order("created_at", { ascending: false });
  dbError(error);
  return (data ?? []).map(mapAviso);
}

export async function listPegasPublicas(): Promise<Encargo[]> {
  const all = await listEncargos();
  return all.filter(avisoPublico);
}

export async function pegasDe(autorId: string): Promise<Encargo[]> {
  return (await listEncargos()).filter((e) => e.autorId === autorId);
}

export async function esPrimeraPublicacion(_autorId: string) {
  // Cada aviso paga fee. Se mantiene por compatibilidad de imports.
  return true;
}

export function planActivo(user: Usuario | null | undefined) {
  if (!user?.plan || user.planEstado !== "activo" || !user.planHasta) return false;
  return new Date(user.planHasta).getTime() > Date.now();
}

export function planVencido(user: Usuario | null | undefined) {
  if (!user?.plan) return false;
  if (user.planEstado === "vencido") return true;
  if (user.planEstado !== "activo" || !user.planHasta) return false;
  return new Date(user.planHasta).getTime() <= Date.now();
}

/** Clave del ciclo de suscripción; al renovar cambia y el contador se reinicia. */
export function periodoSuscripcion(user: Usuario | null | undefined) {
  if (!planActivo(user) || !user?.planHasta) return null;
  return user.planHasta;
}

export function cupoPostulaciones(user: Usuario | null | undefined) {
  const plan = planDe(user?.plan);
  const activo = planActivo(user);
  const periodo = periodoSuscripcion(user);
  const usadas =
    periodo && user?.postulacionesPeriodo === periodo ? (user.postulacionesUsadas ?? 0) : 0;
  const limite = activo && plan ? plan.postulaciones : 0;
  return {
    plan,
    periodo,
    usadas,
    limite,
    restantes: Math.max(0, limite - usadas),
    activo,
    diasRestantes: activo ? diasRestantesPlan(user?.planHasta) : 0,
  };
}

export async function sincronizarPlanExpirado(user: Usuario): Promise<Usuario> {
  if (
    !user.plan ||
    user.planEstado !== "activo" ||
    !user.planHasta ||
    new Date(user.planHasta).getTime() > Date.now()
  ) {
    return user;
  }
  const updated = await patchPerfil(user.id, { plan_estado: "vencido" });
  await notificar({
    userId: user.id,
    para: "creador",
    titulo: "Tu plan venció",
    cuerpo: `Venció el ${formatoFechaPlan(user.planHasta)}. Renueva Base o Pro para volver a apuntarte a avisos.`,
    href: "/creadores/plan",
  });
  return updated;
}

export function puedeApuntarseAviso(user: Usuario | null | undefined, aviso: Encargo) {
  const cupo = cupoPostulaciones(user);
  if (!cupo.activo || !cupo.plan) {
    return { ok: false as const, motivo: "Necesitas un plan de creador para apuntarte." };
  }
  if (cupo.restantes <= 0) {
    return {
      ok: false as const,
      motivo: `Ya usaste tus ${cupo.limite} apuntadas de este ciclo. Sube a Pro o espera a renovar tu plan.`,
    };
  }
  const techo = cupo.plan.precioMaxAviso;
  if (techo !== null && aviso.precio > techo) {
    return {
      ok: false as const,
      motivo: `Con Base solo puedes apuntarte hasta S/ ${techo}. Este aviso pide S/ ${aviso.precio}. Pasa a Pro.`,
    };
  }
  return { ok: true as const, cupo };
}

export type EstadoApuntarse =
  | { paso: "entrar" }
  | { paso: "rol-creador" }
  | { paso: "perfil" }
  | { paso: "plan"; planEstado: Usuario["planEstado"]; vencioEl?: string }
  | { paso: "bloqueado"; motivo: string; cupo?: ReturnType<typeof cupoPostulaciones> }
  | { paso: "ok"; cupo: ReturnType<typeof cupoPostulaciones> };

export function estadoApuntarse(
  user: Usuario | null | undefined,
  perfil: Creador | undefined,
  aviso: Encargo,
): EstadoApuntarse {
  if (!user) return { paso: "entrar" };
  if (!user.roles.includes("creador")) return { paso: "rol-creador" };
  if (!perfil) return { paso: "perfil" };
  if (!planActivo(user)) {
    const planEstado = planVencido(user)
      ? "vencido"
      : (user.planEstado ?? "ninguno");
    return {
      paso: "plan",
      planEstado,
      vencioEl: user.planHasta ?? undefined,
    };
  }
  const check = puedeApuntarseAviso(user, aviso);
  if (!check.ok) {
    return {
      paso: "bloqueado",
      motivo: check.motivo,
      cupo: cupoPostulaciones(user),
    };
  }
  return { paso: "ok", cupo: check.cupo };
}

async function patchPerfil(userId: string, patch: Record<string, unknown>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("*")
    .maybeSingle();
  dbError(error);
  if (!data) {
    fail("No se pudo guardar el perfil. Revisa permisos o vuelve a intentar.");
  }
  return mapUsuario(data);
}

export async function pedirPlan(userId: string, planId: PlanCreadorId) {
  const plan = PLANES_CREADOR[planId];
  if (!plan) fail("Ese plan no existe.");
  if (!(await perfilDe(userId))) {
    fail("Completa tu oferta de creador antes de elegir un plan.");
  }
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  dbError(error);
  if (!row) fail("No encontramos tu cuenta.");
  const user = mapUsuario(row);
  if (user.planEstado === "validando") {
    fail("Ya enviaste la constancia. Espera a que validemos tu pago.");
  }
  if (planActivo(user)) {
    fail(
      `Tu plan sigue vigente${user.planHasta ? ` hasta el ${formatoFechaPlan(user.planHasta)}` : ""}. Renueva cuando venza.`,
    );
  }
  return patchPerfil(userId, {
    plan: planId,
    plan_estado: "esperando-pago",
    plan_hasta: null,
    plan_pago: { monto: plan.precio },
  });
}

export async function enviarConstanciaPlan(
  userId: string,
  metodo: MetodoPago,
  constancia: string,
) {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  dbError(error);
  if (!row) fail("No encontramos tu cuenta.");
  const user = mapUsuario(row);
  if (!user.plan || user.planEstado === "ninguno") {
    fail("Elige un plan primero.");
  }
  if (planActivo(user)) {
    fail("Tu plan ya está activo. No hace falta volver a pagar.");
  }
  if (user.planEstado === "validando") {
    fail("Ya enviaste la constancia. Estamos validando tu pago.");
  }
  const plan = planDe(user.plan);
  const next = await patchPerfil(userId, {
    plan_estado: "validando",
    plan_pago: {
      monto: user.planPago?.monto ?? plan?.precio ?? FEE_AVISO,
      metodo,
      constancia,
      enviadoAt: new Date().toISOString(),
    },
  });
  await notificar({
    userId,
    para: "creador",
    titulo: "Recibimos el pago de tu plan",
    cuerpo: `Estamos validando tu ${metodo === "yape" ? "Yape" : "Plin"} de S/ ${(user.planPago?.monto ?? plan?.precio ?? 0).toFixed(2)}. En cuanto lo veamos, tu plan queda activo.`,
    href: "/creadores/plan",
  });
  return next;
}

export async function activarPlan(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("activar_plan_creador", {
    p_user_id: userId,
  });
  if (error) {
    // Fallback si aún no corrieron la migración RPC: update directo (requiere RLS admin)
    if (
      error.message.toLowerCase().includes("activar_plan_creador") ||
      error.message.toLowerCase().includes("could not find") ||
      error.code === "PGRST202"
    ) {
      const { data: row, error: readErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      dbError(readErr);
      if (!row) fail("No encontramos esa cuenta.");
      const user = mapUsuario(row);
      if (!user.plan) fail("Esa cuenta no pidió un plan.");
      const hasta = finPlanDesde();
      const hastaIso = hasta.toISOString();
      const next = await patchPerfil(userId, {
        plan_estado: "activo",
        plan_hasta: hastaIso,
        postulaciones_usadas: 0,
        postulaciones_periodo: hastaIso,
        plan_pago: {
          ...user.planPago,
          monto: user.planPago?.monto ?? planDe(user.plan)?.precio ?? 0,
          validadoAt: new Date().toISOString(),
        },
      });
      await notificar({
        userId,
        para: "creador",
        titulo: user.planEstado === "vencido" ? "Plan renovado" : "Tu plan ya está activo",
        cuerpo: `Plan ${planDe(user.plan)?.nombre} vigente hasta el ${formatoFechaPlan(hastaIso)}. Te quedan ${planDe(user.plan)?.postulaciones ?? 0} apuntadas en este ciclo.`,
        href: "/pegas",
      });
      return next;
    }
    dbError(error);
  }
  if (!data) fail("No se pudo activar el plan.");
  return mapUsuario(data as Record<string, unknown>);
}

export async function planesValidando() {
  if (!supabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("plan_estado", "validando")
    .order("created_at", { ascending: false });
  dbError(error);
  return (data ?? []).map(mapUsuario);
}

async function consumirPostulacion(user: Usuario) {
  const periodo = periodoSuscripcion(user);
  if (!periodo) fail("Tu plan no está activo.");
  const usadas =
    user.postulacionesPeriodo === periodo ? (user.postulacionesUsadas ?? 0) : 0;
  const limite = planDe(user.plan)?.postulaciones ?? 0;
  if (usadas >= limite) {
    fail(`Ya usaste tus ${limite} apuntadas de este ciclo. Renueva cuando venza tu plan.`);
  }
  return patchPerfil(user.id, {
    postulaciones_usadas: usadas + 1,
    postulaciones_periodo: periodo,
  });
}

export async function avisosValidando() {
  return (await listEncargos()).filter((e) => e.estado === "validando");
}

export async function avisosEsperandoPago() {
  return (await listEncargos()).filter((e) => e.estado === "esperando-pago");
}

export async function getEncargo(id: string): Promise<Encargo | undefined> {
  if (!supabaseConfigured()) return ENCARGOS.find((e) => e.id === id);
  const supabase = createClient();
  const { data, error } = await supabase.from("avisos").select("*").eq("id", id).maybeSingle();
  dbError(error);
  return data ? mapAviso(data) : undefined;
}

export async function saveEncargo(encargo: Encargo) {
  if (!supabaseConfigured()) fail("Falta conectar Supabase.");
  const supabase = createClient();
  const { error } = await supabase.from("avisos").upsert(avisoRow(encargo));
  dbError(error);
  return getEncargo(encargo.id);
}

export async function listCreadores(): Promise<Creador[]> {
  if (!supabaseConfigured()) return CREADORES.map((c) => ({ ...c, entregas: c.entregas ?? 0 }));
  const supabase = createClient();
  const { data, error } = await supabase.from("creadores").select("*").order("nombre");
  dbError(error);
  return (data ?? []).map(mapCreador);
}

export async function getCreador(id: string): Promise<Creador | undefined> {
  if (!supabaseConfigured()) return CREADORES.find((c) => c.id === id);
  const supabase = createClient();
  const { data, error } = await supabase.from("creadores").select("*").eq("id", id).maybeSingle();
  dbError(error);
  return data ? mapCreador(data) : undefined;
}

export async function saveCreador(creador: Creador) {
  if (!supabaseConfigured()) fail("Falta conectar Supabase.");
  const supabase = createClient();
  const { error } = await supabase.from("creadores").upsert(creadorRow(creador));
  dbError(error);
  return getCreador(creador.id);
}

export async function perfilDe(autorId: string) {
  if (!supabaseConfigured()) {
    return CREADORES.find((c) => c.autorId === autorId);
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("creadores")
    .select("*")
    .eq("autor_id", autorId)
    .maybeSingle();
  dbError(error);
  return data ? mapCreador(data) : undefined;
}

export async function listReportes(): Promise<Reporte[]> {
  if (!supabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reportes")
    .select("*")
    .order("created_at", { ascending: false });
  dbError(error);
  return (data ?? []).map(mapReporte);
}

export async function countReportes(tipo: Reporte["contraTipo"], id: string) {
  if (!supabaseConfigured()) return 0;
  const supabase = createClient();
  const { data, error } = await supabase.rpc("reporte_count", { p_tipo: tipo, p_id: id });
  dbError(error);
  return Number(data ?? 0);
}

export async function yaReporto(deId: string, tipo: Reporte["contraTipo"], id: string) {
  const all = await listReportes();
  return all.some((r) => r.deId === deId && r.contraTipo === tipo && r.contraId === id);
}

export async function saveReporte(input: {
  deId: string;
  contraTipo: Reporte["contraTipo"];
  contraId: string;
  contraNombre?: string;
  contacto?: string;
  motivo: MotivoReporte;
  detalle: string;
}) {
  const supabase = createClient();
  const { data: row, error: userErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", input.deId)
    .maybeSingle();
  dbError(userErr);
  const user = row ? mapUsuario(row) : null;

  if (input.contraTipo === "pega" && !planActivo(user)) {
    fail(
      "Con cuenta Free no puedes reportar avisos. Activa un plan de creador para postular y reportar.",
    );
  }

  const contraId = input.contraId.trim() || `manual-${Date.now().toString(36)}`;
  if (await yaReporto(input.deId, input.contraTipo, contraId)) {
    fail("Ya reportaste a este perfil.");
  }
  const { error } = await supabase.from("reportes").insert({
    de_id: input.deId,
    contra_tipo: input.contraTipo,
    contra_id: contraId,
    contra_nombre: input.contraNombre?.trim() || null,
    contacto: input.contacto?.trim() || null,
    motivo: input.motivo,
    detalle: input.detalle.trim(),
  });
  dbError(error);
}

export async function reportesDe(deId: string) {
  return (await listReportes()).filter((r) => r.deId === deId);
}

export async function marcado(tipo: Reporte["contraTipo"], id: string) {
  return (await countReportes(tipo, id)) >= 2;
}

export async function listPostulaciones(): Promise<Postulacion[]> {
  if (!supabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("postulaciones")
    .select("*")
    .order("created_at", { ascending: false });
  dbError(error);
  return (data ?? []).map(mapPostulacion);
}

export async function postulacionesDePega(pegaId: string) {
  return (await listPostulaciones())
    .filter((p) => p.pegaId === pegaId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function postulacionesDe(autorId: string) {
  return (await listPostulaciones()).filter((p) => p.autorId === autorId);
}

export async function getPostulacion(id: string) {
  if (!supabaseConfigured()) return undefined;
  const supabase = createClient();
  const { data, error } = await supabase.from("postulaciones").select("*").eq("id", id).maybeSingle();
  dbError(error);
  return data ? mapPostulacion(data) : undefined;
}

export async function yaPostulo(autorId: string, pegaId: string) {
  return (await listPostulaciones()).some((p) => p.autorId === autorId && p.pegaId === pegaId);
}

export async function notificar(input: Omit<Notificacion, "id" | "leida" | "createdAt">) {
  if (!supabaseConfigured()) return;
  const supabase = createClient();
  const { error } = await supabase.rpc("notificar", {
    p_user_id: input.userId,
    p_para: input.para,
    p_titulo: input.titulo,
    p_cuerpo: input.cuerpo,
    p_href: input.href,
  });
  dbError(error);
}

export async function postular(input: {
  pegaId: string;
  creadorId: string;
  autorId: string;
  nota: string;
}) {
  if (await yaPostulo(input.autorId, input.pegaId)) {
    fail("Ya te apuntaste a este aviso.");
  }
  const pega = await getEncargo(input.pegaId);
  if (!pega) fail("Ese aviso no está.");
  if (!avisoPublico(pega)) fail("Ese aviso aún no está al aire.");
  const supabase = createClient();
  const { data: row, error: userErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", input.autorId)
    .maybeSingle();
  dbError(userErr);
  const user = row ? mapUsuario(row) : null;
  if (!user?.roles.includes("creador")) {
    fail("Necesitas cuenta de creador para apuntarte.");
  }
  const perfil = await perfilDe(input.autorId);
  if (!perfil) {
    fail("Completa tu oferta de creador antes de apuntarte.");
  }
  if (perfil.id !== input.creadorId) {
    fail("Ese perfil de creador no es tuyo.");
  }
  const check = puedeApuntarseAviso(user, pega);
  if (!check.ok) fail(check.motivo);

  const { error } = await supabase.from("postulaciones").insert({
    pega_id: input.pegaId,
    creador_id: input.creadorId,
    autor_id: input.autorId,
    nota: input.nota.trim(),
    estado: "pendiente",
  });
  dbError(error);
  if (user) await consumirPostulacion(user);

  const creador = await getCreador(input.creadorId);
  if (pega.autorId) {
    await notificar({
      userId: pega.autorId,
      para: "negocio",
      titulo: "Alguien se apuntó a tu aviso",
      cuerpo: `${creador?.nombre || "Un creador"} se apuntó a ${pega.marca}. Entra y elige.`,
      href: `/pegas/${pega.id}`,
    });
  }
  const cupo = cupoPostulaciones({
    ...user!,
    postulacionesUsadas: (check.cupo.usadas ?? 0) + 1,
    postulacionesPeriodo: check.cupo.periodo,
  });
  await notificar({
    userId: input.autorId,
    para: "creador",
    titulo: "Ya te apuntaste",
    cuerpo: `Quedaste anotado en ${pega.marca}. Te quedan ${cupo.restantes} apuntadas en este ciclo.`,
    href: `/pegas/${pega.id}`,
  });
}

export async function elegirPostulacion(id: string) {
  const chosen = await getPostulacion(id);
  if (!chosen) return;
  const supabase = createClient();
  const { error: one } = await supabase.from("postulaciones").update({ estado: "elegido" }).eq("id", id);
  dbError(one);
  const { error: rest } = await supabase
    .from("postulaciones")
    .update({ estado: "no-elegido" })
    .eq("pega_id", chosen.pegaId)
    .eq("estado", "pendiente");
  dbError(rest);
  const pega = await getEncargo(chosen.pegaId);
  if (pega) await saveEncargo({ ...pega, elegidoPostulacionId: id });
  const creador = await getCreador(chosen.creadorId);
  if (chosen.autorId && pega) {
    await notificar({
      userId: chosen.autorId,
      para: "creador",
      titulo: "Te eligieron",
      cuerpo: `${pega.marca} te eligió. Entra al chat y acuerden el día y el Yape.`,
      href: `/chats/${chosen.id}`,
    });
  }
  if (pega?.autorId && creador) {
    await notificar({
      userId: pega.autorId,
      para: "negocio",
      titulo: "Ya elegiste. El chat está abierto",
      cuerpo: `Elegiste a ${creador.nombre}. Conversen aquí. El pago del video es entre ustedes.`,
      href: `/chats/${chosen.id}`,
    });
  }
  const perdedores = (await postulacionesDePega(chosen.pegaId)).filter((p) => p.estado === "no-elegido");
  for (const p of perdedores) {
    if (!pega) continue;
    await notificar({
      userId: p.autorId,
      para: "creador",
      titulo: "Esta vez no te tomaron",
      cuerpo: `${pega.marca} eligió a otra persona. Sigue mirando avisos.`,
      href: "/pegas",
    });
  }
  return getPostulacion(id);
}

export async function listMensajes(chatId: string): Promise<Mensaje[]> {
  if (!supabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mensajes")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  dbError(error);
  return (data ?? []).map(mapMensaje);
}

export async function enviarMensaje(chatId: string, deId: string, texto: string) {
  const supabase = createClient();
  const { error } = await supabase.from("mensajes").insert({
    chat_id: chatId,
    de_id: deId,
    texto: texto.trim(),
  });
  dbError(error);
}

export async function chatsDe(userId: string) {
  const pegas = (await pegasDe(userId)).map((p) => p.id);
  return (await listPostulaciones()).filter(
    (p) => p.estado === "elegido" && (p.autorId === userId || pegas.includes(p.pegaId)),
  );
}

export async function puedeVerChat(userId: string, postulacion: Postulacion) {
  if (postulacion.estado !== "elegido") return false;
  if (postulacion.autorId === userId) return true;
  const pega = await getEncargo(postulacion.pegaId);
  return pega?.autorId === userId;
}

export async function notisDe(userId: string) {
  if (!supabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  dbError(error);
  return (data ?? []).map(mapNoti);
}

export async function noLeidasDe(userId: string) {
  return (await notisDe(userId)).filter((n) => !n.leida);
}

export async function marcarLeida(id: string) {
  if (!supabaseConfigured()) return;
  const supabase = createClient();
  const { error } = await supabase.from("notificaciones").update({ leida: true }).eq("id", id);
  dbError(error);
}

export async function marcarTodasLeidas(userId: string) {
  if (!supabaseConfigured()) return;
  const supabase = createClient();
  const { error } = await supabase.from("notificaciones").update({ leida: true }).eq("user_id", userId);
  dbError(error);
}

export async function enviarConstancia(id: string, metodo: MetodoPago, constancia: string) {
  const encargo = await getEncargo(id);
  if (!encargo) return;
  await saveEncargo({
    ...encargo,
    estado: "validando",
    pago: {
      monto: encargo.pago?.monto ?? FEE_AVISO,
      metodo,
      constancia,
      enviadoAt: new Date().toISOString(),
    },
  });
  if (encargo.autorId) {
    await notificar({
      userId: encargo.autorId,
      para: "negocio",
      titulo: "Recibimos tu constancia",
      cuerpo: `Estamos validando tu ${metodo === "yape" ? "Yape" : "Plin"} de S/ ${(encargo.pago?.monto ?? FEE_AVISO).toFixed(2)}. En cuanto lo veamos, el aviso ${encargo.marca} queda al aire.`,
      href: `/pegas/${encargo.id}`,
    });
  }
  return getEncargo(id);
}

export async function avisarCreadoresDeAviso(encargo: Encargo) {
  const creadores = await listCreadores();
  for (const c of creadores) {
    if (!c.autorId) continue;
    if (!c.nichos.includes(encargo.nicho)) continue;
    if (c.minPrecio > encargo.precio) continue;
    await notificar({
      userId: c.autorId,
      para: "creador",
      titulo: "Hay un aviso que te calza",
      cuerpo: `${encargo.marca} pide ${encargo.videos} videos ${encargo.nicho.toLowerCase()} a S/ ${encargo.precio} en ${encargo.ciudad}. Si te alcanza, apúntate.`,
      href: `/pegas/${encargo.id}`,
    });
  }
}

export async function lanzarAviso(id: string) {
  const encargo = await getEncargo(id);
  if (!encargo) return;
  await saveEncargo({
    ...encargo,
    estado: "publicado",
    pago: {
      ...encargo.pago,
      monto: encargo.pago?.monto ?? FEE_AVISO,
      validadoAt: new Date().toISOString(),
    },
  });
  if (encargo.autorId) {
    await notificar({
      userId: encargo.autorId,
      para: "negocio",
      titulo: "Tu aviso ya está al aire",
      cuerpo: `Ya validamos el pago. ${encargo.marca} ya se ve en Avisos. Te avisamos cuando alguien se apunte.`,
      href: `/pegas/${encargo.id}`,
    });
  }
  await avisarCreadoresDeAviso(encargo);
  return getEncargo(id);
}
