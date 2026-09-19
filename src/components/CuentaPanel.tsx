"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { actualizarPerfil, esAdmin, sumarRol, usuarioActual } from "@/lib/auth";
import { ListaNotis } from "@/components/Bandeja";
import {
  chatsDe,
  cupoPostulaciones,
  getCreador,
  getEncargo,
  pegasDe,
  perfilDe,
  planActivo,
  planVencido,
  postulacionesDe,
  reportesDe,
} from "@/lib/store";
import { FEE_AVISO, PLANES_CREADOR, formatoFechaPlan, solesFee } from "@/lib/money";
import type { Encargo, Creador, Postulacion, Reporte, Usuario } from "@/lib/types";
import { MOTIVOS_REPORTE } from "@/lib/types";

function selloAviso(item: Encargo) {
  if (item.estado === "esperando-pago") return { label: "Falta pagar", cls: "seal seal-bad" };
  if (item.estado === "validando") return { label: "Validando pago", cls: "seal seal-wait" };
  return { label: "Al aire", cls: "seal seal-ok" };
}

function selloPost(estado: Postulacion["estado"]) {
  if (estado === "elegido") return { label: "Te eligieron", cls: "seal seal-ok" };
  if (estado === "no-elegido") return { label: "No te tomaron", cls: "seal seal-bad" };
  return { label: "Esperando", cls: "seal seal-wait" };
}

function Bloque({
  titulo,
  extra,
  children,
}: {
  titulo: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{titulo}</h2>
        {extra}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function CuentaPanel() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [pegas, setPegas] = useState<Encargo[]>([]);
  const [perfil, setPerfil] = useState<Creador | undefined>();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [postuls, setPostuls] = useState<Postulacion[]>([]);
  const [chats, setChats] = useState<Postulacion[]>([]);
  const [nombresAviso, setNombresAviso] = useState<Record<string, string>>({});
  const [nombresCreador, setNombresCreador] = useState<Record<string, string>>({});
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [editError, setEditError] = useState("");

  async function reload() {
    const current = await usuarioActual();
    setUser(current);
    if (!current) return;
    const [avisos, oferta, reps, posts, chatsUser] = await Promise.all([
      pegasDe(current.id),
      perfilDe(current.id),
      reportesDe(current.id),
      postulacionesDe(current.id),
      chatsDe(current.id),
    ]);
    setPegas(avisos);
    setPerfil(oferta);
    setReportes(reps);
    setPostuls(posts);
    setChats(chatsUser);
    const idsAviso = [...new Set([...posts, ...chatsUser].map((p) => p.pegaId))];
    const idsCreador = [...new Set(chatsUser.map((c) => c.creadorId))];
    const [avisosExtra, creadoresExtra] = await Promise.all([
      Promise.all(idsAviso.map((id) => getEncargo(id))),
      Promise.all(idsCreador.map((id) => getCreador(id))),
    ]);
    setNombresAviso(
      Object.fromEntries(avisosExtra.filter(Boolean).map((a) => [a!.id, a!.marca])),
    );
    setNombresCreador(
      Object.fromEntries(
        creadoresExtra.filter(Boolean).map((c) => [c!.id, c!.nombre.split(" ")[0]]),
      ),
    );
    setNombre(current.nombre);
    setCorreo(current.correo);
    setWhatsapp(current.whatsapp);
  }

  useEffect(() => {
    reload();
  }, []);

  if (!user) return null;

  const esNegocio = user.roles.includes("marca");
  const esCreador = user.roles.includes("creador");
  const pendientes = pegas.filter(
    (p) => p.estado === "esperando-pago" || p.estado === "validando",
  );
  const cupo = cupoPostulaciones(user);
  const conPlan = planActivo(user);
  const planCaduco = planVencido(user);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Tu cuenta</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Hola, {user.nombre.split(" ")[0]}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {user.roles.map((r) => (
              <span key={r} className="chip">
                {r === "marca" ? "Negocio" : "Creador"}
              </span>
            ))}
            <span className="text-sm text-muted">
              {user.correo} · {user.whatsapp}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {esAdmin(user) ? (
            <Link href="/admin" className="btn btn-flash !px-3 !py-1.5 text-sm">
              Panel
            </Link>
          ) : null}
          <button
            type="button"
            className="btn btn-line !px-3 !py-1.5 text-sm"
            aria-expanded={editando}
            onClick={() => {
              setEditando((v) => !v);
              setEditError("");
              setNombre(user.nombre);
              setCorreo(user.correo);
              setWhatsapp(user.whatsapp);
            }}
          >
            {editando ? "Cerrar" : "Editar datos"}
          </button>
        </div>
      </div>

      {editando ? (
        <form
          className="glass mt-6 max-w-xl rounded-3xl p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setEditError("");
            try {
              await actualizarPerfil({ nombre, correo, whatsapp });
              setEditando(false);
              await reload();
            } catch (err) {
              setEditError(err instanceof Error ? err.message : "No se pudo guardar.");
            }
          }}
        >
          <p className="text-sm font-semibold">Tus datos</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm">Nombre</span>
              <input className="field" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm">Correo</span>
              <input
                className="field"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm">WhatsApp</span>
              <input
                className="field"
                inputMode="numeric"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </label>
          </div>
          {editError ? <p className="mt-3 text-sm text-bad">{editError}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="submit" className="btn btn-flash">
              Guardar
            </button>
            <button
              type="button"
              className="btn btn-line"
              onClick={() => {
                setEditando(false);
                setEditError("");
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {pendientes.length > 0 ? (
        <div className="notice mt-6">
          <p className="font-semibold">Tienes un aviso esperando</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            {pendientes[0].estado === "esperando-pago"
              ? "Falta el Yape o Plin para lanzarlo."
              : "Estamos validando tu pago."}
          </p>
          <Link
            href={
              pendientes[0].estado === "esperando-pago"
                ? `/pegas/${pendientes[0].id}/pagar`
                : `/pegas/${pendientes[0].id}`
            }
            className="btn btn-flash mt-3"
          >
            {pendientes[0].estado === "esperando-pago" ? "Ir a pagar" : "Ver aviso"}
          </Link>
        </div>
      ) : null}

      {esCreador ? (
        <div className="glass mt-6 rounded-3xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted">Plan creador</p>
              {conPlan && cupo.plan ? (
                <>
                  <p className="mt-2 text-lg font-semibold">
                    {cupo.plan.nombre} · {cupo.usadas}/{cupo.limite} este ciclo
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Te quedan {cupo.restantes} apuntadas
                    {user.planHasta
                      ? ` · vence el ${formatoFechaPlan(user.planHasta)}`
                      : ""}
                    .
                    {cupo.plan.precioMaxAviso
                      ? ` Avisos hasta S/ ${cupo.plan.precioMaxAviso} c/u.`
                      : " Sin tope de precio."}
                  </p>
                </>
              ) : planCaduco ? (
                <>
                  <p className="mt-2 text-lg font-semibold">Plan vencido</p>
                  <p className="mt-1 text-sm text-muted">
                    {user.planHasta
                      ? `Venció el ${formatoFechaPlan(user.planHasta)}. `
                      : ""}
                    Renueva para volver a apuntarte.
                  </p>
                </>
              ) : user.planEstado === "validando" ? (
                <p className="mt-2 text-lg font-semibold">Validando tu plan…</p>
              ) : user.planEstado === "esperando-pago" ? (
                <p className="mt-2 text-lg font-semibold">
                  Falta pagar el plan{" "}
                  {user.plan ? PLANES_CREADOR[user.plan].nombre : ""}
                </p>
              ) : (
                <p className="mt-2 text-lg font-semibold">Sin plan aún</p>
              )}
            </div>
            <Link href="/creadores/plan" className="btn btn-line !px-3 !py-1.5 text-sm">
              {conPlan ? "Ver plan" : planCaduco ? "Renovar plan" : "Elegir plan"}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {esNegocio ? (
          <Link href="/pegas/nueva" className="glass rounded-3xl p-5 transition-transform hover:-translate-y-0.5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Negocio</p>
            <p className="mt-2 text-lg font-semibold">Publicar un aviso</p>
            <p className="mt-1 text-sm text-muted">
              {solesFee(FEE_AVISO)} por publicación · Yape o Plin.
            </p>
          </Link>
        ) : (
          <button
            type="button"
            className="glass rounded-3xl p-5 text-left"
            onClick={() => {
              void sumarRol("marca").then(() => reload());
            }}
          >
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Negocio</p>
            <p className="mt-2 text-lg font-semibold">Quiero publicar</p>
            <p className="mt-1 text-sm text-muted">Suma este lado a tu cuenta.</p>
          </button>
        )}
        {esCreador ? (
          <Link href="/creadores/alta?edit=1" className="glass rounded-3xl p-5 transition-transform hover:-translate-y-0.5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Creador</p>
            <p className="mt-2 text-lg font-semibold">
              {perfil ? "Editar mi oferta" : "Completar mi oferta"}
            </p>
            <p className="mt-1 text-sm text-muted">Desde cuánto grabas y en qué redes.</p>
          </Link>
        ) : (
          <button
            type="button"
            className="glass rounded-3xl p-5 text-left"
            onClick={() => {
              void sumarRol("creador").then(() => reload());
            }}
          >
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Creador</p>
            <p className="mt-2 text-lg font-semibold">Quiero grabar</p>
            <p className="mt-1 text-sm text-muted">Suma este lado a tu cuenta.</p>
          </button>
        )}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-start">
        <div className="space-y-6">
          {esNegocio || pegas.length > 0 ? (
            <Bloque
              titulo="Tus avisos"
              extra={
                esNegocio ? (
                  <Link href="/pegas/nueva" className="text-sm underline underline-offset-4">
                    Nuevo
                  </Link>
                ) : null
              }
            >
              {pegas.length === 0 ? (
                <p className="text-sm text-muted">Todavía no publicaste.</p>
              ) : (
                <ul className="space-y-2">
                  {pegas.map((p) => {
                    const sello = selloAviso(p);
                    return (
                      <li key={p.id}>
                        <Link
                          href={p.estado === "esperando-pago" ? `/pegas/${p.id}/pagar` : `/pegas/${p.id}`}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3"
                        >
                          <span className="font-medium">{p.marca}</span>
                          <span className={sello.cls}>{sello.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Bloque>
          ) : null}

          {esCreador || postuls.length > 0 ? (
            <Bloque titulo="Te apuntaste">
              {postuls.length === 0 ? (
                <p className="text-sm text-muted">
                  Aún no te apuntaste a ningún aviso.{" "}
                  <Link href="/pegas" className="underline underline-offset-4">
                    Ver avisos
                  </Link>
                </p>
              ) : (
                <ul className="space-y-2">
                {postuls.map((p) => {
                  const sello = selloPost(p.estado);
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/pegas/${p.pegaId}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3"
                      >
                        <span className="font-medium">{nombresAviso[p.pegaId] || "Aviso"}</span>
                          <span className={sello.cls}>{sello.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Bloque>
          ) : null}

          {chats.length > 0 ? (
            <Bloque titulo="Chats">
              <ul className="space-y-2">
                {chats.map((c) => {
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/chats/${c.id}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3"
                      >
                        <span className="font-medium">{nombresAviso[c.pegaId]}</span>
                        <span className="text-sm text-muted">{nombresCreador[c.creadorId]}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Bloque>
          ) : null}
        </div>

        <div className="space-y-6">
          <Bloque titulo="Novedades">
            <div id="novedades">
              <ListaNotis compacto />
            </div>
          </Bloque>

          <Bloque
            titulo="Reportes"
            extra={
              <Link href="/reportar" className="text-sm underline underline-offset-4">
                Nuevo
              </Link>
            }
          >
            {reportes.length === 0 ? (
              <p className="text-sm text-muted">
                Aquí ves los casos que enviaste. Pon datos y qué pasó en la
                casilla de reportes.
              </p>
            ) : (
              <ul className="space-y-3">
                {reportes.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-line px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted">
                      {r.contraTipo === "pega" ? "Aviso" : "Creador"}
                      {r.contraNombre ? ` · ${r.contraNombre}` : ""}
                    </p>
                    <p className="mt-1 font-medium">
                      {MOTIVOS_REPORTE.find((m) => m.id === r.motivo)?.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted">{r.detalle}</p>
                    {r.contacto ? (
                      <p className="mt-1 text-sm text-muted">Contacto: {r.contacto}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Bloque>
        </div>
      </div>
    </div>
  );
}
