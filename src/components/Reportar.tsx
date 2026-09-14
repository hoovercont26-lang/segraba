"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usuarioActual } from "@/lib/auth";
import { getCreador, getEncargo, saveReporte, yaReporto } from "@/lib/store";
import { MOTIVOS_REPORTE, type MotivoReporte, type Reporte } from "@/lib/types";

export function ReportarForm({
  presetTipo,
  presetId,
}: {
  presetTipo?: Reporte["contraTipo"];
  presetId?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const tipo = (presetTipo || params.get("tipo") || "pega") as Reporte["contraTipo"];
  const id = presetId || params.get("id") || "";
  const [motivo, setMotivo] = useState<MotivoReporte>("no-pago");
  const [detalle, setDetalle] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState(false);
  const [ya, setYa] = useState(false);

  const target =
    tipo === "pega" ? getEncargo(id)?.marca : getCreador(id)?.nombre;

  useEffect(() => {
    const user = usuarioActual();
    setLogged(Boolean(user));
    setYa(user ? yaReporto(user.id, tipo, id) : false);
    setReady(true);
  }, [tipo, id]);

  if (!ready) return <p className="text-muted">Cargando…</p>;

  if (!logged) {
    return (
      <div className="glass rounded-3xl p-6">
        <h2 className="text-xl font-semibold">Entra para reportar</h2>
        <p className="mt-2 text-sm text-muted">
          Así el reporte queda atado a una cuenta, no a un anónimo.
        </p>
        <Link
          href={`/entrar?next=${encodeURIComponent(`/reportar?tipo=${tipo}&id=${id}`)}`}
          className="btn btn-flash mt-5"
        >
          Entrar
        </Link>
      </div>
    );
  }

  if (!id || !target) {
    return (
      <p className="text-muted">
        Falta el aviso o el perfil. Ábrelo desde la pega o el creador.
      </p>
    );
  }

  if (ya || ok) {
    return (
      <div className="glass rounded-3xl p-6">
        <p className="seal seal-ok">Reporte enviado</p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Si este perfil junta dos reportes, queda marcado para que el
          resto entre con cuidado.
        </p>
        <Link href="/pegas" className="btn btn-line mt-5">
          Volver a la pega
        </Link>
      </div>
    );
  }

  return (
    <form
      className="glass max-w-lg space-y-4 rounded-3xl p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const user = usuarioActual();
        if (!user) return;
        if (detalle.trim().length < 8) {
          setError("Cuenta en una frase qué pasó.");
          return;
        }
        try {
          saveReporte({
            deId: user.id,
            contraTipo: tipo,
            contraId: id,
            motivo,
            detalle,
          });
          setOk(true);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "No se pudo reportar.");
        }
      }}
    >
      <p className="text-xs uppercase tracking-[0.14em] text-muted">
        Reportar {tipo === "pega" ? "aviso" : "creador"}
      </p>
      <h2 className="text-2xl font-semibold tracking-tight">{target}</h2>
      <label className="block">
        <span className="text-sm">Qué pasó</span>
        <select
          className="field"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value as MotivoReporte)}
        >
          {MOTIVOS_REPORTE.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm">Detalle</span>
        <textarea
          className="field min-h-28"
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          placeholder="Acordamos S/ 380. Yapé y no mandó el video."
        />
      </label>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <button type="submit" className="btn btn-flash w-full sm:w-auto">
        Enviar reporte
      </button>
    </form>
  );
}

export function ReportLink({
  tipo,
  id,
}: {
  tipo: Reporte["contraTipo"];
  id: string;
}) {
  return (
    <Link
      href={`/reportar?tipo=${tipo}&id=${id}`}
      className="text-sm text-muted underline underline-offset-4 hover:text-ink"
    >
      Reportar
    </Link>
  );
}
