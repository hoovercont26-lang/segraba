"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
    setAvisos(countReportes("pega", encargo.id));
    setFlag(marcado("pega", encargo.id));
  }, [encargo.id]);

  return (
    <Link
      href={`/pegas/${encargo.id}`}
      className={`glass group block rounded-3xl p-5 transition-transform hover:-translate-y-0.5 ${className}`}
    >
      <div className={`flex items-start justify-between gap-5 ${featured ? "lg:min-h-64 lg:flex-col lg:justify-between" : ""}`}>
        <div className="min-w-0">
          {flag ? (
            <p className="seal seal-bad">Con reportes · entra con cuidado</p>
          ) : (
            <p className="chip">
              {encargo.nicho} · {encargo.ciudad}
            </p>
          )}
          <h2 className={`mt-3 leading-tight ${featured ? "text-3xl font-semibold sm:text-4xl" : "text-xl font-semibold"}`}>
            {encargo.marca}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">{encargo.brief}</p>
          <p className="mt-4 text-sm text-muted">
            {encargo.videos} videos · {plazoLabel(encargo.plazo)}
            {avisos > 0 ? ` · ${avisos} reporte${avisos === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted">c/u</p>
          <p className={`price mt-1 ${featured ? "text-6xl" : "text-4xl"}`}>
            {soles(encargo.precio)}
          </p>
        </div>
      </div>
    </Link>
  );
}
