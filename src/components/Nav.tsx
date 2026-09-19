"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Campana } from "@/components/Bandeja";
import { esAdmin, cerrarSesion, usuarioActual } from "@/lib/auth";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import type { Usuario } from "@/lib/types";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    function sync() {
      usuarioActual().then(setUser);
    }
    sync();
    window.addEventListener("segraba-sesion", sync);
    window.addEventListener("focus", sync);
    let unsubscribe = () => {};
    if (supabaseConfigured()) {
      const { data } = createClient().auth.onAuthStateChange(() => sync());
      unsubscribe = () => data.subscription.unsubscribe();
    }
    return () => {
      unsubscribe();
      window.removeEventListener("segraba-sesion", sync);
      window.removeEventListener("focus", sync);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5 lg:h-[4.25rem] lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <Image
            src="/brand/logo.png"
            alt="SeGraba"
            width={140}
            height={36}
            className="h-8 w-auto lg:h-9"
            priority
          />
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm text-muted sm:gap-x-4 lg:flex-nowrap lg:gap-x-5">
          <Link href="/pegas" className="hidden hover:text-ink sm:inline">
            Avisos
          </Link>
          <Link href="/como-funciona" className="hidden hover:text-ink md:inline">
            Cómo funciona
          </Link>
          <Link href="/creadores/plan" className="hidden hover:text-ink lg:inline">
            Planes
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full bg-card-2/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan lg:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
            Lima, PE
          </span>
          {user ? (
            <>
              {esAdmin(user) ? (
                <Link href="/admin" className="btn btn-flash !min-h-0 !px-3 !py-1.5 text-sm">
                  Panel
                </Link>
              ) : null}
              <Campana />
              <Link href="/chats" className="hidden hover:text-ink sm:inline">
                Chats
              </Link>
              <Link href="/cuenta" className="font-semibold text-ink hover:text-flash">
                {user.nombre.split(" ")[0]}
              </Link>
              <button
                type="button"
                className="hidden hover:text-ink sm:inline"
                onClick={async () => {
                  await cerrarSesion();
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
          <Link
            href="/pegas/nueva"
            className="btn btn-flash !min-h-0 !px-3 !py-1.5 text-sm"
          >
            Publicar
          </Link>
        </nav>
      </div>
    </header>
  );
}
