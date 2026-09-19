"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ENCARGOS } from "@/lib/data";
import { plazoLabel, soles } from "@/lib/match";

export function LiveOrb() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % ENCARGOS.length);
    }, 3600);
    return () => window.clearInterval(id);
  }, []);

  const item = ENCARGOS[index % ENCARGOS.length];

  return (
    <Link
      href={`/pegas/${item.id}`}
      className="glass glass-hot reveal-3 block rounded-[2rem] p-7 transition-transform hover:-translate-y-0.5"
    >
      <p className="chip">{item.nicho} · {item.ciudad}</p>
      <p className="price mt-6 text-6xl">
        {soles(item.precio)}
      </p>
      <p className="mt-1 text-sm text-muted">por video · {item.videos} piezas</p>
      <p className="mt-5 text-lg font-semibold">{item.marca}</p>
      <p className="mt-1 text-sm text-muted">{plazoLabel(item.plazo)}</p>
      <div className="mt-6 flex gap-1.5" aria-hidden>
        {ENCARGOS.map((pega, i) => (
          <span
            key={pega.id}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-flash" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </Link>
  );
}
