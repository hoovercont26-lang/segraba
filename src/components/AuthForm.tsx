"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { entrar, registrar } from "@/lib/auth";
import type { Rol } from "@/lib/types";

export function AuthForm({ mode }: { mode: "entrar" | "registro" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/cuenta";
  const rolParam = params.get("rol") === "creador" ? "creador" : "marca";
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [clave, setClave] = useState("");
  const [rol, setRol] = useState<Rol>(rolParam);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "registro") {
        const phone = whatsapp.replace(/\D/g, "");
        if (nombre.trim().length < 2) throw new Error("Pon tu nombre.");
        if (!correo.includes("@")) throw new Error("Pon un correo válido.");
        if (phone.length !== 9 || !phone.startsWith("9")) {
          throw new Error("WhatsApp peruano: 9 dígitos, empieza con 9.");
        }
        if (clave.length < 6) throw new Error("La clave: 6 caracteres o más.");
        await registrar({ nombre, correo, whatsapp: phone, clave, rol });
      } else {
        await entrar(correo, clave);
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4">
      {mode === "registro" ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`btn ${rol === "marca" ? "btn-ink" : "btn-line"}`}
              onClick={() => setRol("marca")}
            >
              Quiero que se grabe
            </button>
            <button
              type="button"
              className={`btn ${rol === "creador" ? "btn-ink" : "btn-line"}`}
              onClick={() => setRol("creador")}
            >
              Ofrezco el servicio
            </button>
          </div>
          <label className="block">
            <span className="text-sm">Nombre</span>
            <input
              className="field"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={rol === "marca" ? "La Caleta Barranco" : "Camila Ríos"}
            />
          </label>
          <label className="block">
            <span className="text-sm">WhatsApp (9 dígitos)</span>
            <input
              className="field"
              inputMode="numeric"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="987654321"
            />
          </label>
        </>
      ) : null}
      <label className="block">
        <span className="text-sm">Correo</span>
        <input
          className="field"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="tu@correo.com"
        />
      </label>
      <label className="block">
        <span className="text-sm">Clave</span>
        <input
          className="field"
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="mínimo 6"
        />
      </label>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <button type="submit" className="btn btn-flash w-full" disabled={busy}>
        {busy ? "Un segundo…" : mode === "registro" ? "Crear cuenta" : "Entrar"}
      </button>
      <p className="text-sm text-muted">
        {mode === "registro" ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href={`/entrar?next=${encodeURIComponent(next)}`} className="underline underline-offset-4">
              Entrar
            </Link>
          </>
        ) : (
          <>
            ¿Primera vez?{" "}
            <Link href={`/registro?next=${encodeURIComponent(next)}`} className="underline underline-offset-4">
              Crear cuenta
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
