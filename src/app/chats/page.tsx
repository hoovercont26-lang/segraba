"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/AuthGate";
import { Shell } from "@/components/Shell";
import { usuarioActual } from "@/lib/auth";
import { chatsDe, getCreador, getEncargo } from "@/lib/store";

function Lista() {
  const [items, setItems] = useState<
    { id: string; marca: string; creador: string }[]
  >([]);

  useEffect(() => {
    usuarioActual().then(async (user) => {
      if (!user) return;
      const chats = await chatsDe(user.id);
      const rows = await Promise.all(
        chats.map(async (p) => {
          const [pega, creador] = await Promise.all([
            getEncargo(p.pegaId),
            getCreador(p.creadorId),
          ]);
          return {
            id: p.id,
            marca: pega?.marca || "Aviso",
            creador: creador?.nombre || "",
          };
        }),
      );
      setItems(rows);
    });
  }, []);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        Todavía no hay chat. El negocio elige a alguien y se abre
        aquí.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((p) => {
        return (
          <li key={p.id}>
            <Link href={`/chats/${p.id}`} className="glass block rounded-3xl p-5">
              <p className="font-medium">{p.marca}</p>
              <p className="mt-1 text-sm text-muted">{p.creador}</p>
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
        Solo se abre cuando el negocio elige. Ahí se puede pasar el
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
