import { REGLAS_PAGO } from "@/lib/money";

export function PagoAviso({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="notice text-sm leading-6">
        SeGraba no guarda el Yape. Acuerden el pago por WhatsApp y
        reporten si alguien timó.
      </p>
    );
  }

  return (
    <aside className="notice">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-warn">
        El Yape no pasa por nosotros
      </p>
      <ul className="mt-3 space-y-2">
        {REGLAS_PAGO.map((regla) => (
          <li key={regla} className="flex gap-2 text-sm leading-6">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warn" />
            <span>{regla}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
