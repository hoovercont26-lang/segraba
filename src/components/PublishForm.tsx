"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreadorCard } from "@/components/CreadorCard";
import { usuarioActual } from "@/lib/auth";
import { matchCreadores, slugify, soles } from "@/lib/match";
import { listCreadores, saveEncargo } from "@/lib/store";
import { CIUDADES, NICHOS, type Ciudad, type Encargo, type Nicho } from "@/lib/types";

const empty: Omit<Encargo, "id" | "createdAt" | "autorId"> = {
  marca: "",
  whatsapp: "",
  nicho: "Foodie",
  ciudad: "Lima",
  videos: 5,
  precio: 350,
  plazo: "esta-semana",
  brief: "",
};

export function PublishForm() {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = usuarioActual();
    if (user) {
      setForm((prev) => ({
        ...prev,
        marca: prev.marca || user.nombre,
        whatsapp: prev.whatsapp || user.whatsapp,
      }));
    }
    setReady(true);
  }, []);

  const matches = useMemo(
    () => (ready ? matchCreadores(form, listCreadores()) : []),
    [form, ready],
  );

  function set<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = usuarioActual();
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
    if (form.brief.trim().length < 12) {
      setError("Describe en una frase qué se graba.");
      return;
    }
    if (form.precio < 200 || form.precio > 2000) {
      setError("El precio por video va de S/ 200 a S/ 2,000.");
      return;
    }
    const id = `${slugify(form.marca) || "pega"}-${Date.now().toString(36)}`;
    saveEncargo({
      ...form,
      marca: form.marca.trim(),
      whatsapp: phone,
      brief: form.brief.trim(),
      id,
      autorId: user.id,
      createdAt: new Date().toISOString(),
    });
    router.push(`/pegas/${id}`);
  }

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
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm">Nicho</span>
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
          <label className="block">
            <span className="text-sm">Videos</span>
            <input
              type="number"
              min={1}
              max={12}
              className="field"
              value={form.videos}
              onChange={(e) => set("videos", Number(e.target.value))}
            />
          </label>
          <label className="block">
            <span className="text-sm">Precio c/u (S/)</span>
            <input
              type="number"
              min={200}
              max={2000}
              className="field"
              value={form.precio}
              onChange={(e) => set("precio", Number(e.target.value))}
            />
          </label>
          <label className="block">
            <span className="text-sm">Plazo</span>
            <select
              className="field"
              value={form.plazo}
              onChange={(e) =>
                set("plazo", e.target.value as Encargo["plazo"])
              }
            >
              <option value="esta-semana">Esta semana</option>
              <option value="diez-dias">En 10 días</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="text-sm">Qué se graba, en una frase</span>
          <textarea
            className="field min-h-28"
            value={form.brief}
            onChange={(e) => set("brief", e.target.value)}
            placeholder="Cinco TikToks comiendo en mesa. Sin voz de comercial. Pauta 30 días."
          />
        </label>
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <button type="submit" className="btn btn-flash w-full sm:w-auto">
          Publicar a {soles(form.precio)} por video
        </button>
      </form>

      <aside className="glass rounded-3xl p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          Quién aceptaría ahora
        </p>
        <p className="price mt-2 text-5xl">{matches.length}</p>
        <p className="mt-2 text-sm text-muted">
          Cubren {form.nicho.toLowerCase()} a {soles(form.precio)} o menos.
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
