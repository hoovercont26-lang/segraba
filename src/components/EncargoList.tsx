"use client";

import { useEffect, useMemo, useState } from "react";
import { EncargoCard } from "@/components/EncargoCard";
import { ENCARGOS } from "@/lib/data";
import { listPegasPublicas } from "@/lib/store";
import { CIUDADES, NICHOS, type Ciudad, type Encargo, type Nicho } from "@/lib/types";

export function EncargoList() {
  const [items, setItems] = useState<Encargo[]>(ENCARGOS);
  const [nicho, setNicho] = useState<Nicho | "todos">("todos");
  const [ciudad, setCiudad] = useState<Ciudad | "todas">("todas");

  useEffect(() => {
    setItems(listPegasPublicas());
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((e) => {
        if (nicho !== "todos" && e.nicho !== nicho) return false;
        if (ciudad !== "todas" && e.ciudad !== ciudad) return false;
        return true;
      }),
    [items, nicho, ciudad],
  );

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm">Nicho</span>
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
      <div className="grid gap-4">
        {filtered.map((encargo) => (
          <EncargoCard key={encargo.id} encargo={encargo} />
        ))}
        {filtered.length === 0 ? (
          <p className="text-sm text-muted">
            No hay pega con ese filtro. Prueba otra ciudad o nicho.
          </p>
        ) : null}
      </div>
    </div>
  );
}
