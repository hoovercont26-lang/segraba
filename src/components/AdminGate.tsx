"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { esAdmin, usuarioActual } from "@/lib/auth";
import type { Usuario } from "@/lib/types";

function PaginaNoEsta() {
  return (
    <div className="mx-auto max-w-lg py-6">
      <h1 className="text-4xl font-semibold tracking-tight">Esa página no está</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Revisa el enlace o vuelve al inicio.
      </p>
      <Link href="/" className="btn btn-line mt-6">
        Ir al inicio
      </Link>
    </div>
  );
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<Usuario | null | undefined>(undefined);

  useEffect(() => {
    usuarioActual().then(setUser);
  }, [pathname]);

  if (user === undefined) {
    return <p className="text-muted">Cargando…</p>;
  }

  if (!user || !esAdmin(user)) {
    return <PaginaNoEsta />;
  }

  return <>{children}</>;
}
