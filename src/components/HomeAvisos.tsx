"use client";

import { useEffect, useState } from "react";
import { EncargoCard } from "@/components/EncargoCard";
import { ENCARGOS } from "@/lib/data";
import { listPegasPublicas } from "@/lib/store";
import type { Encargo } from "@/lib/types";

export function HomeAvisos() {
  const [items, setItems] = useState<Encargo[]>(ENCARGOS.slice(0, 3));

  useEffect(() => {
    listPegasPublicas()
      .then((list) => {
        if (list.length > 0) setItems(list.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const [featured, second, third] = items;
  if (!featured) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
      <EncargoCard encargo={featured} featured className="lg:col-span-7 lg:row-span-2" />
      {second ? <EncargoCard encargo={second} className="lg:col-span-5" /> : null}
      {third ? <EncargoCard encargo={third} className="lg:col-span-5" /> : null}
    </div>
  );
}
