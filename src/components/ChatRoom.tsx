"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getUsuario, usuarioActual } from "@/lib/auth";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import { mapMensaje } from "@/lib/supabase/map";
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
  const [sending, setSending] = useState(false);
  const [yo, setYo] = useState<Usuario | null>(null);
  const [marca, setMarca] = useState("");
  const [creadorNombre, setCreadorNombre] = useState("");
  const [nombres, setNombres] = useState<Record<string, string>>({});
  const [live, setLive] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const nombresRef = useRef(nombres);
  nombresRef.current = nombres;

  const mergeMsgs = useCallback((incoming: Mensaje[]) => {
    setMsgs((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      for (const m of incoming) byId.set(m.id, m);
      return [...byId.values()].sort((a, b) =>
        a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0,
      );
    });
  }, []);

  const ensureNombre = useCallback(async (userId: string) => {
    if (!userId || nombresRef.current[userId]) return;
    const u = await getUsuario(userId);
    if (!u) return;
    setNombres((prev) => ({
      ...prev,
      [userId]: u.nombre.split(" ")[0] || "Alguien",
    }));
  }, []);

  const refreshMsgs = useCallback(async () => {
    const lista = await listMensajes(id);
    mergeMsgs(lista);
    const missing = [
      ...new Set(lista.map((m) => m.deId).filter((uid) => !nombresRef.current[uid])),
    ];
    await Promise.all(missing.map((uid) => ensureNombre(uid)));
  }, [id, mergeMsgs, ensureNombre]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const current = await usuarioActual();
      const postulacion = await getPostulacion(id);
      if (
        !current ||
        !postulacion ||
        !(await puedeVerChat(current.id, postulacion))
      ) {
        if (!cancelled) {
          setDenied(true);
          setReady(true);
        }
        return;
      }
      const [lista, aviso, creador] = await Promise.all([
        listMensajes(id),
        getEncargo(postulacion.pegaId),
        getCreador(postulacion.creadorId),
      ]);
      if (cancelled) return;
      setDenied(false);
      setYo(current);
      setPost(postulacion);
      setMsgs(lista);
      setMarca(aviso?.marca || "");
      setCreadorNombre(creador?.nombre || "");
      const ids = [...new Set(lista.map((m) => m.deId))];
      const gente = await Promise.all(ids.map((uid) => getUsuario(uid)));
      setNombres(
        Object.fromEntries(
          gente
            .filter(Boolean)
            .map((u) => [u!.id, u!.nombre.split(" ")[0] || "Alguien"]),
        ),
      );
      setReady(true);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Tiempo real + polling de respaldo
  useEffect(() => {
    if (!ready || denied) return;

    let poll: ReturnType<typeof setInterval> | null = null;
    let supabase: ReturnType<typeof createClient> | null = null;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null =
      null;

    async function tick() {
      try {
        await refreshMsgs();
      } catch {
        /* ignore transient errors */
      }
    }

    if (supabaseConfigured()) {
      try {
        supabase = createClient();
        channel = supabase
          .channel(`chat-msgs:${id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "mensajes",
              filter: `chat_id=eq.${id}`,
            },
            (payload) => {
              const row = payload.new as Record<string, unknown>;
              const m = mapMensaje(row);
              mergeMsgs([m]);
              void ensureNombre(m.deId);
              setLive(true);
            },
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") setLive(true);
          });
      } catch {
        setLive(false);
      }
    }

    // Respaldo: si Realtime no está activo en el proyecto, igual se actualiza
    poll = setInterval(tick, 2500);

    function onVisible() {
      if (document.visibilityState === "visible") void tick();
    }
    function onFocus() {
      void tick();
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      if (poll) clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      if (supabase && channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [ready, denied, id, refreshMsgs, mergeMsgs, ensureNombre]);

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
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          Chat · {marca} · {creadorNombre}
        </p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            live
              ? "bg-ok-bg text-ok"
              : "bg-[var(--card-2)] text-muted"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              live ? "animate-pulse bg-ok" : "bg-muted"
            }`}
          />
          {live ? "En vivo" : "Actualizando…"}
        </span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
        Acuerden aquí
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Cuando se pongan de acuerdo, pueden pegar su WhatsApp en este
        chat. SeGraba no abre el número por ustedes.
      </p>

      <div className="mt-6 flex min-h-80 flex-col rounded-xl border border-line bg-card p-4">
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
            if (!yo || !texto.trim() || sending) return;
            const body = texto.trim();
            setTexto("");
            setSending(true);
            try {
              await enviarMensaje(post.id, yo.id, body);
              await refreshMsgs();
            } finally {
              setSending(false);
            }
          }}
        >
          <input
            className="field !mt-0"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe… si quieren, el WhatsApp"
            disabled={sending}
          />
          <button
            type="submit"
            className="btn btn-flash shrink-0"
            disabled={sending || !texto.trim()}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
