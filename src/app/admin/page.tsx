import { AdminGate } from "@/components/AdminGate";
import { AdminPanel } from "@/components/AdminPanel";
import { Shell } from "@/components/Shell";

export default function AdminPage() {
  return (
    <Shell>
      <AdminGate>
        <p className="text-xs uppercase tracking-[0.16em] text-muted">
          SeGraba
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Panel
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          Usuarios, pagos y habilitar avisos cuando ya viste el Yape.
        </p>
        <div className="mt-8">
          <AdminPanel />
        </div>
      </AdminGate>
    </Shell>
  );
}
