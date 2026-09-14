import Link from "next/link";
import { EncargoList } from "@/components/EncargoList";
import { Shell } from "@/components/Shell";

export default function PegasPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">
        Pega abierta
      </p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Hay pega. Se graba al precio que ves.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        Filtra. Si el monto te alcanza, entra y postula.
      </p>
      <div className="mt-6">
        <Link href="/creadores/alta" className="text-sm underline underline-offset-4">
          Quiero ofrecer el servicio
        </Link>
      </div>
      <div className="mt-8">
        <EncargoList />
      </div>
    </Shell>
  );
}
