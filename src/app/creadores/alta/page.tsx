import { AuthGate } from "@/components/AuthGate";
import { CreatorForm } from "@/components/CreatorForm";
import { Shell } from "@/components/Shell";

export default function AltaCreadorPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">
        Creador · ofrecer
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Di desde cuánto grabas
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        Si el aviso cubre lo que pides (mínimo S/ 100), te aparece.
        Luego eliges Base o Pro para apuntarte. TikTok, Instagram o
        Facebook. El 100% del video es tuyo.
      </p>
      <div className="mt-8">
        <AuthGate rol="creador">
          <CreatorForm />
        </AuthGate>
      </div>
    </Shell>
  );
}
