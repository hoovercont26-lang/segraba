"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreadorCard } from "@/components/CreadorCard";
import { RedChips } from "@/components/Fields";
import { ReportLink } from "@/components/Reportar";
import { ENCARGOS } from "@/lib/data";
import { usuarioActual } from "@/lib/auth";
import { plazoLabel, soles } from "@/lib/match";
import { formatoFechaPlan } from "@/lib/money";
import { avisoPublico, paquete } from "@/lib/money";
import {
  countReportes,
  elegirPostulacion,
  estadoApuntarse,
  getCreador,
  getEncargo,
  getPostulacion,
  marcado,
  perfilDe,
  postular,
  postulacionesDePega,
} from "@/lib/store";
import type { Creador, Encargo, Postulacion, Usuario } from "@/lib/types";

export function EncargoDetail({ id }: { id: string }) {
  const seed = ENCARGOS.find((item) => item.id === id);
  const [encargo, setEncargo] = useState<Encargo | undefined>(seed);
  const [ready, setReady] = useState(Boolean(seed));
  const [user, setUser] = useState<Usuario | null>(null);
  const [posts, setPosts] = useState<Postulacion[]>([]);
  const [perfil, setPerfil] = useState<Creador | undefined>();
  const [elegida, setElegida] = useState<Postulacion | undefined>();
  const [creadores, setCreadores] = useState<Record<string, Creador>>({});
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");
  const [flag, setFlag] = useState(false);
  const [avisos, setAvisos] = useState(0);

  async function reload() {
    const [item, current, lista, hayFlag, total] = await Promise.all([
      getEncargo(id),
      usuarioActual(),
      postulacionesDePega(id),
      marcado("pega", id),
      countReportes("pega", id),
    ]);
    setEncargo(item);
    setUser(current);
    setPosts(lista);
    setFlag(hayFlag);
    setAvisos(total);
    setPerfil(current ? await perfilDe(current.id) : undefined);
    const chosen = item?.elegidoPostulacionId
      ? await getPostulacion(item.elegidoPostulacionId)
      : lista.find((p) => p.estado === "elegido");
    setElegida(chosen);
    const loaded = await Promise.all(lista.map((p) => getCreador(p.creadorId)));
    setCreadores(
      Object.fromEntries(loaded.filter(Boolean).map((c) => [c!.id, c!])),
    );
    setReady(true);
  }

  useEffect(() => {
    reload();
  }, [id]);

  if (!ready) {
        return <p className="px-5 py-10 text-muted">Cargando el aviso…</p>;
  }

  if (!encargo) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-4xl font-bold">Ese aviso no está.</h1>
        <Link href="/pegas" className="mt-6 inline-block underline underline-offset-4">
          Ver avisos
        </Link>
      </div>
    );
  }

  const soyMarca = Boolean(user && encargo.autorId && user.id === encargo.autorId);
  const alAire = avisoPublico(encargo);

  if (!alAire && !soyMarca) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">Ese aviso aún no está al aire</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          El negocio todavía está pagando o estamos validando el Yape.
        </p>
        <Link href="/pegas" className="btn btn-line mt-6">
          Ver avisos
        </Link>
      </div>
    );
  }
  const miPost = user
    ? posts.find((p) => p.autorId === user.id)
    : undefined;
  const chatListo = Boolean(elegida);
  const puedoChatear =
    chatListo &&
    user &&
    (soyMarca || elegida?.autorId === user.id);
  const apuntarse = encargo ? estadoApuntarse(user, perfil, encargo) : null;

  async function onPostular(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const current = await usuarioActual();
    const oferta = current ? await perfilDe(current.id) : undefined;
    if (!current || !oferta || !encargo) return;
    const check = estadoApuntarse(current, oferta, encargo);
    if (check.paso !== "ok") {
      setError(
        check.paso === "plan"
          ? "Necesitas un plan activo. Elige Base o Pro y paga para apuntarte."
          : check.paso === "perfil"
            ? "Completa tu oferta de creador antes de apuntarte."
            : check.paso === "bloqueado"
              ? check.motivo
              : "Entra con tu cuenta de creador para apuntarte.",
      );
      return;
    }
    try {
      await postular({
        pegaId: id,
        creadorId: oferta.id,
        autorId: current.id,
        nota,
      });
      setNota("");
      setError("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo anotar.");
    }
  }

  return (
    <div>
      <div className="px-5 py-10 sm:py-12">
        <div className="glass glass-hot mx-auto max-w-5xl p-5 sm:p-8">
          {flag ? (
            <p className="seal seal-bad">{avisos} reportes</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <p className="chip">
                {encargo.nicho} · {encargo.ciudad} · {plazoLabel(encargo.plazo)}
              </p>
              <RedChips redes={encargo.redes} />
            </div>
          )}
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {encargo.marca}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            {encargo.brief}
          </p>
          {encargo.estado === "esperando-pago" && soyMarca ? (
            <div className="notice mt-6">
              <p className="font-semibold">Falta el pago de esta publicación</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Yapea o plinea y manda la constancia para que podamos
                validar y lanzar el aviso.
              </p>
              <Link href={`/pegas/${encargo.id}/pagar`} className="btn btn-flash mt-4">
                Ir a pagar
              </Link>
            </div>
          ) : null}

          {encargo.estado === "validando" && soyMarca ? (
            <div className="notice mt-6">
              <p className="seal seal-wait">Validando pago</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Recibimos tu constancia. En cuanto confirmemos el Yape o
                Plin, este aviso se lanza y te avisamos en Novedades.
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-end gap-8">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-cyan">
                Pago fijo · por video
              </p>
              <p className="price mt-1 text-6xl sm:text-7xl">
                {soles(encargo.precio)}
              </p>
            </div>
            <p className="text-sm text-muted">
              {encargo.videos} videos · {soles(paquete(encargo))} el paquete
              {posts.length > 0 ? ` · ${posts.length} ${posts.length === 1 ? "persona apuntada" : "personas apuntadas"}` : ""}
            </p>
          </div>

          {puedoChatear && elegida ? (
            <Link href={`/chats/${elegida.id}`} className="btn btn-flash mt-8 w-full sm:w-auto">
              Abrir el chat
            </Link>
          ) : null}

          {user?.roles.includes("marca") && !encargo.autorId ? (
            <p className="mt-8 text-sm leading-6 text-muted">
              Este aviso es de muestra. Publica el tuyo para recibir
              gente apuntada y abrir el chat.
            </p>
          ) : null}

          {alAire && !soyMarca && !miPost && apuntarse?.paso === "entrar" ? (
            <Link
              href={`/entrar?next=${encodeURIComponent(`/pegas/${encargo.id}`)}`}
              className="btn btn-flash mt-8 w-full sm:w-auto"
            >
              Entra para apuntarte
            </Link>
          ) : null}

          {alAire && !soyMarca && !miPost && apuntarse?.paso === "rol-creador" ? (
            <div className="notice mt-8 max-w-xl">
              <p className="font-semibold">Activa el lado creador</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Tu cuenta es de negocio. Suma el perfil de creador para
                apuntarte a avisos.
              </p>
              <Link href="/cuenta" className="btn btn-flash mt-4">
                Ir a mi cuenta
              </Link>
            </div>
          ) : null}

          {alAire && !soyMarca && !miPost && apuntarse?.paso === "perfil" ? (
            <Link
              href={`/creadores/alta?next=${encodeURIComponent(`/pegas/${encargo.id}`)}`}
              className="btn btn-flash mt-8 w-full sm:w-auto"
            >
              Completa tu oferta para apuntarte
            </Link>
          ) : null}

          {alAire && !soyMarca && !miPost && apuntarse?.paso === "plan" ? (
            <div className="notice mt-8 max-w-xl">
              <p className="font-semibold">
                {apuntarse.planEstado === "vencido"
                  ? "Tu plan venció"
                  : apuntarse.planEstado === "esperando-pago"
                    ? "Falta pagar tu plan"
                    : apuntarse.planEstado === "validando"
                      ? "Estamos validando tu plan"
                      : "Necesitas un plan para apuntarte"}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {apuntarse.planEstado === "vencido" && apuntarse.vencioEl
                  ? `Venció el ${formatoFechaPlan(apuntarse.vencioEl)}. Renueva Base o Pro (30 días) para volver a apuntarte.`
                  : apuntarse.planEstado === "validando"
                    ? "En cuanto confirmemos tu Yape o Plin, podrás apuntarte a avisos."
                    : "Base: 8 apuntadas por ciclo, hasta S/ 400 c/u. Pro: 25 apuntadas y sin tope de precio. Cada ciclo dura 30 días."}
              </p>
              {apuntarse.planEstado !== "validando" ? (
                <Link href="/creadores/plan" className="btn btn-flash mt-4">
                  {apuntarse.planEstado === "vencido"
                    ? "Renovar plan"
                    : apuntarse.planEstado === "esperando-pago"
                      ? "Pagar mi plan"
                      : "Elegir y pagar plan"}
                </Link>
              ) : (
                <Link href="/creadores/plan" className="btn btn-line mt-4">
                  Ver estado del plan
                </Link>
              )}
            </div>
          ) : null}

          {alAire && !soyMarca && !miPost && apuntarse?.paso === "bloqueado" ? (
            <div className="notice mt-8 max-w-xl">
              <p className="font-semibold">No puedes apuntarte a este aviso</p>
              <p className="mt-1 text-sm leading-6 text-muted">{apuntarse.motivo}</p>
              {apuntarse.cupo ? (
                <p className="mt-2 text-sm text-muted">
                  Apuntadas: {apuntarse.cupo.usadas}/{apuntarse.cupo.limite} este ciclo.
                </p>
              ) : null}
              <Link href="/creadores/plan" className="btn btn-line mt-4">
                Ver planes
              </Link>
            </div>
          ) : null}

          {alAire && !soyMarca && !miPost && apuntarse?.paso === "ok" ? (
            <form onSubmit={onPostular} className="mt-8 max-w-xl space-y-3">
              <p className="text-sm text-muted">
                Apuntadas este ciclo: {apuntarse.cupo.usadas}/{apuntarse.cupo.limite} · te quedan{" "}
                {apuntarse.cupo.restantes}
                {apuntarse.cupo.diasRestantes > 0
                  ? ` · plan vence en ${apuntarse.cupo.diasRestantes} día${apuntarse.cupo.diasRestantes === 1 ? "" : "s"}`
                  : ""}
              </p>
              <label className="block">
                <span className="text-sm">Nota para el negocio (opcional)</span>
                <textarea
                  className="field min-h-24"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Puedo grabar el jueves en Barranco."
                />
              </label>
              {error ? <p className="text-sm text-bad">{error}</p> : null}
              <button type="submit" className="btn btn-flash w-full sm:w-auto">
                Quiero grabar esto
              </button>
            </form>
          ) : null}

          {miPost && !puedoChatear ? (
            <p className="mt-8 text-sm text-muted">
              Ya te apuntaste. Si el negocio te elige, aquí se abre el chat.
            </p>
          ) : null}

          <div className="mt-4">
            <ReportLink tipo="pega" id={encargo.id} />
          </div>
        </div>
      </div>

      {soyMarca ? (
        <div className="mx-auto max-w-5xl px-5 pb-12">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            {posts.length} {posts.length === 1 ? "persona apuntada" : "personas apuntadas"}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Elige a quién le queda. Recién ahí se abre el chat. Los
            números de WhatsApp se pasan en ese chat, si quieren.
          </p>
          <div className="mt-6 space-y-4">
            {posts.map((p) => {
              const creador = creadores[p.creadorId];
              if (!creador) return null;
              return (
                <div key={p.id} className="space-y-3">
                  <CreadorCard creador={creador} />
                  {p.nota ? (
                    <p className="px-1 text-sm leading-6 text-muted">“{p.nota}”</p>
                  ) : null}
                  {p.estado === "elegido" ? (
                    <Link href={`/chats/${p.id}`} className="btn btn-flash">
                      Chat con {creador.nombre.split(" ")[0]}
                    </Link>
                  ) : p.estado === "pendiente" && !elegida ? (
                    <button
                      type="button"
                      className="btn btn-ink"
                      onClick={async () => {
                        await elegirPostulacion(p.id);
                        await reload();
                      }}
                    >
                      Elegir a {creador.nombre.split(" ")[0]}
                    </button>
                  ) : p.estado === "no-elegido" ? (
                    <p className="text-sm text-muted">No elegido</p>
                  ) : null}
                </div>
              );
            })}
            {posts.length === 0 ? (
              <p className="text-sm text-muted">Todavía nadie se apuntó.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
