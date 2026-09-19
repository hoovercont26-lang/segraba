"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usuarioActual } from "@/lib/auth";
import { getCreador, getEncargo, planActivo, saveReporte, yaReporto } from "@/lib/store";
import { MOTIVOS_REPORTE, type MotivoReporte, type Reporte, type Usuario } from "@/lib/types";

export function ReportarForm({
  presetTipo,
  presetId,
}: {
  presetTipo?: Reporte["contraTipo"];
  presetId?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const tipoParam = (presetTipo || params.get("tipo") || "") as Reporte["contraTipo"] | "";
  const idParam = presetId || params.get("id") || "";

  const [user, setUser] = useState<Usuario | null>(null);
  const [tipo, setTipo] = useState<Reporte["contraTipo"]>(tipoParam === "creador" ? "creador" : "pega");
  const [contraId, setContraId] = useState(idParam);
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [motivo, setMotivo] = useState<MotivoReporte>("no-pago");
  const [detalle, setDetalle] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);
  const [ya, setYa] = useState(false);
  const [fijo, setFijo] = useState(Boolean(idParam));

  useEffect(() => {
    async function load() {
      const current = await usuarioActual();
      setUser(current);
      if (idParam) {
        const item =
          (tipoParam || "pega") === "creador"
            ? await getCreador(idParam)
            : await getEncargo(idParam);
        if (item) {
          setNombre("marca" in item ? item.marca : item.nombre);
          setContacto("whatsapp" in item ? item.whatsapp : "");
          setTipo((tipoParam || "pega") as Reporte["contraTipo"]);
          setContraId(idParam);
          setFijo(true);
        }
        if (current) {
          setYa(await yaReporto(current.id, (tipoParam || "pega") as Reporte["contraTipo"], idParam));
        }
      }
      setReady(true);
    }
    load();
  }, [tipoParam, idParam]);

  if (!ready) return <p className="text-muted">Cargando…</p>;

  if (!user) {
    return (
      <div className="glass rounded-3xl p-6">
        <h2 className="text-xl font-semibold">Entra para reportar</h2>
        <p className="mt-2 text-sm text-muted">
          Así el reporte queda atado a una cuenta, no a un anónimo.
        </p>
        <Link
          href={`/entrar?next=${encodeURIComponent(
            `/reportar${tipoParam && idParam ? `?tipo=${tipoParam}&id=${idParam}` : ""}`,
          )}`}
          className="btn btn-flash mt-5"
        >
          Entrar
        </Link>
      </div>
    );
  }

  const freeBloqueaAviso = tipo === "pega" && !planActivo(user);

  if (ya || ok) {
    return (
      <div className="glass rounded-3xl p-6">
        <p className="seal seal-ok">Reporte enviado</p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Revisamos el caso. Si este perfil junta dos reportes, queda marcado
          para que el resto entre con cuidado.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/cuenta" className="btn btn-flash">
            Ver mis reportes
          </Link>
          <Link href="/pegas" className="btn btn-line">
            Volver a los avisos
          </Link>
        </div>
      </div>
    );
  }

  if (freeBloqueaAviso && fijo) {
    return (
      <div className="glass max-w-lg rounded-3xl p-6">
        <h2 className="text-xl font-semibold">Necesitas un plan</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Con cuenta Free no puedes postular ni reportar avisos. Activa Base o
          Pro para usar esa casilla.
        </p>
        <Link href="/creadores/plan" className="btn btn-flash mt-5">
          Ver planes
        </Link>
      </div>
    );
  }

  return (
    <form
      className="glass max-w-xl space-y-5 rounded-3xl p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        if (tipo === "pega" && !planActivo(user)) {
          setError("Con cuenta Free no puedes reportar avisos. Activa un plan.");
          return;
        }
        if (nombre.trim().length < 2) {
          setError("Pon el nombre del aviso o del creador.");
          return;
        }
        if (detalle.trim().length < 12) {
          setError("Cuenta con más detalle qué pasó (mínimo una frase clara).");
          return;
        }
        try {
          await saveReporte({
            deId: user.id,
            contraTipo: tipo,
            contraId: contraId || `manual-${Date.now().toString(36)}`,
            contraNombre: nombre,
            contacto,
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
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Nuevo reporte</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Datos y qué pasó
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Completa a quién reportas y describe el caso. Queda ligado a tu
          cuenta.
        </p>
      </div>

      <div>
        <span className="text-sm">Reportar a</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`btn ${tipo === "pega" ? "btn-ink" : "btn-line"}`}
            disabled={fijo}
            onClick={() => setTipo("pega")}
          >
            Un aviso
          </button>
          <button
            type="button"
            className={`btn ${tipo === "creador" ? "btn-ink" : "btn-line"}`}
            disabled={fijo}
            onClick={() => setTipo("creador")}
          >
            Un creador
          </button>
        </div>
        {tipo === "pega" && !planActivo(user) ? (
          <p className="mt-2 text-sm text-bad">
            Para reportar avisos necesitas plan Base o Pro.{" "}
            <Link href="/creadores/plan" className="underline underline-offset-4">
              Ver planes
            </Link>
          </p>
        ) : null}
      </div>

      <label className="block">
        <span className="text-sm">
          {tipo === "pega" ? "Nombre del negocio / aviso" : "Nombre del creador"}
        </span>
        <input
          className="field"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={tipo === "pega" ? "La Caleta Barranco" : "Camila Ríos"}
          readOnly={fijo && Boolean(nombre)}
        />
      </label>

      <label className="block">
        <span className="text-sm">WhatsApp o @ (opcional)</span>
        <input
          className="field"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
          placeholder="987654321 o @usuario"
        />
      </label>

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
        <span className="text-sm">Cuéntanos el caso</span>
        <textarea
          className="field min-h-32"
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          placeholder="Ej.: Acordamos S/ 380 por 3 videos. Yapé el lunes y no entregó nada en 5 días."
        />
      </label>

      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <button
        type="submit"
        className="btn btn-flash w-full sm:w-auto"
        disabled={tipo === "pega" && !planActivo(user)}
      >
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
  const [show, setShow] = useState(tipo !== "pega");

  useEffect(() => {
    if (tipo !== "pega") {
      setShow(true);
      return;
    }
    usuarioActual().then((user) => {
      setShow(planActivo(user));
    });
  }, [tipo]);

  if (!show) return null;

  return (
    <Link
      href={`/reportar?tipo=${tipo}&id=${id}`}
      className="text-sm text-muted underline underline-offset-4 hover:text-ink"
    >
      Reportar
    </Link>
  );
}
