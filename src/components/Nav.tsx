"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cerrarSesion, usuarioActual } from "@/lib/auth";
import type { Usuario } from "@/lib/types";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    setUser(usuarioActual());
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <span className="rec-dot" aria-hidden />
          SeGraba
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm text-muted">
          <Link href="/pegas" className="hover:text-ink">
            Hay pega
          </Link>
          <Link href="/como-funciona" className="hidden hover:text-ink sm:inline">
            Cómo funciona
          </Link>
          {user ? (
            <>
              <Link href="/chats" className="hover:text-ink">
                Chats
              </Link>
              <Link href="/cuenta" className="hover:text-ink">
                {user.nombre.split(" ")[0]}
              </Link>
              <button
                type="button"
                className="hover:text-ink"
                onClick={() => {
                  cerrarSesion();
                  setUser(null);
                  router.push("/");
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <Link href="/entrar" className="hover:text-ink">
              Entrar
            </Link>
          )}
          <Link href="/pegas/nueva" className="btn btn-flash !px-3 !py-1.5 text-sm">
            Publicar
          </Link>
        </nav>
      </div>
    </header>
  );
}
