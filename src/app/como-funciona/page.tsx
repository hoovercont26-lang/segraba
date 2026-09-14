import Link from "next/link";
import { Shell } from "@/components/Shell";
import { COPY_CREADOR, COPY_IG, COPY_MARCA } from "@/lib/whatsapp";

const pasos = [
  {
    t: "La marca publica",
    d: "Qué se graba, la ciudad y el pago por video. El precio ya está.",
  },
  {
    t: "Los creadores postulan",
    d: "Si el piso les alcanza, se apuntan. Todavía no ven el WhatsApp de nadie.",
  },
  {
    t: "La marca elige",
    d: "Revisa quién postuló y escoge al que más le convenga.",
  },
  {
    t: "Se abre el chat en la web",
    d: "Ahí coordinan el día y el pago. Si quieren, se pasan el número.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">
        Cómo funciona
      </p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        El precio ya está. Se graba esta semana.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        UGC.red es el directorio. Nosotros somos el clasificado: 5
        videos, una ciudad, un monto. Postulan. La marca elige.
      </p>

      <ol className="mt-10 grid gap-4 md:grid-cols-2">
        {pasos.map((paso, i) => (
          <li key={paso.t} className="glass rounded-3xl p-5">
            <span className="step-num">{i + 1}</span>
            <h2 className="mt-4 text-xl font-semibold">{paso.t}</h2>
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
