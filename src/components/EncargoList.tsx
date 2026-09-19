"use client";

import { useEffect, useMemo, useState } from "react";
import { EncargoCard } from "@/components/EncargoCard";
import { ENCARGOS } from "@/lib/data";
import { listPegasPublicas } from "@/lib/store";
import {
  CIUDADES,
  NICHOS,
  REDES,
  redesDe,
  type Ciudad,
  type Encargo,
  type Nicho,
  type Red,
} from "@/lib/types";

export function EncargoList() {
  const [items, setItems] = useState<Encargo[]>(ENCARGOS);
  const [nicho, setNicho] = useState<Nicho | "todos">("todos");
  const [ciudad, setCiudad] = useState<Ciudad | "todas">("todas");
  const [red, setRed] = useState<Red | "todas">("todas");

  useEffect(() => {
    listPegasPublicas().then(setItems);
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((e) => {
        if (nicho !== "todos" && e.nicho !== nicho) return false;
        if (ciudad !== "todas" && e.ciudad !== ciudad) return false;
        if (red !== "todas" && !redesDe(e).includes(red)) return false;
        return true;
      }),
    [items, nicho, ciudad, red],
  );

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`chip ${red === "todas" ? "border-cyan text-ink" : ""}`}
            onClick={() => setRed("todas")}
          >
            Todas las redes
          </button>
          {REDES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`net net-${item.id} ${red === item.id ? "net-on" : ""}`}
              onClick={() => setRed(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm">Rubro</span>
            <select
              className="field"
              value={nicho}
              onChange={(e) => setNicho(e.target.value as Nicho | "todos")}
            >
              <option value="todos">Todos</option>
              {NICHOS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm">Ciudad</span>
            <select
              className="field"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value as Ciudad | "todas")}
            >
              <option value="todas">Todas</option>
              {CIUDADES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="grid gap-4">
        {filtered.map((encargo) => (
          <EncargoCard key={encargo.id} encargo={encargo} />
        ))}
        {filtered.length === 0 ? (
          <p className="text-sm text-muted">
            No hay avisos con ese filtro. Prueba otra ciudad o rubro.
          </p>
        ) : null}
      </div>
    </div>
  );
}
