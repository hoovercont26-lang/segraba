"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usuarioActual } from "@/lib/auth";
import { FEE_AVISO, YAPE_PLIN_SEGRABA, solesFee } from "@/lib/money";
import { enviarConstancia, getEncargo } from "@/lib/store";
import type { Encargo, MetodoPago } from "@/lib/types";

export function PagoPrimera({ id }: { id: string }) {
  const router = useRouter();
  const [encargo, setEncargo] = useState<Encargo | undefined>();
  const [metodo, setMetodo] = useState<MetodoPago>("yape");
  const [constancia, setConstancia] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [autorOk, setAutorOk] = useState(false);

  useEffect(() => {
    Promise.all([getEncargo(id), usuarioActual()]).then(([item, user]) => {
      setEncargo(item);
      setAutorOk(Boolean(user && item && user.id === item.autorId));
      if (item?.estado === "publicado") router.replace(`/pegas/${id}`);
    });
  }, [id, router]);

  if (!encargo) {
    return <p className="text-muted">Cargando el pago…</p>;
  }

  const soyAutor = autorOk;

  if (!soyAutor) {
    return (
      <div className="glass max-w-lg rounded-3xl p-6">
        <h1 className="text-2xl font-semibold">Este pago no es tuyo</h1>
        <Link href="/pegas" className="btn btn-line mt-6">
          Ver avisos
        </Link>
      </div>
    );
  }

  if (encargo.estado === "validando") {
    return (
      <div className="glass max-w-xl rounded-3xl p-6 sm:p-8">
        <p className="seal seal-wait">Validando pago</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Recibimos tu constancia
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Estamos validando tu {encargo.pago?.metodo === "plin" ? "Plin" : "Yape"} de{" "}
          {solesFee(encargo.pago?.monto ?? FEE_AVISO)}. En cuanto lo confirmemos, el aviso{" "}
          <span className="text-ink">{encargo.marca}</span> queda al aire. Te
          avisamos aquí y en tu cuenta.
        </p>
        <Link href="/cuenta" className="btn btn-flash mt-6">
          Ir a mi cuenta
        </Link>
      </div>
    );
  }

  async function onFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Manda una foto de la constancia (captura o foto).");
      return;
    }
    if (file.size > 3_000_000) {
      setError("La foto pesa mucho. Manda una captura más liviana.");
      return;
    }
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("No se pudo leer la foto."));
      reader.readAsDataURL(file);
    });
    setConstancia(data);
    setError("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!constancia) {
      setError("Sube la constancia para validar el pago.");
      return;
    }
    await enviarConstancia(id, metodo, constancia);
    setEncargo(await getEncargo(id));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">
          Publicar aviso
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Paga {solesFee(encargo.pago?.monto ?? FEE_AVISO)} por Yape o Plin
        </h1>
        <p className="max-w-xl text-sm leading-6 text-muted">
          Es el costo de sacar este aviso. Yapea o plinea y manda la
          constancia aquí mismo. Luego queda en validación y, al
          confirmarlo, se lanza.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn ${metodo === "yape" ? "btn-flash" : "btn-line"}`}
            onClick={() => setMetodo("yape")}
          >
            Yape
          </button>
          <button
            type="button"
            className={`btn ${metodo === "plin" ? "btn-flash" : "btn-line"}`}
            onClick={() => setMetodo("plin")}
          >
            Plin
          </button>
        </div>

        <div className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            Número {metodo === "yape" ? "Yape" : "Plin"}
          </p>
          <p className="price mt-2 text-4xl">{YAPE_PLIN_SEGRABA}</p>
          <p className="mt-2 text-sm text-muted">
            Monto exacto: {solesFee(encargo.pago?.monto ?? FEE_AVISO)}
          </p>
          <button
            type="button"
            className="btn btn-line mt-4"
            onClick={async () => {
              await navigator.clipboard.writeText(YAPE_PLIN_SEGRABA);
              setCopied(true);
            }}
          >
            {copied ? "Número copiado" : "Copiar número"}
          </button>
        </div>

        <label className="block">
          <span className="text-sm">Constancia (captura o foto)</span>
          <input
            className="field"
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
        {constancia ? (
          <p className="text-sm text-ok">Foto lista. Ya puedes enviarla.</p>
        ) : null}
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <button type="submit" className="btn btn-flash w-full sm:w-auto">
          Enviar constancia
        </button>
      </form>
      <aside className="glass h-fit rounded-3xl p-5">
        <p className="text-sm font-semibold">{encargo.marca}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{encargo.brief}</p>
        <p className="mt-3 text-sm text-muted">
          El aviso no se ve en público hasta que validemos el pago.
        </p>
      </aside>
    </div>
  );
}
