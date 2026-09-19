import Link from "next/link";
import { EncargoList } from "@/components/EncargoList";
import { Shell } from "@/components/Shell";

export default function PegasPage() {
  return (
    <Shell>
      <p className="text-xs font-bold uppercase tracking-wider text-flash">
        Avisos
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
        Avisos abiertos.{" "}
        <span className="text-flash">El precio ya está puesto.</span>
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        Filtra por rubro, ciudad o red. Si te alcanza el precio, entra
        y apúntate.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/creadores/plan" className="btn btn-flash !min-h-0 !px-3 !py-1.5 text-sm">
          Quiero grabar
        </Link>
        <Link href="/pegas/nueva" className="btn btn-line !min-h-0 !px-3 !py-1.5 text-sm">
          Publicar aviso
        </Link>
      </div>
      <div className="mt-8">
        <EncargoList />
      </div>
    </Shell>
  );
}
