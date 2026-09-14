"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usuarioActual } from "@/lib/auth";
import { slugify } from "@/lib/match";
import { perfilDe, saveCreador } from "@/lib/store";
import { CIUDADES, NICHOS, type Ciudad, type Nicho } from "@/lib/types";

export function CreatorForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [ciudad, setCiudad] = useState<Ciudad>("Lima");
  const [nicho, setNicho] = useState<Nicho>("Foodie");
  const [minPrecio, setMinPrecio] = useState(300);
  const [estilo, setEstilo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = usuarioActual();
    if (!user) return;
    const existing = perfilDe(user.id);
    setNombre(existing?.nombre || user.nombre);
    setWhatsapp(existing?.whatsapp || user.whatsapp);
    if (existing) {
      setTiktok(existing.tiktok);
      setCiudad(existing.ciudad);
      setNicho(existing.nichos[0] || "Foodie");
      setMinPrecio(existing.minPrecio);
      setEstilo(existing.estilo);
    }
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = usuarioActual();
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
      setError("Pon tu usuario de TikTok.");
      return;
    }
    const existing = perfilDe(user.id);
    saveCreador({
      id: existing?.id || slugify(`${nombre}-${handle}`) || `creador-${Date.now()}`,
      autorId: user.id,
      nombre: nombre.trim(),
      tiktok: handle,
      ciudad,
      nichos: [nicho],
      minPrecio,
      seguidores: existing?.seguidores || 800,
      estilo: estilo.trim() || "Grabo UGC con precio cerrado.",
      whatsapp: phone,
      entregas: existing?.entregas || 0,
    });
    router.push("/pegas");
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
        <span className="text-sm">TikTok</span>
        <input
          className="field"
          value={tiktok}
          onChange={(e) => setTiktok(e.target.value)}
          placeholder="camcome.pe"
        />
      </label>
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
          <span className="text-sm">Nicho</span>
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
      <label className="block">
        <span className="text-sm">No bajo de (S/ por video)</span>
        <input
          type="number"
          min={200}
          max={2000}
          className="field"
          value={minPrecio}
          onChange={(e) => setMinPrecio(Number(e.target.value))}
        />
      </label>
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
