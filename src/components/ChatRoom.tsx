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
import type { Mensaje, Postulacion } from "@/lib/types";

export function ChatRoom({ id }: { id: string }) {
  const [post, setPost] = useState<Postulacion | undefined>();
  const [msgs, setMsgs] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  function reload() {
    const current = usuarioActual();
    const postulacion = getPostulacion(id);
    if (!current || !postulacion || !puedeVerChat(current.id, postulacion)) {
      setDenied(true);
      setReady(true);
      return;
    }
    setDenied(false);
    setPost(postulacion);
    setMsgs(listMensajes(id));
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
          La marca elige a un creador y recién ahí se abre. Si ya te
          eligieron, entra con esa cuenta.
        </p>
        <Link href="/pegas" className="btn btn-line mt-6">
          Ver pega
        </Link>
      </div>
    );
  }

  const pega = getEncargo(post.pegaId);
  const creador = getCreador(post.creadorId);
  const yo = usuarioActual();

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">
        Chat · {pega?.marca} · {creador?.nombre}
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
            const nombre = getUsuario(m.deId)?.nombre.split(" ")[0] || "Alguien";
            return (
              <div key={m.id} className={mio ? "text-right" : "text-left"}>
                <p className="text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                  {mio ? "Tú" : nombre}
                </p>
                <p
                  className={`mt-1 inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-6 ${
                    mio ? "bg-ink text-bg" : "bg-ink/5"
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
          onSubmit={(e) => {
            e.preventDefault();
            if (!yo || !texto.trim()) return;
            enviarMensaje(post.id, yo.id, texto);
            setTexto("");
            setMsgs(listMensajes(post.id));
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
