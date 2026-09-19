import Image from "next/image";
import Link from "next/link";
import { HomeAvisos } from "@/components/HomeAvisos";
import { Shell } from "@/components/Shell";
import { FEE_AVISO, PLANES_CREADOR, solesFee } from "@/lib/money";
import { COPY_CREADOR, COPY_IG, COPY_MARCA } from "@/lib/whatsapp";

export default function Home() {
  return (
    <Shell flush>
      {/* Hero: móvil = imagen + texto debajo; desktop = full-bleed con copy a la izquierda */}
      <section className="relative w-full overflow-hidden bg-bg-deep">
        <div className="relative h-[min(72vh,520px)] w-full sm:h-[min(78vh,640px)] lg:h-[min(88vh,760px)]">
          <Image
            src="/brand/hero-creadora.png"
            alt="Creadora de contenido en Perú"
            fill
            priority
            className="object-cover object-[center_20%] lg:object-[68%_28%]"
            sizes="100vw"
          />
          {/* Mobile: fade from bottom for overlapping text */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent lg:hidden" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-transparent to-transparent lg:hidden" />
          {/* Desktop: left vignette so copy stays readable on the photo */}
          <div className="absolute inset-0 hidden bg-gradient-to-r from-bg from-0% via-bg/80 via-35% to-transparent to-70% lg:block" />
          <div className="absolute inset-0 hidden bg-gradient-to-t from-bg/50 via-transparent to-bg/20 lg:block" />

          {/* Desktop copy overlaid on hero */}
          <div className="absolute inset-0 z-10 hidden items-center lg:flex">
            <div className="mx-auto w-full max-w-6xl px-8 xl:px-10">
              <div className="max-w-xl xl:max-w-2xl">
                <p className="reveal chip !border-cyan/30 !text-cyan">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                  Trato directo · Yape / Plin
                </p>
                <h1 className="reveal-2 mt-5 font-display text-[3.25rem] font-extrabold leading-[1.05] tracking-tight text-ink xl:text-[3.5rem]">
                  El contenido que llena tu local{" "}
                  <span className="text-flash">se graba acá.</span>
                </h1>
                <p className="reveal-3 mt-5 max-w-lg text-lg leading-8 text-muted">
                  Conectamos cafeterías, huariques y marcas con creadores
                  peruanos. Tú negocias y pagas directo por Yape o Plin.
                </p>
                <div className="reveal-4 mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/pegas/nueva" className="btn btn-flash">
                    Publicar aviso · {solesFee(FEE_AVISO)}
                  </Link>
                  <Link href="/creadores/plan" className="btn btn-line">
                    Quiero grabar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / tablet copy under hero */}
        <div className="relative z-10 mx-auto -mt-40 w-full max-w-2xl px-4 pb-8 sm:-mt-48 sm:px-5 lg:hidden">
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

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-5 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <div className="mb-1 flex items-center gap-1.5 text-cyan">
            <span className="text-sm font-bold uppercase tracking-wider">
              Trato directo
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight lg:text-4xl">
            Sin comisiones raras por video
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted lg:text-base lg:leading-7">
            El pago de la grabación va 100% al creador vía Yape o Plin. SeGraba
            solo cobra el fee por aviso o membresía.
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:gap-4 lg:mt-10 lg:grid-cols-3">
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
              className="flex items-start gap-4 rounded-xl border border-line bg-card p-4 lg:flex-col lg:gap-5 lg:p-6"
            >
              <span className="step-num">{step.n}</span>
              <div>
                <p className="font-bold text-ink lg:text-lg">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted lg:mt-2">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-5 lg:px-8 lg:py-16"
        id="planes"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-wider text-flash">
              Creadores UGC
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight lg:text-4xl">
              Monetiza con tu celu
            </h2>
            <p className="mt-2 text-sm text-muted lg:text-base">
              Apúntate a pegas reales en tu distrito.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:mx-auto lg:max-w-4xl lg:gap-6">
          {(Object.values(PLANES_CREADOR) as (typeof PLANES_CREADOR)["base"][]).map(
            (plan) => (
              <article
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-xl border border-line bg-card p-4 lg:p-7 ${
                  plan.id === "pro" ? "shadow-[4px_4px_0_var(--flash)]" : ""
                }`}
              >
                {plan.id === "pro" ? (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-flash px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-flash-ink">
                    Más pedido
                  </span>
                ) : null}
                <div>
                  <p className="font-bold lg:text-lg">{plan.nombre}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-ink lg:text-4xl">
                    {solesFee(plan.precio)}
                    <span className="ml-1 text-sm font-normal text-muted">
                      / 30 días
                    </span>
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted lg:mt-6 lg:space-y-3">
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
                  className={`btn mt-5 w-full lg:mt-8 ${
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

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-5 lg:px-8 lg:py-16">
        <div className="mb-5 flex items-end justify-between gap-3 lg:mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight lg:text-4xl">
              Avisos calientes
            </h2>
            <p className="mt-1 text-sm text-muted lg:text-base">
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

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-5 lg:px-8 lg:pb-24">
        <h2 className="font-display text-2xl font-bold tracking-tight lg:text-4xl">
          Textos para mandar
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted lg:text-base">
          Copia, cambia el nombre y mándalo.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3 lg:mt-8 lg:gap-6">
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
    <article className="rounded-xl border border-line bg-card p-5 lg:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
        {titulo}
      </p>
      <p className="mt-3 whitespace-pre-line text-sm leading-6">{texto}</p>
    </article>
  );
}
