"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usuarioActual } from "@/lib/auth";
import { marcarLeida, marcarTodasLeidas, noLeidasDe, notisDe } from "@/lib/store";
import type { Notificacion } from "@/lib/types";

export function Campana() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [on, setOn] = useState(false);

  useEffect(() => {
    usuarioActual().then(async (user) => {
      setOn(Boolean(user));
      setCount(user ? (await noLeidasDe(user.id)).length : 0);
    });
  }, [pathname]);

  if (!on) return null;

  return (
    <Link href="/cuenta#novedades" className="relative hover:text-ink">
      Novedades
      {count > 0 ? (
        <span className="ml-1 inline-grid h-5 min-w-5 place-items-center rounded-full bg-flash px-1 text-[0.65rem] font-bold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function ListaNotis({ compacto = false }: { compacto?: boolean }) {
  const [items, setItems] = useState<Notificacion[]>([]);
  const [abierto, setAbierto] = useState(false);

  async function reload() {
    const user = await usuarioActual();
    setItems(user ? await notisDe(user.id) : []);
  }

  useEffect(() => {
    reload();
  }, []);

  if (items.length === 0) {
    return <p className="text-sm text-muted">Sin novedades por ahora.</p>;
  }

  const visibles = compacto && !abierto ? items.slice(0, 3) : items;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{items.length} aviso{items.length === 1 ? "" : "s"}</p>
        <button
          type="button"
          className="text-sm underline underline-offset-4"
          onClick={async () => {
            const user = await usuarioActual();
            if (user) await marcarTodasLeidas(user.id);
            await reload();
          }}
        >
          Marcar leídas
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {visibles.map((n) => (
          <li key={n.id}>
            <Link
              href={n.href}
              className={`block rounded-2xl border px-4 py-3 ${
                n.leida ? "border-line" : "border-flash/40 bg-flash/5"
              }`}
              onClick={() => {
                void marcarLeida(n.id);
              }}
            >
              <p className="font-medium">{n.titulo}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{n.cuerpo}</p>
            </Link>
          </li>
        ))}
      </ul>
      {compacto && items.length > 3 ? (
        <button
          type="button"
          className="mt-3 text-sm underline underline-offset-4"
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? "Ver menos" : `Ver las ${items.length - 3} más`}
        </button>
      ) : null}
    </div>
  );
}
