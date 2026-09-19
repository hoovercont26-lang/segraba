import { AuthGate } from "@/components/AuthGate";
import { PlanCreadorPanel } from "@/components/PlanCreadorPanel";
import { Shell } from "@/components/Shell";

export default function PlanCreadorPage() {
  return (
    <Shell>
      <p className="text-xs font-bold uppercase tracking-wider text-flash">
        Creador · plan
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
        Elige cómo te apuntas
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        Base S/ 9.90 o Pro S/ 14.90 por 30 días. Cada ciclo incluye tus
        apuntadas y vence en la fecha que ves al activar. Cuando venza, renueva
        y paga de nuevo para seguir apuntándote. El pago del video sigue siendo
        entre tú y el negocio.
      </p>
      <div className="mt-8">
        <AuthGate rol="creador">
          <PlanCreadorPanel />
        </AuthGate>
      </div>
    </Shell>
  );
}
