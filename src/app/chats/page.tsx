"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/AuthGate";
import { Shell } from "@/components/Shell";
import { usuarioActual } from "@/lib/auth";
import { chatsDe, getCreador, getEncargo } from "@/lib/store";
import type { Postulacion } from "@/lib/types";

function Lista() {
  const [items, setItems] = useState<Postulacion[]>([]);

  useEffect(() => {
    const user = usuarioActual();
    if (user) setItems(chatsDe(user.id));
  }, []);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        Todavía no hay chat. La marca elige a un postulante y se abre
        aquí.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((p) => {
        const pega = getEncargo(p.pegaId);
        const creador = getCreador(p.creadorId);
        return (
          <li key={p.id}>
            <Link href={`/chats/${p.id}`} className="glass block rounded-3xl p-5">
              <p className="font-medium">{pega?.marca}</p>
              <p className="mt-1 text-sm text-muted">{creador?.nombre}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function ChatsPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Chats</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Conversaciones
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        Solo se abre cuando la marca elige. Ahí se puede compartir el
        WhatsApp.
      </p>
      <div className="mt-8">
        <AuthGate>
          <Lista />
        </AuthGate>
      </div>
    </Shell>
  );
}
