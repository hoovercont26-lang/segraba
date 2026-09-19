"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listUsuarios } from "@/lib/auth";
import { soles } from "@/lib/match";
import { FEE_AVISO, PLANES_CREADOR, solesFee } from "@/lib/money";
import {
  activarPlan,
  avisosEsperandoPago,
  avisosValidando,
  cupoPostulaciones,
  lanzarAviso,
  listCreadores,
  listEncargos,
  planesValidando,
  postulacionesDePega,
} from "@/lib/store";
import type { Creador, Encargo, Usuario } from "@/lib/types";

type Tab = "pagos" | "usuarios" | "avisos";

function estadoAviso(item: Encargo) {
  if (item.estado === "esperando-pago") return "Falta pagar";
  if (item.estado === "validando") return "Validando pago";
  return "Al aire";
}

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>("pagos");
  const [users, setUsers] = useState<Usuario[]>([]);
  const [avisos, setAvisos] = useState<Encargo[]>([]);
  const [creadores, setCreadores] = useState<Creador[]>([]);
  const [validando, setValidando] = useState<Encargo[]>([]);
  const [pendientes, setPendientes] = useState<Encargo[]>([]);
  const [planes, setPlanes] = useState<Usuario[]>([]);
  const [apuntados, setApuntados] = useState<Record<string, number>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function reload() {
    const [usersDb, avisosDb, creadoresDb, validandoDb, pendientesDb, planesDb] =
      await Promise.all([
        listUsuarios(),
        listEncargos(),
        listCreadores(),
        avisosValidando(),
        avisosEsperandoPago(),
        planesValidando(),
      ]);
    setUsers(usersDb);
    setAvisos(avisosDb);
    setCreadores(creadoresDb.filter((c) => c.autorId));
    setValidando(validandoDb);
    setPendientes(pendientesDb);
    setPlanes(planesDb);
    const counts = await Promise.all(
      avisosDb.map(async (item) => [item.id, (await postulacionesDePega(item.id)).length] as const),
    );
    setApuntados(Object.fromEntries(counts));
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pagos", `Pagos (${validando.length + planes.length})`],
            ["usuarios", `Usuarios (${users.length})`],
            ["avisos", `Avisos (${avisos.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`btn ${tab === id ? "btn-flash" : "btn-line"}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "pagos" ? (
        <div className="mt-8 space-y-8">
          {error ? <p className="text-sm text-bad">{error}</p> : null}
          <section>
            <h2 className="text-2xl font-semibold">Habilitar publicación</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Si ya te llegó el Yape o Plin de {solesFee(FEE_AVISO)} (o el
              monto del aviso), lanza el aviso.
            </p>
            <div className="mt-4 space-y-4">
              {validando.length === 0 ? (
                <p className="text-sm text-muted">Nadie mandó constancia todavía.</p>
              ) : (
                validando.map((item) => (
                  <article key={item.id} className="glass rounded-3xl p-5">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted">
                      {item.pago?.metodo === "plin" ? "Plin" : "Yape"} ·{" "}
                      {solesFee(item.pago?.monto ?? FEE_AVISO)}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{item.marca}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{item.brief}</p>
                    {item.pago?.constancia ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.pago.constancia}
                        alt="Constancia"
                        className="mt-4 max-h-64 rounded-2xl border border-line"
                      />
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="btn btn-flash"
                        disabled={busyId === item.id}
                        onClick={async () => {
                          setError("");
                          setBusyId(item.id);
                          try {
                            await lanzarAviso(item.id);
                            await reload();
                          } catch (err) {
                            setError(
                              err instanceof Error
                                ? err.message
                                : "No se pudo lanzar el aviso.",
                            );
                          } finally {
                            setBusyId(null);
                          }
                        }}
                      >
                        {busyId === item.id
                          ? "Activando…"
                          : "Ya vi el pago. Lanzar aviso"}
                      </button>
                      <Link href={`/pegas/${item.id}`} className="btn btn-line">
                        Ver aviso
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Planes de creador</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Activa el plan cuando veas el Yape o Plin. Eso deja el plan
              activo 30 días y reinicia las apuntadas del ciclo.
            </p>
            <div className="mt-4 space-y-4">
              {planes.length === 0 ? (
                <p className="text-sm text-muted">Ningún plan por validar.</p>
              ) : (
                planes.map((u) => {
                  const plan = u.plan ? PLANES_CREADOR[u.plan] : null;
                  return (
                    <article key={u.id} className="glass rounded-3xl p-5">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted">
                        {u.planPago?.metodo === "plin" ? "Plin" : "Yape"} ·{" "}
                        {solesFee(u.planPago?.monto ?? plan?.precio ?? 0)} ·{" "}
                        Plan {plan?.nombre}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">{u.nombre}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {u.correo} · {u.whatsapp}
                      </p>
                      {u.planPago?.constancia ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.planPago.constancia}
                          alt="Constancia plan"
                          className="mt-4 max-h-64 rounded-2xl border border-line"
                        />
                      ) : null}
                      <button
                        type="button"
                        className="btn btn-flash mt-4"
                        disabled={busyId === u.id}
                        onClick={async () => {
                          setError("");
                          setBusyId(u.id);
                          try {
                            await activarPlan(u.id);
                            await reload();
                          } catch (err) {
                            setError(
                              err instanceof Error
                                ? err.message
                                : "No se pudo activar el plan.",
                            );
                          } finally {
                            setBusyId(null);
                          }
                        }}
                      >
                        {busyId === u.id
                          ? "Activando…"
                          : "Ya vi el pago. Activar plan"}
                      </button>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Armaron el aviso, aún no pagan</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {pendientes.length === 0 ? (
                <li className="text-muted">Ninguno en espera de pago.</li>
              ) : (
                pendientes.map((item) => (
                  <li key={item.id}>
                    <Link href={`/pegas/${item.id}`} className="underline underline-offset-4">
                      {item.marca} · falta {solesFee(item.pago?.monto ?? FEE_AVISO)}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      ) : null}

      {tab === "usuarios" ? (
        <div className="mt-8 space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-muted">Todavía no hay cuentas.</p>
          ) : (
            users.map((u) => (
              <article key={u.id} className="glass rounded-3xl p-5">
                <h3 className="text-lg font-semibold">{u.nombre}</h3>
                <p className="mt-1 text-sm text-muted">
                  {u.correo} · {u.whatsapp}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {u.roles.map((r) => (r === "marca" ? "Negocio" : "Creador")).join(" · ")}
                  {creadores.some((c) => c.autorId === u.id)
                    ? ` · perfil @${creadores.find((c) => c.autorId === u.id)?.tiktok}`
                    : ""}
                  {u.plan && u.planEstado === "activo"
                    ? ` · plan ${PLANES_CREADOR[u.plan].nombre} ${cupoPostulaciones(u).usadas}/${cupoPostulaciones(u).limite}`
                    : u.planEstado && u.planEstado !== "ninguno"
                      ? ` · plan ${u.planEstado}`
                      : ""}
                </p>
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === "avisos" ? (
        <div className="mt-8 space-y-3">
          {avisos.map((item) => (
            <article key={item.id} className="glass rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted">
                {estadoAviso(item)} · {item.nicho} · {item.ciudad}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{item.marca}</h3>
              <p className="mt-1 text-sm text-muted">
                {item.videos} videos · {soles(item.precio)} c/u
                {item.autorId ? "" : " · muestra"}
                {` · ${apuntados[item.id] ?? 0} apuntados`}
              </p>
              <Link href={`/pegas/${item.id}`} className="mt-3 inline-block text-sm underline underline-offset-4">
                Abrir
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
