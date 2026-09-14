import { AuthGate } from "@/components/AuthGate";
import { PublishForm } from "@/components/PublishForm";
import { Shell } from "@/components/Shell";

export default function NuevaPegaPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">
        Marca · publicar
      </p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Di qué se graba y a cuánto
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        El aviso sale al publicar. A la derecha, quién ya aceptaría
        ese precio.
      </p>
      <div className="mt-8">
        <AuthGate rol="marca">
          <PublishForm />
        </AuthGate>
      </div>
    </Shell>
  );
}
