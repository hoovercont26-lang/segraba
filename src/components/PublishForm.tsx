"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreadorCard } from "@/components/CreadorCard";
import { NumberField, RedesPicker } from "@/components/Fields";
import { usuarioActual } from "@/lib/auth";
import { matchCreadores, slugify, soles } from "@/lib/match";
import {
  FEE_AVISO,
  PRECIO_MAX,
  PRECIO_MIN,
  VIDEOS_MAX,
  VIDEOS_MIN,
  paquete,
  precioOk,
  solesFee,
  videosOk,
  type NumDraft,
} from "@/lib/money";
import { listCreadores, saveEncargo } from "@/lib/store";
import { CIUDADES, NICHOS, type Ciudad, type Creador, type Encargo, type Nicho, type Red } from "@/lib/types";

type Draft = Omit<Encargo, "id" | "createdAt" | "autorId" | "videos" | "precio"> & {
  videos: NumDraft;
  precio: NumDraft;
  redes: Red[];
};

const empty: Draft = {
  marca: "",
  whatsapp: "",
  nicho: "Foodie",
  ciudad: "Lima",
  videos: 5,
  precio: 350,
  plazo: "esta-semana",
  brief: "",
  redes: ["tiktok"],
};

export function PublishForm() {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [creadores, setCreadores] = useState<Creador[]>([]);

  useEffect(() => {
    usuarioActual().then(async (user) => {
      if (user) {
        setForm((prev) => ({
          ...prev,
          marca: prev.marca || user.nombre,
          whatsapp: prev.whatsapp || user.whatsapp,
        }));
      }
      setCreadores(await listCreadores());
      setReady(true);
    });
  }, []);

  const matches = useMemo(
    () =>
      ready && precioOk(form.precio)
        ? matchCreadores({ ...form, precio: form.precio }, creadores)
        : [],
    [form, ready, creadores],
  );

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = await usuarioActual();
    if (!user) {
      setError("Entra para publicar.");
      return;
    }
    const phone = form.whatsapp.replace(/\D/g, "");
    if (form.marca.trim().length < 2) {
      setError("Pon el nombre del negocio.");
      return;
    }
    if (phone.length !== 9 || !phone.startsWith("9")) {
      setError("WhatsApp peruano: 9 dígitos, empieza con 9.");
      return;
    }
    if (!videosOk(form.videos)) {
      setError(`Los videos van de ${VIDEOS_MIN} a ${VIDEOS_MAX}.`);
      return;
    }
    if (!precioOk(form.precio)) {
      setError(`El precio por video va de S/ ${PRECIO_MIN} a S/ ${PRECIO_MAX.toLocaleString("es-PE")}.`);
      return;
    }
    if (form.redes.length < 1) {
      setError("Elige al menos una red.");
      return;
    }
    if (form.brief.trim().length < 12) {
      setError("Describe en una frase qué se graba.");
      return;
    }
    const id = `${slugify(form.marca) || "pega"}-${Date.now().toString(36)}`;
    await saveEncargo({
      ...form,
      videos: form.videos,
      precio: form.precio,
      marca: form.marca.trim(),
      whatsapp: phone,
      brief: form.brief.trim(),
      id,
      autorId: user.id,
      createdAt: new Date().toISOString(),
      estado: "esperando-pago",
      pago: { monto: FEE_AVISO },
    });
    router.push(`/pegas/${id}/pagar`);
  }

  const total =
    videosOk(form.videos) && precioOk(form.precio)
      ? paquete({ videos: form.videos, precio: form.precio })
      : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm">Nombre del negocio</span>
          <input
            className="field"
            value={form.marca}
            onChange={(e) => set("marca", e.target.value)}
            placeholder="La Caleta Barranco"
          />
        </label>
        <label className="block">
          <span className="text-sm">WhatsApp (9 dígitos)</span>
          <input
            className="field"
            inputMode="numeric"
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            placeholder="987654321"
          />
        </label>
        <RedesPicker
          label="Dónde se publica"
          hint="TikTok es el centro. Instagram y Facebook también entran."
          value={form.redes}
          onChange={(redes) => set("redes", redes)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm">Rubro</span>
            <select
              className="field"
              value={form.nicho}
              onChange={(e) => set("nicho", e.target.value as Nicho)}
            >
              {NICHOS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm">Ciudad</span>
            <select
              className="field"
              value={form.ciudad}
              onChange={(e) => set("ciudad", e.target.value as Ciudad)}
            >
              {CIUDADES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            label="Videos"
            hint={`${VIDEOS_MIN} a ${VIDEOS_MAX}`}
            value={form.videos}
            onChange={(value) => set("videos", value)}
            placeholder="5"
          />
          <NumberField
            label="Precio c/u (S/)"
            hint={`Mínimo S/ ${PRECIO_MIN}`}
            value={form.precio}
            onChange={(value) => set("precio", value)}
            placeholder="350"
          />
          <label className="block">
            <span className="text-sm">Plazo</span>
            <select
              className="field"
              value={form.plazo}
              onChange={(e) => set("plazo", e.target.value as Encargo["plazo"])}
            >
              <option value="esta-semana">Esta semana</option>
              <option value="diez-dias">En 10 días</option>
            </select>
          </label>
        </div>
        {total !== null ? (
          <p className="text-sm text-muted">
            Paquete: <span className="font-semibold text-ink">{soles(total)}</span>
          </p>
        ) : null}
        <label className="block">
          <span className="text-sm">Qué se graba, en una frase</span>
          <textarea
            className="field min-h-28"
            value={form.brief}
            onChange={(e) => set("brief", e.target.value)}
            placeholder="Cinco videos comiendo en mesa. Sin voz de comercial. Pauta 30 días."
          />
        </label>
        {ready ? (
          <p className="text-sm leading-6 text-muted">
            Cada aviso sale {solesFee(FEE_AVISO)}, por Yape o Plin. En la
            siguiente pantalla envías la constancia.
          </p>
        ) : null}
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <button type="submit" className="btn btn-flash w-full sm:w-auto">
          {precioOk(form.precio)
            ? `Publicar a ${soles(form.precio)} por video`
            : "Publicar el aviso"}
        </button>
      </form>

      <aside className="glass rounded-3xl p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          Quién aceptaría ahora
        </p>
        <p className="price mt-2 text-5xl">{matches.length}</p>
        <p className="mt-2 text-sm text-muted">
          {precioOk(form.precio)
            ? `Cubren ${form.nicho.toLowerCase()} a ${soles(form.precio)} o menos.`
            : `Pon un precio de S/ ${PRECIO_MIN} o más para ver matches.`}
        </p>
        <div className="mt-4 space-y-3">
          {matches.slice(0, 3).map((c) => (
            <CreadorCard key={c.id} creador={c} />
          ))}
        </div>
      </aside>
    </div>
  );
}
