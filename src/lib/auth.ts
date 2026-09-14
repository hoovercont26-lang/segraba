import { slugify } from "./match";
import type { Rol, Usuario } from "./types";

const K_USERS = "segraba.usuarios";
const K_SESION = "segraba.sesion";

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

export async function hashClave(clave: string) {
  const data = new TextEncoder().encode(`segraba.v1:${clave}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export function listUsuarios(): Usuario[] {
  return read<Usuario[]>(K_USERS, []);
}

export function getUsuario(id: string) {
  return listUsuarios().find((u) => u.id === id);
}

export function sesionId() {
  return read<string | null>(K_SESION, null);
}

export function usuarioActual(): Usuario | null {
  const id = sesionId();
  if (!id) return null;
  return getUsuario(id) ?? null;
}

export function cerrarSesion() {
  window.localStorage.removeItem(K_SESION);
}

function guardarUsuario(usuario: Usuario) {
  const all = listUsuarios();
  write(K_USERS, [usuario, ...all.filter((u) => u.id !== usuario.id)]);
}

export async function registrar(input: {
  nombre: string;
  correo: string;
  whatsapp: string;
  clave: string;
  rol: Rol;
}) {
  const correo = input.correo.trim().toLowerCase();
  if (listUsuarios().some((u) => u.correo === correo)) {
    throw new Error("Ese correo ya está registrado.");
  }
  const usuario: Usuario = {
    id: slugify(correo) || `u-${Date.now().toString(36)}`,
    nombre: input.nombre.trim(),
    correo,
    whatsapp: input.whatsapp,
    claveHash: await hashClave(input.clave),
    roles: [input.rol],
    createdAt: new Date().toISOString(),
  };
  guardarUsuario(usuario);
  write(K_SESION, usuario.id);
  return usuario;
}

export async function entrar(correo: string, clave: string) {
  const user = listUsuarios().find(
    (u) => u.correo === correo.trim().toLowerCase(),
  );
  if (!user || user.claveHash !== (await hashClave(clave))) {
    throw new Error("Correo o clave no coinciden.");
  }
  write(K_SESION, user.id);
  return user;
}

export function sumarRol(rol: Rol) {
  const user = usuarioActual();
  if (!user) return;
  if (user.roles.includes(rol)) return user;
  const next = { ...user, roles: [...user.roles, rol] };
  guardarUsuario(next);
  return next;
}
