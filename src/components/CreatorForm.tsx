"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NumberField, RedesPicker } from "@/components/Fields";
import { usuarioActual } from "@/lib/auth";
import { slugify } from "@/lib/match";
import { PRECIO_MAX, PRECIO_MIN, precioOk, type NumDraft } from "@/lib/money";
import { perfilDe, planActivo, saveCreador } from "@/lib/store";
import { CIUDADES, NICHOS, redesDe, type Ciudad, type Nicho, type Red } from "@/lib/types";

export function CreatorForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [ciudad, setCiudad] = useState<Ciudad>("Lima");
  const [nicho, setNicho] = useState<Nicho>("Foodie");
  const [minPrecio, setMinPrecio] = useState<NumDraft>(300);
  const [estilo, setEstilo] = useState("");
  const [redes, setRedes] = useState<Red[]>(["tiktok"]);
  const [error, setError] = useState("");

  useEffect(() => {
    usuarioActual().then(async (user) => {
      if (!user) return;
      const existing = await perfilDe(user.id);
      const params = new URLSearchParams(window.location.search);
      const editing = params.get("edit") === "1";
      if (existing && !editing && !planActivo(user)) {
        router.replace("/creadores/plan");
        return;
      }
      setNombre(existing?.nombre || user.nombre);
      setWhatsapp(existing?.whatsapp || user.whatsapp);
      if (existing) {
        setTiktok(existing.tiktok);
        setCiudad(existing.ciudad);
        setNicho(existing.nichos[0] || "Foodie");
        setMinPrecio(existing.minPrecio);
        setEstilo(existing.estilo);
        setRedes(redesDe(existing));
      }
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = await usuarioActual();
    if (!user) {
      setError("Entra para ofrecer el servicio.");
      return;
    }
    const phone = whatsapp.replace(/\D/g, "");
    if (nombre.trim().length < 2) {
      setError("Pon tu nombre.");
      return;
    }
    if (phone.length !== 9 || !phone.startsWith("9")) {
      setError("WhatsApp peruano: 9 dígitos, empieza con 9.");
      return;
    }
    const handle = tiktok.replace(/^@/, "").trim();
    if (handle.length < 2) {
      setError("Pon tu usuario de TikTok, Instagram o Facebook.");
      return;
    }
    if (!precioOk(minPrecio)) {
      setError(`Tu precio mínimo va de S/ ${PRECIO_MIN} a S/ ${PRECIO_MAX.toLocaleString("es-PE")}.`);
      return;
    }
    const existing = await perfilDe(user.id);
    await saveCreador({
      id: existing?.id || slugify(`${nombre}-${handle}`) || `creador-${Date.now()}`,
      autorId: user.id,
      nombre: nombre.trim(),
      tiktok: handle,
      ciudad,
      nichos: [nicho],
      minPrecio,
      redes,
      seguidores: existing?.seguidores || 800,
      estilo: estilo.trim() || "Grabo UGC con precio cerrado.",
      whatsapp: phone,
      entregas: existing?.entregas || 0,
    });
    const refreshed = await usuarioActual();
    if (!planActivo(refreshed)) {
      router.push("/creadores/plan");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    router.push(next && next.startsWith("/") ? next : "/pegas");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <label className="block">
        <span className="text-sm">Nombre</span>
        <input
          className="field"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Camila Ríos"
        />
      </label>
      <label className="block">
        <span className="text-sm">Usuario principal</span>
        <input
          className="field"
          value={tiktok}
          onChange={(e) => setTiktok(e.target.value)}
          placeholder="camcome.pe"
        />
        <span className="mt-1.5 block text-xs leading-5 text-muted">
          El de TikTok, Instagram o Facebook que más uses.
        </span>
      </label>
      <RedesPicker
        label="Dónde grabas"
        hint="Puedes marcar más de una. TikTok, Reels e IG y Facebook."
        value={redes}
        onChange={setRedes}
      />
      <label className="block">
        <span className="text-sm">WhatsApp (9 dígitos)</span>
        <input
          className="field"
          inputMode="numeric"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="987654321"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm">Ciudad</span>
          <select
            className="field"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value as Ciudad)}
          >
            {CIUDADES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Rubro</span>
          <select
            className="field"
            value={nicho}
            onChange={(e) => setNicho(e.target.value as Nicho)}
          >
            {NICHOS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>
      <NumberField
        label="No bajo de (S/ por video)"
        hint={`Mínimo S/ ${PRECIO_MIN}`}
        value={minPrecio}
        onChange={setMinPrecio}
        placeholder="300"
      />
      <label className="block">
        <span className="text-sm">Cómo grabas</span>
        <textarea
          className="field min-h-24"
          value={estilo}
          onChange={(e) => setEstilo(e.target.value)}
          placeholder="Como en casa. Sin voz de comercial."
        />
      </label>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <button type="submit" className="btn btn-flash w-full sm:w-auto">
        Ofrecer mi servicio
      </button>
    </form>
  );
}
