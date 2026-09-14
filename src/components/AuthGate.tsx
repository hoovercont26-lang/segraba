"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usuarioActual } from "@/lib/auth";
import type { Rol, Usuario } from "@/lib/types";

export function AuthGate({
  children,
  rol,
  next,
}: {
  children: React.ReactNode;
  rol?: Rol;
  next?: string;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<Usuario | null | undefined>(undefined);

  useEffect(() => {
    setUser(usuarioActual());
  }, [pathname]);

  if (user === undefined) {
    return <p className="text-muted">Cargando tu cuenta…</p>;
  }

  const dest = next || pathname;

  if (!user) {
    return (
      <div className="glass mx-auto max-w-md rounded-3xl p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Entra para seguir
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Para publicar o ofrecer el servicio necesitas una cuenta. Así
          sabemos a quién reportar si alguien timó.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/entrar?next=${encodeURIComponent(dest)}`}
            className="btn btn-flash"
          >
            Entrar
          </Link>
          <Link
            href={`/registro?next=${encodeURIComponent(dest)}${rol ? `&rol=${rol}` : ""}`}
            className="btn btn-line"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    );
  }

  if (rol && !user.roles.includes(rol)) {
    return (
      <div className="glass mx-auto max-w-md rounded-3xl p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Te falta este lado
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Tu cuenta está como {user.roles.join(" y ")}. Para esta acción
          entra a tu cuenta y suma el otro rol.
        </p>
        <Link href="/cuenta" className="btn btn-flash mt-6">
          Ir a mi cuenta
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
