import Image from "next/image";
import Link from "next/link";
import { HomeAvisos } from "@/components/HomeAvisos";
import { Shell } from "@/components/Shell";
import { FEE_AVISO, PLANES_CREADOR, solesFee } from "@/lib/money";
import { COPY_CREADOR, COPY_IG, COPY_MARCA } from "@/lib/whatsapp";

export default function Home() {
  return (
    <Shell flush>
      <section className="relative w-full overflow-hidden bg-bg-deep">
        <div className="relative h-[520px] w-full sm:h-[600px]">
          <Image
            src="/brand/hero-creadora.png"
            alt="Creadora de contenido en Perú"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 mx-auto -mt-44 w-full max-w-2xl px-4 pb-8 sm:-mt-52 sm:px-5">
          <p className="reveal chip !border-cyan/30 !text-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
            Trato directo · Yape / Plin
          </p>
          <h1 className="reveal-2 mt-4 font-display text-[2.35rem] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            El contenido que llena tu local{" "}
            <span className="text-flash">se graba acá.</span>
          </h1>
          <p className="reveal-3 mt-4 max-w-xl text-base leading-7 text-muted">
            Conectamos cafeterías, huariques y marcas con creadores peruanos.
            Tú negocias y pagas directo por Yape o Plin.
          </p>
          <div className="reveal-4 mt-6 flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <Link href="/pegas/nueva" className="btn btn-flash w-full sm:w-auto">
              Publicar aviso · {solesFee(FEE_AVISO)}
            </Link>
            <Link
              href="/creadores/plan"
              className="btn btn-line w-full sm:w-auto"
            >
              Quiero grabar
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-10 sm:px-5">
        <div className="mb-1 flex items-center gap-1.5 text-cyan">
          <span className="text-sm font-bold uppercase tracking-wider">Trato directo</span>
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-[1.75rem]">
          Sin comisiones raras por video
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          El pago de la grabación va 100% al creador vía Yape o Plin. SeGraba
          solo cobra el fee por aviso o membresía.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          {[
            {
              n: "1",
              title: "Negocio publica",
              body: `${solesFee(FEE_AVISO)} por aviso. Describe qué necesitas para TikTok o Reels.`,
            },
            {
              n: "2",
              title: "Creadores se apuntan",
              body: "Con plan Base o Pro postulan al instante. Tú eliges a quién.",
            },
            {
              n: "3",
              title: "Coordinan y pagan directo",
              body: "Chat en SeGraba. El Yape del video es entre ustedes.",
            },
          ].map((step) => (
            <div
              key={step.n}
              className="flex items-start gap-4 rounded-xl border border-line bg-card p-4"
            >
              <span className="step-num">{step.n}</span>
              <div>
                <p className="font-bold text-ink">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-6 sm:px-5" id="planes">
        <p className="text-xs font-bold uppercase tracking-wider text-flash">
          Creadores UGC
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
          Monetiza con tu celu
        </h2>
        <p className="mt-2 text-sm text-muted">
          Apúntate a pegas reales en tu distrito.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(Object.values(PLANES_CREADOR) as (typeof PLANES_CREADOR)["base"][]).map(
            (plan) => (
              <article
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-xl border border-line bg-card p-4 ${
                  plan.id === "pro" ? "shadow-[4px_4px_0_var(--flash)]" : ""
                }`}
              >
                {plan.id === "pro" ? (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-flash px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-flash-ink">
                    Más pedido
                  </span>
                ) : null}
                <div>
                  <p className="font-bold">{plan.nombre}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-ink">
                    {solesFee(plan.precio)}
                    <span className="ml-1 text-sm font-normal text-muted">
                      / 30 días
                    </span>
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted">
                    {plan.beneficios.slice(0, 3).map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="text-cyan">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/creadores/plan"
                  className={`btn mt-5 w-full ${
                    plan.id === "pro" ? "btn-flash" : "btn-line"
                  }`}
                >
                  {plan.id === "pro"
                    ? `Activar Pro · ${solesFee(plan.precio)}`
                    : `Elegir ${plan.nombre}`}
                </Link>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-5">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Avisos calientes
            </h2>
            <p className="mt-1 text-sm text-muted">
              Pegas abiertas esperando creador
            </p>
          </div>
          <Link
            href="/pegas"
            className="text-sm font-semibold text-cyan underline underline-offset-4"
          >
            Ver todos
          </Link>
        </div>
        <HomeAvisos />
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-5">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Textos para mandar
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Copia, cambia el nombre y mándalo.
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
    <article className="rounded-xl border border-line bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
        {titulo}
      </p>
      <p className="mt-3 whitespace-pre-line text-sm leading-6">{texto}</p>
    </article>
  );
}
