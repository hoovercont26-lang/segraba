import Link from "next/link";
import { PagoAviso } from "@/components/PagoAviso";
import { Shell } from "@/components/Shell";

export default function PoliticasPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">
        Políticas
      </p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Pago, reportes y uso de SeGraba
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        SeGraba es un clasificado: la marca publica un precio, el
        creador acepta. El dinero no pasa por nosotros.
      </p>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">El pago</h2>
        <div className="mt-4">
          <PagoAviso />
        </div>
      </div>

      <div className="mt-10 max-w-xl">
        <h2 className="text-2xl font-semibold tracking-tight">Reportes</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Si un local no pagó o un creador no entregó, se reporta con
          cuenta. Con dos reportes el aviso o el perfil queda marcado.
        </p>
        <Link href="/reportar" className="mt-4 inline-block text-sm underline underline-offset-4">
          Ir a la casilla de reportes
        </Link>
      </div>

      <p className="mt-10 text-sm text-muted">
        <Link href="/como-funciona" className="underline underline-offset-4">
          Cómo funciona
        </Link>
      </p>
    </Shell>
  );
}
