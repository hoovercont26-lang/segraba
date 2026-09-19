import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Shell } from "@/components/Shell";

export default function RegistroPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Cuenta</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Crear cuenta
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        Elige si publicas un aviso o si grabas videos. Después puedes
        hacer las dos cosas.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted">Cargando…</p>}>
          <AuthForm mode="registro" />
        </Suspense>
      </div>
    </Shell>
  );
}
