import { Suspense } from "react";
import { ReportarForm } from "@/components/Reportar";
import { Shell } from "@/components/Shell";

export default function ReportarPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">
        Casilla de reportes
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Si alguien timó, dilo
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        Marca que no pagó. Creador que no entregó. Perfil falso. Con
        dos reportes el aviso o el perfil queda marcado.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted">Cargando…</p>}>
          <ReportarForm />
        </Suspense>
      </div>
    </Shell>
  );
}
