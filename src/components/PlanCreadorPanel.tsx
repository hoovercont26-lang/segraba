"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usuarioActual } from "@/lib/auth";
import {
  PLANES_CREADOR,
  YAPE_PLIN_SEGRABA,
  formatoFechaPlan,
  solesFee,
  type PlanCreadorId,
} from "@/lib/money";
import {
  cupoPostulaciones,
  enviarConstanciaPlan,
  pedirPlan,
  perfilDe,
  planActivo,
  planVencido,
} from "@/lib/store";
import type { Creador } from "@/lib/types";
import type { MetodoPago, Usuario } from "@/lib/types";

export function PlanCreadorPanel() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [metodo, setMetodo] = useState<MetodoPago>("yape");
  const [constancia, setConstancia] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const [perfil, setPerfil] = useState<Creador | undefined>();
  const [pagoOpen, setPagoOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  async function reload() {
    const current = await usuarioActual();
    setUser(current);
    setPerfil(current ? await perfilDe(current.id) : undefined);
    setReady(true);
    return current;
  }

  useEffect(() => {
    setMounted(true);
    reload().then((current) => {
      if (current?.planEstado === "esperando-pago") setPagoOpen(true);
    });
  }, []);

  useEffect(() => {
    if (!pagoOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPagoOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [pagoOpen]);

  if (!ready) return <p className="text-muted">Cargando planes…</p>;
  if (!user) return null;

  const cupo = cupoPostulaciones(user);
  const activo = planActivo(user);
  const vencido = planVencido(user);
  const pagando =
    user.planEstado === "esperando-pago" || user.planEstado === "validando";
  const necesitaRenovar = vencido || user.planEstado === "vencido";
  const planElegido = user.plan ? PLANES_CREADOR[user.plan] : null;

  async function elegir(planId: PlanCreadorId) {
    setBusy(true);
    setError("");
    setCopied(false);
    setConstancia("");
    try {
      await pedirPlan(user!.id, planId);
      await reload();
      setPagoOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo.");
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Manda una foto de la constancia.");
      return;
    }
    if (file.size > 3_000_000) {
      setError("La foto pesa mucho. Manda una captura más liviana.");
      return;
    }
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("No se pudo leer la foto."));
      reader.readAsDataURL(file);
    });
    setConstancia(data);
    setError("");
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!constancia) {
      setError("Sube la constancia para validar el pago.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await enviarConstanciaPlan(user!.id, metodo, constancia);
      setConstancia("");
      setPagoOpen(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar.");
    } finally {
      setBusy(false);
    }
  }

  const modal =
    mounted &&
    pagoOpen &&
    user.planEstado === "esperando-pago" &&
    planElegido
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-4 backdrop-blur-[2px] sm:items-center"
            role="presentation"
            onClick={() => setPagoOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pago-plan-titulo"
              className="glass glass-hot max-h-[90vh] w-full max-w-lg overflow-y-auto p-5 shadow-2xl sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    Pago del plan
                  </p>
                  <h2
                    id="pago-plan-titulo"
                    className="mt-2 text-2xl font-semibold tracking-tight"
                  >
                    Paga {solesFee(user.planPago?.monto ?? planElegido.precio)}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Plan {planElegido.nombre} por 30 días. Yapea o plinea y manda
                    la constancia.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-line !px-3 !py-1.5 shrink-0"
                  onClick={() => setPagoOpen(false)}
                  aria-label="Cerrar"
                >
                  Cerrar
                </button>
              </div>

              <form onSubmit={enviar} className="mt-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`btn ${metodo === "yape" ? "btn-flash" : "btn-line"}`}
                    onClick={() => setMetodo("yape")}
                  >
                    Yape
                  </button>
                  <button
                    type="button"
                    className={`btn ${metodo === "plin" ? "btn-flash" : "btn-line"}`}
                    onClick={() => setMetodo("plin")}
                  >
                    Plin
                  </button>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">
                    Número {metodo === "yape" ? "Yape" : "Plin"}
                  </p>
                  <p className="price mt-2 text-3xl">{YAPE_PLIN_SEGRABA}</p>
                  <button
                    type="button"
                    className="btn btn-line mt-3"
                    onClick={async () => {
                      await navigator.clipboard.writeText(YAPE_PLIN_SEGRABA);
                      setCopied(true);
                    }}
                  >
                    {copied ? "Número copiado" : "Copiar número"}
                  </button>
                </div>
                <label className="block">
                  <span className="text-sm">Constancia</span>
                  <input
                    className="field"
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                </label>
                {constancia ? (
                  <p className="text-sm text-ok">Foto lista. Ya puedes enviarla.</p>
                ) : null}
                {error ? <p className="text-sm text-bad">{error}</p> : null}
                <button
                  type="submit"
                  className="btn btn-flash w-full"
                  disabled={busy}
                >
                  {busy ? "Un segundo…" : "Enviar constancia"}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="space-y-8">
      {!perfil ? (
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="font-semibold">Primero completa tu oferta</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Pon desde cuánto grabas y tu usuario de TikTok o Instagram. Luego
            eliges y pagas Base o Pro.
          </p>
          <Link href="/creadores/alta?edit=1" className="btn btn-flash mt-4">
            Completar mi oferta
          </Link>
        </div>
      ) : null}

      {necesitaRenovar ? (
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="seal seal-bad">Plan vencido</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            {user.planHasta
              ? `Tu plan venció el ${formatoFechaPlan(user.planHasta)}. `
              : "Tu plan ya no está activo. "}
            Elige Base o Pro abajo, paga y vuelve a apuntarte 30 días más.
          </p>
        </div>
      ) : null}

      {activo && cupo.plan ? (
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="seal seal-ok">Plan {cupo.plan.nombre} activo</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Apuntadas este ciclo:{" "}
            <span className="font-semibold text-ink">
              {cupo.usadas} / {cupo.limite}
            </span>
            . Te quedan {cupo.restantes}.
            {cupo.plan.precioMaxAviso
              ? ` Avisos hasta S/ ${cupo.plan.precioMaxAviso} por video.`
              : " Puedes apuntarte a cualquier precio."}
          </p>
          {user.planHasta ? (
            <p className="mt-2 text-sm text-muted">
              Vence el {formatoFechaPlan(user.planHasta)}
              {cupo.diasRestantes > 0
                ? ` · quedan ${cupo.diasRestantes} día${cupo.diasRestantes === 1 ? "" : "s"}`
                : ""}
              .
            </p>
          ) : null}
          {cupo.diasRestantes > 0 && cupo.diasRestantes <= 5 ? (
            <p className="mt-2 text-sm text-bad">
              Renueva pronto para no quedarte sin apuntadas.
            </p>
          ) : null}
          <Link href="/pegas" className="btn btn-flash mt-4">
            Ver avisos
          </Link>
        </div>
      ) : null}

      {user.planEstado === "validando" ? (
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="seal seal-wait">Validando plan</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Recibimos tu constancia del plan{" "}
            {PLANES_CREADOR[user.plan!]?.nombre}. En cuanto confirmemos el
            Yape o Plin, queda activo 30 días.
          </p>
        </div>
      ) : null}

      {user.planEstado === "esperando-pago" && planElegido && !pagoOpen ? (
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="font-semibold">Falta pagar {planElegido.nombre}</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Elige Yape o Plin, copia el número y manda la constancia.
          </p>
          <button
            type="button"
            className="btn btn-flash mt-4"
            onClick={() => {
              setError("");
              setPagoOpen(true);
            }}
          >
            Abrir pago
          </button>
        </div>
      ) : null}

      {perfil && (necesitaRenovar || !pagando || user.planEstado === "esperando-pago") ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.values(PLANES_CREADOR) as (typeof PLANES_CREADOR)[PlanCreadorId][]).map(
            (plan) => (
              <article
                key={plan.id}
                className={`rounded-xl border border-line bg-card p-5 ${
                  plan.id === "pro" ? "glass-hot" : ""
                }`}
              >
                <p className="text-xs uppercase tracking-[0.12em] text-muted">
                  {plan.nombre}
                </p>
                <p className="price mt-2 text-4xl">{solesFee(plan.precio)}</p>
                <p className="mt-1 text-sm text-muted">al mes · 30 días</p>
                <p className="mt-3 text-sm leading-6 text-muted">{plan.blurb}</p>
                <ul className="mt-4 space-y-2.5 text-sm leading-6 text-muted">
                  {plan.beneficios.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-flash"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`btn mt-5 w-full ${plan.id === "pro" ? "btn-flash" : "btn-line"}`}
                  disabled={busy}
                  onClick={() => {
                    if (
                      user.plan === plan.id &&
                      user.planEstado === "esperando-pago"
                    ) {
                      setError("");
                      setPagoOpen(true);
                      return;
                    }
                    void elegir(plan.id);
                  }}
                >
                  {user.plan === plan.id && user.planEstado === "esperando-pago"
                    ? "Continuar pago"
                    : necesitaRenovar
                      ? `Renovar ${plan.nombre}`
                      : `Elegir ${plan.nombre}`}
                </button>
              </article>
            ),
          )}
        </div>
      ) : null}

      {error && !pagoOpen ? <p className="text-sm text-bad">{error}</p> : null}
      {modal}
    </div>
  );
}
