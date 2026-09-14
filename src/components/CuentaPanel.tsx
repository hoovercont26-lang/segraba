"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sumarRol, usuarioActual } from "@/lib/auth";
import { chatsDe, pegasDe, perfilDe, postulacionesDe, reportesDe } from "@/lib/store";
import type { Encargo, Creador, Postulacion, Reporte, Usuario } from "@/lib/types";
import { MOTIVOS_REPORTE } from "@/lib/types";

export function CuentaPanel() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [pegas, setPegas] = useState<Encargo[]>([]);
  const [perfil, setPerfil] = useState<Creador | undefined>();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [postuls, setPostuls] = useState<Postulacion[]>([]);
  const [chats, setChats] = useState<Postulacion[]>([]);

  function reload() {
    const current = usuarioActual();
    setUser(current);
    if (!current) return;
    setPegas(pegasDe(current.id));
    setPerfil(perfilDe(current.id));
    setReportes(reportesDe(current.id));
    setPostuls(postulacionesDe(current.id));
    setChats(chatsDe(current.id));
  }

  useEffect(() => {
    reload();
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="glass rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          {user.roles.join(" · ")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold">{user.nombre}</h2>
        <p className="mt-1 text-sm text-muted">
          {user.correo} · {user.whatsapp}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {!user.roles.includes("marca") ? (
            <button
              type="button"
              className="btn btn-line"
              onClick={() => {
                sumarRol("marca");
                reload();
              }}
            >
              También quiero publicar
            </button>
          ) : (
            <Link href="/pegas/nueva" className="btn btn-flash">
              Publicar pega
            </Link>
          )}
          {!user.roles.includes("creador") ? (
            <button
              type="button"
              className="btn btn-line"
              onClick={() => {
                sumarRol("creador");
                reload();
              }}
            >
              También quiero grabar
            </button>
          ) : (
            <Link href="/creadores/alta" className="btn btn-line">
              {perfil ? "Editar mi oferta" : "Ofrecer el servicio"}
            </Link>
          )}
        </div>
      </div>

      {chats.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold">Chats abiertos</h3>
          <ul className="mt-3 space-y-2">
            {chats.map((c) => (
              <li key={c.id}>
                <Link href={`/chats/${c.id}`} className="underline underline-offset-4">
                  Chat de una pega
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {postuls.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold">Tus postulaciones</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {postuls.map((p) => (
              <li key={p.id}>
                <Link href={`/pegas/${p.pegaId}`} className="underline underline-offset-4">
                  {p.estado}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pegas.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold">Tus avisos</h3>
          <ul className="mt-3 space-y-2">
            {pegas.map((p) => (
              <li key={p.id}>
                <Link href={`/pegas/${p.id}`} className="underline underline-offset-4">
                  {p.marca} · {p.nicho}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="text-lg font-semibold">Tus reportes</h3>
        {reportes.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Todavía no reportaste a nadie.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {reportes.map((r) => (
              <li key={r.id} className="text-muted">
                {MOTIVOS_REPORTE.find((m) => m.id === r.motivo)?.label} · {r.contraTipo}{" "}
                {r.contraId}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
