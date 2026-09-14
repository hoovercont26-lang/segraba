import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Shell } from "@/components/Shell";

export default function EntrarPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Cuenta</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Entrar</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        En esta prueba la cuenta vive en tu navegador. Luego la
        pasamos a un servidor.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted">Cargando…</p>}>
          <AuthForm mode="entrar" />
        </Suspense>
      </div>
    </Shell>
  );
}
