"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getUsuario, usuarioActual } from "@/lib/auth";
import {
  enviarMensaje,
  getCreador,
  getEncargo,
  getPostulacion,
  listMensajes,
  puedeVerChat,
} from "@/lib/store";
import type { Mensaje, Postulacion, Usuario } from "@/lib/types";

export function ChatRoom({ id }: { id: string }) {
  const [post, setPost] = useState<Postulacion | undefined>();
  const [msgs, setMsgs] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState(false);
  const [yo, setYo] = useState<Usuario | null>(null);
  const [marca, setMarca] = useState("");
  const [creadorNombre, setCreadorNombre] = useState("");
  const [nombres, setNombres] = useState<Record<string, string>>({});
  const end = useRef<HTMLDivElement>(null);

  async function reload() {
    const current = await usuarioActual();
    const postulacion = await getPostulacion(id);
    if (!current || !postulacion || !(await puedeVerChat(current.id, postulacion))) {
      setDenied(true);
      setReady(true);
      return;
    }
    setDenied(false);
    setYo(current);
    setPost(postulacion);
    const [lista, aviso, creador] = await Promise.all([
      listMensajes(id),
      getEncargo(postulacion.pegaId),
      getCreador(postulacion.creadorId),
    ]);
    setMsgs(lista);
    setMarca(aviso?.marca || "");
    setCreadorNombre(creador?.nombre || "");
    const ids = [...new Set(lista.map((m) => m.deId))];
    const gente = await Promise.all(ids.map((uid) => getUsuario(uid)));
    setNombres(
      Object.fromEntries(
        gente.filter(Boolean).map((u) => [u!.id, u!.nombre.split(" ")[0] || "Alguien"]),
      ),
    );
    setReady(true);
  }

  useEffect(() => {
    reload();
  }, [id]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  if (!ready) return <p className="text-muted">Cargando el chat…</p>;

  if (denied || !post) {
    return (
      <div className="glass max-w-lg rounded-3xl p-6">
        <h1 className="text-2xl font-semibold">Este chat aún no está</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          El negocio elige a un creador y recién ahí se abre. Si ya te
          eligieron, entra con esa cuenta.
        </p>
        <Link href="/pegas" className="btn btn-line mt-6">
          Ver avisos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">
        Chat · {marca} · {creadorNombre}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Acuerden aquí
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Cuando se pongan de acuerdo, pueden pegar su WhatsApp en este
        chat. SeGraba no abre el número por ustedes.
      </p>

      <div className="glass mt-6 flex min-h-80 flex-col rounded-3xl p-4">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {msgs.length === 0 ? (
            <p className="text-sm text-muted">
              Todavía no hay mensajes. Digan el día y cómo pagan.
            </p>
          ) : null}
          {msgs.map((m) => {
            const mio = m.deId === yo?.id;
            const nombre = nombres[m.deId] || "Alguien";
            return (
              <div key={m.id} className={mio ? "text-right" : "text-left"}>
                <p className="text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                  {mio ? "Tú" : nombre}
                </p>
                <p
                  className={`mt-1 inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-6 ${
                    mio ? "bg-flash text-flash-ink" : "bg-[var(--card-2)]"
                  }`}
                >
                  {m.texto}
                </p>
              </div>
            );
          })}
          <div ref={end} />
        </div>
        <form
          className="mt-4 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!yo || !texto.trim()) return;
            await enviarMensaje(post.id, yo.id, texto);
            setTexto("");
            await reload();
          }}
        >
          <input
            className="field !mt-0"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe… si quieren, el WhatsApp"
          />
          <button type="submit" className="btn btn-flash shrink-0">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
