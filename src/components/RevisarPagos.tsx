"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { solesFee } from "@/lib/money";
import { avisosValidando, lanzarAviso } from "@/lib/store";
import type { Encargo } from "@/lib/types";

export function RevisarPagos() {
  const [items, setItems] = useState<Encargo[]>([]);

  async function reload() {
    setItems(await avisosValidando());
  }

  useEffect(() => {
    reload();
  }, []);

  if (items.length === 0) {
    return <p className="text-sm text-muted">No hay pagos por validar.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.id} className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            {item.pago?.metodo === "plin" ? "Plin" : "Yape"} ·{" "}
            {solesFee(item.pago?.monto ?? 0)}
          </p>
          <h2 className="mt-2 text-xl font-semibold">{item.marca}</h2>
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
              onClick={async () => {
                await lanzarAviso(item.id);
                await reload();
              }}
            >
              Ya vi el pago. Lanzar aviso
            </button>
            <Link href={`/pegas/${item.id}`} className="btn btn-line">
              Ver aviso
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
