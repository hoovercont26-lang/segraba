import { AuthGate } from "@/components/AuthGate";
import { CuentaPanel } from "@/components/CuentaPanel";
import { Shell } from "@/components/Shell";

export default function CuentaPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Tu cuenta</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Hola</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        Desde aquí publicas, ofreces el servicio o ves lo que reportaste.
      </p>
      <div className="mt-8">
        <AuthGate>
          <CuentaPanel />
        </AuthGate>
      </div>
    </Shell>
  );
}
