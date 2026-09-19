"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RedChips } from "@/components/Fields";
import type { Encargo } from "@/lib/types";
import { plazoLabel, soles } from "@/lib/match";
import { countReportes, marcado } from "@/lib/store";

export function EncargoCard({
  encargo,
  featured = false,
  className = "",
}: {
  encargo: Encargo;
  featured?: boolean;
  className?: string;
}) {
  const [avisos, setAvisos] = useState(0);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    countReportes("pega", encargo.id).then(setAvisos);
    marcado("pega", encargo.id).then(setFlag);
  }, [encargo.id]);

  const initials = encargo.marca
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Link
      href={`/pegas/${encargo.id}`}
      className={`group block rounded-xl border border-line bg-card p-4 transition-transform hover:-translate-y-0.5 ${
        featured ? "glass-hot sm:p-5" : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--card-2)] text-xs font-bold text-ink">
            {initials || "SG"}
          </div>
          <div className="min-w-0">
            <h2
              className={`truncate font-bold leading-tight ${
                featured ? "font-display text-2xl sm:text-3xl" : "text-base"
              }`}
            >
              {encargo.marca}
            </h2>
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted">
              {encargo.ciudad} · {encargo.nicho}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan">
            Pago fijo
          </p>
          <p className={`price mt-0.5 ${featured ? "text-4xl sm:text-5xl" : "text-2xl"}`}>
            {soles(encargo.precio)}
          </p>
        </div>
      </div>

      {flag ? (
        <p className="seal seal-bad mt-3">Con reportes · entra con cuidado</p>
      ) : null}

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/90">
        {encargo.brief}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="chip !normal-case !tracking-normal">
          {encargo.videos} video{encargo.videos === 1 ? "" : "s"}
        </span>
        <span className="chip !normal-case !tracking-normal">
          {plazoLabel(encargo.plazo)}
        </span>
        <RedChips redes={encargo.redes} />
        {avisos > 0 ? (
          <span className="text-xs text-bad">
            {avisos} reporte{avisos === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <span className="text-xs text-muted">Ver pega completa</span>
        <span className="text-sm font-bold text-flash group-hover:underline">
          Abrir →
        </span>
      </div>
    </Link>
  );
}
