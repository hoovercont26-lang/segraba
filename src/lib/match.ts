import type { Creador, Encargo } from "./types";

export type Match = Creador & {
  mismaCiudad: boolean;
  aceptaPrecio: boolean;
};

export function matchCreadores(
  encargo: Pick<Encargo, "nicho" | "ciudad" | "precio">,
  creadores: Creador[],
): Match[] {
  return creadores
    .filter(
      (c) => c.nichos.includes(encargo.nicho) && c.minPrecio <= encargo.precio,
    )
    .map((c) => ({
      ...c,
      mismaCiudad: c.ciudad === encargo.ciudad,
      aceptaPrecio: true,
    }))
    .sort((a, b) => {
      if (a.mismaCiudad !== b.mismaCiudad) return a.mismaCiudad ? -1 : 1;
      return a.minPrecio - b.minPrecio;
    });
}

export function plazoLabel(plazo: Encargo["plazo"]) {
  return plazo === "esta-semana" ? "Esta semana" : "En 10 días";
}

export function miles(n: number) {
  return `${n}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function soles(n: number) {
  return `S/ ${miles(n)}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}
