import Link from "next/link";
import { EncargoCard } from "@/components/EncargoCard";
import { LiveOrb } from "@/components/LiveOrb";
import { Shell } from "@/components/Shell";
import { ENCARGOS } from "@/lib/data";
import { COPY_CREADOR, COPY_IG, COPY_MARCA } from "@/lib/whatsapp";

export default function Home() {
  const [featured, second, third] = ENCARGOS;

  return (
    <Shell flush>
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div>
          <p className="reveal chip">Perú · precio cerrado</p>
          <h1 className="reveal-2 mt-6 max-w-xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">
            Se graba esta semana.
            <span className="mt-2 block text-flash">El precio ya está.</span>
          </h1>
          <p className="reveal-3 mt-6 max-w-md text-base leading-7 text-muted">
            Dices cuántos TikToks y a cuánto. Postulan. Tú eliges.
          </p>
          <div className="reveal-4 mt-8 flex flex-wrap gap-3">
            <Link href="/registro?rol=marca&next=/pegas/nueva" className="btn btn-flash">
              Publicar una pega
            </Link>
            <Link href="/registro?rol=creador&next=/creadores/alta" className="btn btn-line">
              Ofrecer el servicio
            </Link>
          </div>
        </div>
        <LiveOrb />
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Se graba ahora</h2>
          <Link href="/pegas" className="text-sm text-muted underline underline-offset-4">
            Ver todas
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-12">
          <EncargoCard encargo={featured} featured className="lg:col-span-7 lg:row-span-2" />
          <EncargoCard encargo={second} className="lg:col-span-5" />
          <EncargoCard encargo={third} className="lg:col-span-5" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <h2 className="text-2xl font-semibold tracking-tight">Cómo se usa</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="glass rounded-3xl p-5">
            <span className="step-num">1</span>
            <h3 className="mt-4 text-lg font-semibold">La marca publica</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Qué se graba, dónde y a cuánto. El precio ya está.
            </p>
          </article>
          <article className="glass rounded-3xl p-5">
            <span className="step-num">2</span>
            <h3 className="mt-4 text-lg font-semibold">Postulan</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Quien cubre el piso se apunta. Todavía no hay chat.
            </p>
          </article>
          <article className="glass rounded-3xl p-5">
            <span className="step-num">3</span>
            <h3 className="mt-4 text-lg font-semibold">Ella elige y chatean</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              El chat se abre en la web. Si quieren, se pasan el WhatsApp ahí.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20">
        <h2 className="text-2xl font-semibold tracking-tight">Textos para mandar</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Copia, cambia el nombre y mándalo. No hace falta cámara tuya.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <CopyCard titulo="WhatsApp a un local" texto={COPY_MARCA} />
          <CopyCard titulo="DM a un creador" texto={COPY_CREADOR} />
          <CopyCard titulo="Pie de Instagram" texto={COPY_IG} />
        </div>
      </section>
    </Shell>
  );
}

function CopyCard({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <article className="glass rounded-3xl p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{titulo}</p>
      <p className="mt-3 whitespace-pre-line text-sm leading-6">{texto}</p>
    </article>
  );
}
