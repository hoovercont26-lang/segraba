import { ADMIN_EMAIL } from "./money";
import { sincronizarPlanExpirado } from "./store";
import { createClient, supabaseConfigured } from "./supabase/client";
import { mapUsuario } from "./supabase/map";
import type { Rol, Usuario } from "./types";

function correoLimpio(correo: string) {
  return correo.trim().toLowerCase().replace(/\s+/g, "");
}

function avisoSesion() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("segraba-sesion"));
}

function fail(message: string): never {
  throw new Error(message);
}

function mapAuthError(message: string): never {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists")) {
    fail("Ese correo ya está registrado.");
  }
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    fail("Correo o clave no coinciden.");
  }
  if (m.includes("email not confirmed")) {
    fail("Confirma tu correo y vuelve a entrar.");
  }
  if (m.includes("email signups are disabled") || m.includes("signups not allowed")) {
    fail(
      "En Supabase está apagado el registro. Authentication → Sign In / Providers → Email: prende Enable email provider y Allow new users to sign up.",
    );
  }
  fail(message);
}

async function perfilDeId(id: string): Promise<Usuario | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) mapAuthError(error.message);
  return data ? mapUsuario(data) : null;
}

export function esAdmin(user?: Usuario | null) {
  if (!user) return false;
  return correoLimpio(user.correo) === correoLimpio(ADMIN_EMAIL);
}

export async function usuarioActual(): Promise<Usuario | null> {
  if (!supabaseConfigured()) return null;
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const perfil = await perfilDeId(data.user.id);
  if (perfil) return sincronizarPlanExpirado(perfil);
  return {
    id: data.user.id,
    nombre: String(data.user.user_metadata?.nombre || data.user.email?.split("@")[0] || ""),
    correo: data.user.email || "",
    whatsapp: String(data.user.user_metadata?.whatsapp || ""),
    claveHash: "",
    roles: [data.user.user_metadata?.rol === "creador" ? "creador" : "marca"],
    createdAt: data.user.created_at || "",
  };
}

export async function getUsuario(id: string): Promise<Usuario | undefined> {
  if (!supabaseConfigured()) return undefined;
  const propio = await perfilDeId(id);
  if (propio) return propio;
  const supabase = createClient();
  const { data } = await supabase.from("perfiles_publicos").select("id, nombre").eq("id", id).maybeSingle();
  if (!data) return undefined;
  return {
    id: String(data.id),
    nombre: String(data.nombre ?? ""),
    correo: "",
    whatsapp: "",
    claveHash: "",
    roles: ["marca"],
    createdAt: "",
  };
}

export async function listUsuarios(): Promise<Usuario[]> {
  if (!supabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) mapAuthError(error.message);
  return (data ?? []).map(mapUsuario);
}

export async function registrar(input: {
  nombre: string;
  correo: string;
  whatsapp: string;
  clave: string;
  rol: Rol;
}) {
  if (!supabaseConfigured()) fail("Falta conectar Supabase.");
  const supabase = createClient();
  const correo = correoLimpio(input.correo);
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: input.clave,
    options: {
      data: {
        nombre: input.nombre.trim(),
        whatsapp: input.whatsapp,
        rol: input.rol,
      },
    },
  });
  if (error) mapAuthError(error.message);
  if (!data.session) {
    fail("Revisa tu correo y confirma la cuenta. Luego entra.");
  }
  avisoSesion();
  return usuarioActual();
}

export async function entrar(correo: string, clave: string) {
  if (!supabaseConfigured()) fail("Falta conectar Supabase.");
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: correoLimpio(correo),
    password: clave,
  });
  if (error) mapAuthError(error.message);
  avisoSesion();
  return usuarioActual();
}

export async function cerrarSesion() {
  if (!supabaseConfigured()) return;
  const supabase = createClient();
  await supabase.auth.signOut();
  avisoSesion();
}

export async function sumarRol(rol: Rol) {
  const user = await usuarioActual();
  if (!user) return;
  if (user.roles.includes(rol)) return user;
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ roles: [...user.roles, rol] })
    .eq("id", user.id);
  if (error) mapAuthError(error.message);
  avisoSesion();
  return usuarioActual();
}

export async function actualizarPerfil(input: {
  nombre: string;
  correo?: string;
  whatsapp?: string;
}) {
  const user = await usuarioActual();
  if (!user) fail("Entra para editar tu nombre.");
  const nombre = input.nombre.trim();
  if (nombre.length < 2) fail("Pon un nombre.");
  const correo = correoLimpio(input.correo ?? user.correo);
  if (!correo.includes("@")) fail("Pon un correo válido.");
  if (
    correo === correoLimpio(ADMIN_EMAIL) &&
    correoLimpio(user.correo) !== correoLimpio(ADMIN_EMAIL)
  ) {
    fail("Ese correo no se puede usar.");
  }
  const whatsapp = (input.whatsapp ?? user.whatsapp).replace(/\D/g, "");
  if (whatsapp.length !== 9 || !whatsapp.startsWith("9")) {
    fail("WhatsApp peruano: 9 dígitos, empieza con 9.");
  }
  const supabase = createClient();
  if (correo !== correoLimpio(user.correo)) {
    const { error: authError } = await supabase.auth.updateUser({ email: correo });
    if (authError) mapAuthError(authError.message);
  }
  const { error } = await supabase
    .from("profiles")
    .update({ nombre, correo, whatsapp })
    .eq("id", user.id);
  if (error) {
    if (error.message.toLowerCase().includes("duplicate") || error.code === "23505") {
      fail("Ese correo ya está en otra cuenta.");
    }
    mapAuthError(error.message);
  }
  avisoSesion();
  return usuarioActual();
}
