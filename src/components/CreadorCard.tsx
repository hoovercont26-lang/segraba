"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Creador } from "@/lib/types";
import { miles, soles } from "@/lib/match";
import { countReportes, marcado } from "@/lib/store";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function CreadorCard({ creador }: { creador: Creador }) {
  const [flag, setFlag] = useState(false);
  const [avisos, setAvisos] = useState(0);

  useEffect(() => {
    setFlag(marcado("creador", creador.id));
    setAvisos(countReportes("creador", creador.id));
  }, [creador.id]);

  return (
    <article className="glass rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink/10 text-sm font-semibold">
            {initials(creador.nombre)}
          </span>
          <div>
            <h3 className="font-medium">{creador.nombre}</h3>
            <p className="text-sm text-muted">
              @{creador.tiktok} · {miles(creador.seguidores)} seg.
            </p>
            {flag ? (
              <p className="seal seal-bad mt-2">Con reportes</p>
            ) : creador.entregas > 0 ? (
              <p className="seal seal-ok mt-2">Ya grabó {creador.entregas}</p>
            ) : (
              <p className="mt-2 text-[0.7rem] uppercase tracking-[0.12em] text-muted">
                Primera pega
              </p>
            )}
          </div>
        </div>
        <p className="shrink-0 text-sm font-medium text-flash">
          Desde {soles(creador.minPrecio)}
        </p>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{creador.estilo}</p>
      <p className="mt-3 text-[0.7rem] uppercase tracking-[0.12em] text-muted">
        {creador.ciudad}
        {" · "}
        {creador.nichos.join(" · ")}
        {avisos > 0 ? ` · ${avisos} reportes` : ""}
      </p>
      <div className="mt-3">
        <Link
          href={`/reportar?tipo=creador&id=${creador.id}`}
          className="text-sm text-muted underline underline-offset-4"
        >
          Reportar
        </Link>
      </div>
    </article>
  );
}
