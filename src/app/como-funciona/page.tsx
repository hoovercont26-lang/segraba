import Link from "next/link";
import { Shell } from "@/components/Shell";
import { COPY_CREADOR, COPY_IG, COPY_MARCA } from "@/lib/whatsapp";

const pasos = [
  {
    t: "El negocio publica",
    d: "Qué se graba, en qué red, la ciudad y el pago por video. Mínimo S/ 100.",
  },
  {
    t: "Los creadores se apuntan",
    d: "Si les alcanza el precio, se anotan. Todavía no ven el WhatsApp de nadie.",
  },
  {
    t: "El negocio elige",
    d: "Revisa quién se anotó y escoge al que más le convenga.",
  },
  {
    t: "Se abre el chat en la web",
    d: "Ahí coordinan el día y el pago. Si quieren, se pasan el número.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <Shell>
      <p className="text-xs font-bold uppercase tracking-wider text-flash">
        Cómo funciona
      </p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
        El precio ya está.{" "}
        <span className="text-flash">Se graba esta semana.</span>
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        Clasificado de precio cerrado: cuántos videos, una ciudad, un
        monto. TikTok primero; Instagram y Facebook también. Postulan.
        El negocio elige.
      </p>

      <ol className="mt-10 grid gap-4 md:grid-cols-2">
        {pasos.map((paso, i) => (
          <li key={paso.t} className="rounded-xl border border-line bg-card p-5">
            <span className="step-num">{i + 1}</span>
            <h2 className="mt-4 font-display text-xl font-bold">{paso.t}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{paso.d}</p>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-sm text-muted">
        El detalle de pago y reportes está en{" "}
        <Link href="/politicas" className="underline underline-offset-4">
          Políticas
        </Link>
        .
      </p>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">Textos para mandar</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          15 WhatsApp a locales. 15 DMs a creadores. Un pie de Instagram.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="glass rounded-3xl p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Local</p>
            <p className="mt-3 text-sm leading-6">{COPY_MARCA}</p>
          </article>
          <article className="glass rounded-3xl p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Creador</p>
            <p className="mt-3 text-sm leading-6">{COPY_CREADOR}</p>
          </article>
          <article className="glass rounded-3xl p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Instagram</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-6">{COPY_IG}</p>
          </article>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/registro?rol=marca&next=/pegas/nueva" className="btn btn-flash">
          Registrarme para publicar
        </Link>
        <Link href="/registro?rol=creador&next=/creadores/alta" className="btn btn-line">
          Registrarme para grabar
        </Link>
      </div>
    </Shell>
  );
}
