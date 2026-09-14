"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreadorCard } from "@/components/CreadorCard";
import { ReportLink } from "@/components/Reportar";
import { ENCARGOS } from "@/lib/data";
import { usuarioActual } from "@/lib/auth";
import { plazoLabel, soles } from "@/lib/match";
import { paquete } from "@/lib/money";
import {
  countReportes,
  elegirPostulacion,
  getCreador,
  getEncargo,
  getPostulacion,
  marcado,
  perfilDe,
  postular,
  postulacionesDePega,
} from "@/lib/store";
import type { Encargo, Postulacion, Usuario } from "@/lib/types";

export function EncargoDetail({ id }: { id: string }) {
  const seed = ENCARGOS.find((item) => item.id === id);
  const [encargo, setEncargo] = useState<Encargo | undefined>(seed);
  const [ready, setReady] = useState(Boolean(seed));
  const [user, setUser] = useState<Usuario | null>(null);
  const [posts, setPosts] = useState<Postulacion[]>([]);
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");
  const [flag, setFlag] = useState(false);
  const [avisos, setAvisos] = useState(0);

  function reload() {
    setEncargo(getEncargo(id));
    setUser(usuarioActual());
    setPosts(postulacionesDePega(id));
    setFlag(marcado("pega", id));
    setAvisos(countReportes("pega", id));
    setReady(true);
  }

  useEffect(() => {
    reload();
  }, [id]);

  if (!ready) {
    return <p className="px-5 py-10 text-muted">Cargando la pega…</p>;
  }

  if (!encargo) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-serif text-4xl">Esa pega no está.</h1>
        <Link href="/pegas" className="mt-6 inline-block underline underline-offset-4">
          Ver pega
        </Link>
      </div>
    );
  }

  const soyMarca = Boolean(user && encargo.autorId && user.id === encargo.autorId);
  const perfil = user ? perfilDe(user.id) : undefined;
  const miPost = user
    ? posts.find((p) => p.autorId === user.id)
    : undefined;
  const elegida = encargo.elegidoPostulacionId
    ? getPostulacion(encargo.elegidoPostulacionId)
    : posts.find((p) => p.estado === "elegido");
  const chatListo = Boolean(elegida);
  const puedoChatear =
    chatListo &&
    user &&
    (soyMarca || elegida?.autorId === user.id);

  function onPostular(e: React.FormEvent) {
    e.preventDefault();
    const current = usuarioActual();
    const oferta = current ? perfilDe(current.id) : undefined;
    if (!current || !oferta) return;
    try {
      postular({
        pegaId: id,
        creadorId: oferta.id,
        autorId: current.id,
        nota,
      });
      setNota("");
      setError("");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo postular.");
    }
  }

  return (
    <div>
      <div className="px-5 py-12">
        <div className="glass mx-auto max-w-5xl rounded-[2rem] p-6 sm:p-10">
          {flag ? (
            <p className="seal seal-bad">{avisos} reportes</p>
          ) : (
            <p className="chip">
              {encargo.nicho} · {encargo.ciudad} · {plazoLabel(encargo.plazo)}
            </p>
          )}
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {encargo.marca}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            {encargo.brief}
          </p>
          <div className="mt-8 flex flex-wrap items-end gap-8">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                Por video
              </p>
              <p className="price mt-1 text-6xl sm:text-7xl">
                {soles(encargo.precio)}
              </p>
            </div>
            <p className="text-sm text-muted">
              {encargo.videos} videos · {soles(paquete(encargo))} el paquete
              {posts.length > 0 ? ` · ${posts.length} postulaciones` : ""}
            </p>
          </div>

          {puedoChatear && elegida ? (
            <Link href={`/chats/${elegida.id}`} className="btn btn-flash mt-8 w-full sm:w-auto">
              Abrir el chat
            </Link>
          ) : null}

          {user?.roles.includes("marca") && !encargo.autorId ? (
            <p className="mt-8 text-sm leading-6 text-muted">
              Esta pega es de muestra. Publica la tuya para recibir
              postulaciones y abrir el chat.
            </p>
          ) : null}

          {!user ? (
            <Link
              href={`/entrar?next=${encodeURIComponent(`/pegas/${encargo.id}`)}`}
              className="btn btn-flash mt-8 w-full sm:w-auto"
            >
              Entra para postular
            </Link>
          ) : null}

          {user && !soyMarca && !perfil ? (
            <Link href="/creadores/alta" className="btn btn-line mt-8 w-full sm:w-auto">
              Completa tu oferta para postular
            </Link>
          ) : null}

          {user && perfil && !soyMarca && !miPost ? (
            <form onSubmit={onPostular} className="mt-8 max-w-xl space-y-3">
              <label className="block">
                <span className="text-sm">Nota para la marca (opcional)</span>
                <textarea
                  className="field min-h-24"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Puedo grabar el jueves en Barranco."
                />
              </label>
              {error ? <p className="text-sm text-bad">{error}</p> : null}
              <button type="submit" className="btn btn-flash w-full sm:w-auto">
                Postular a esta pega
              </button>
            </form>
          ) : null}

          {miPost && !puedoChatear ? (
            <p className="mt-8 text-sm text-muted">
              Ya postulaste. Si la marca te elige, aquí se abre el chat.
            </p>
          ) : null}

          <div className="mt-4">
            <ReportLink tipo="pega" id={encargo.id} />
          </div>
        </div>
      </div>

      {soyMarca ? (
        <div className="mx-auto max-w-5xl px-5 pb-12">
          <h2 className="text-3xl font-semibold tracking-tight">
            {posts.length} {posts.length === 1 ? "postulación" : "postulaciones"}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Elige a quién le queda. Recién ahí se abre el chat. Los
            números de WhatsApp se comparten en ese chat, si quieren.
          </p>
          <div className="mt-6 space-y-4">
            {posts.map((p) => {
              const creador = getCreador(p.creadorId);
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
                      onClick={() => {
                        elegirPostulacion(p.id);
                        reload();
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
              <p className="text-sm text-muted">Todavía nadie postuló.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
