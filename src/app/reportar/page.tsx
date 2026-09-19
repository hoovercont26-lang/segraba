import { Suspense } from "react";
import Link from "next/link";
import { ReportarForm } from "@/components/Reportar";
import { Shell } from "@/components/Shell";

export default function ReportarPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">
        Sección de reportes
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Reporta un caso
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        Pon los datos de la otra parte y qué pasó: no pagó, no entregó,
        perfil falso o abuso. Con dos reportes el aviso o el perfil queda
        marcado. Los creadores Free no pueden reportar avisos (tampoco
        pueden postular).
      </p>
      <p className="mt-2 text-sm text-muted">
        ¿Ya enviaste alguno?{" "}
        <Link href="/cuenta" className="underline underline-offset-4">
          Míralos en tu cuenta
        </Link>
        .
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted">Cargando…</p>}>
          <ReportarForm />
        </Suspense>
      </div>
    </Shell>
  );
}
