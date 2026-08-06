"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ban, Printer } from "lucide-react";
import { Button } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { StatusChip } from "@/components/patterns/StatusChip";
import { EmptyState } from "@/components/patterns/EmptyState";
import { AnularDocumentoModal } from "@/components/patterns/AnularDocumentoModal";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { formatDate, formatDateTime } from "@/lib/format";
import { computeLineBase, computeTotals } from "@/components/patterns/LineItemsEditor";
import { useDteStore } from "@/lib/store/dte";
import { clienteDe, TIPO_DTE_LABEL } from "../_components/dte-helpers";

export default function DteDetallePage() {
  const params = useParams<{ id: string }>();
  const documentos = useDteStore((s) => s.documentos);
  const anular = useDteStore((s) => s.anular);
  const [anularOpen, setAnularOpen] = useState(false);

  const dte = documentos.find((d) => d.id === params.id);

  if (!dte) {
    return <EmptyState size="page" title="Documento no encontrado" description="El DTE solicitado no existe." />;
  }

  const cliente = clienteDe(dte.clienteId);
  const totales = computeTotals(dte.lineas);

  return (
    <div>
      <Link href="/dte" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-700 print:hidden">
        <ArrowLeft className="size-3.5" />
        Documentos DTE
      </Link>

      <PageHeader
        title={`${dte.serie}-${dte.numero}`}
        description={TIPO_DTE_LABEL[dte.tipo]}
        actions={
          <div className="flex items-center gap-2 print:hidden">
            <StatusChip status={`dte:${dte.estado}`} />
            <Button variant="secondary" onPress={() => window.print()}>
              <Printer className="size-4" />
              Imprimir
            </Button>
            {dte.estado === "certificado" ? (
              <Button variant="danger-soft" onPress={() => setAnularOpen(true)}>
                <Ban className="size-4" />
                Anular
              </Button>
            ) : null}
          </div>
        }
      />

      {dte.estado === "anulado" && dte.motivoAnulacion ? (
        <div className="mb-4 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
          Anulado el {dte.fechaAnulacion ? formatDate(dte.fechaAnulacion) : ""}: {dte.motivoAnulacion}
        </div>
      ) : null}
      {dte.estado === "rechazado" ? (
        <div className="mb-4 rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#D97706]">
          Este documento fue rechazado por el certificador y no tiene validez fiscal.
        </div>
      ) : null}

      {/* Representación gráfica del DTE */}
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white shadow-surface p-8 print:border-0 print:shadow-none">
        <div className="mb-6 flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <p className="text-lg font-semibold text-navy-900">QPack Importadora, S.A.</p>
            <p className="text-sm text-slate-500">NIT 1000000-3</p>
            <p className="text-sm text-slate-500">Calzada Aguilar Batres 32-40, zona 12, Guatemala</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-blue-700">
              {TIPO_DTE_LABEL[dte.tipo]} ELECTRÓNICA
            </p>
            <p className="font-data text-sm text-slate-900">
              Serie {dte.serie} · No. {dte.numero}
            </p>
            <p className="font-data mt-1 text-[11px] break-all text-slate-500">UUID: {dte.uuid}</p>
            <p className="text-xs text-slate-500">
              Certificado: {formatDateTime(dte.fechaCertificacion)}
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Cliente</p>
            <p className="text-sm font-medium text-slate-900">{cliente?.nombreComercial}</p>
            <p className="text-sm text-slate-500">{cliente?.razonSocial}</p>
            <p className="font-data text-sm text-slate-500">NIT {cliente?.nit}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Dirección</p>
            <p className="text-sm text-slate-500">{cliente?.direccion}</p>
            <p className="text-sm text-slate-500">{cliente?.zona}</p>
          </div>
        </div>

        <table className="mb-4 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              <th className="pb-2">Descripción</th>
              <th className="pb-2 text-right">Cant.</th>
              <th className="pb-2 text-right">Precio unit.</th>
              <th className="pb-2 text-right">IVA</th>
              <th className="pb-2 text-right">Total línea</th>
            </tr>
          </thead>
          <tbody>
            {dte.lineas.map((l) => {
              const base = computeLineBase(l);
              const iva = Math.round(base * 0.12 * 100) / 100;
              return (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="py-2 text-slate-900">{l.nombre}</td>
                  <td className="font-data py-2 text-right">{l.cantidad}</td>
                  <td className="py-2 text-right">
                    <MoneyCell amount={l.precioUnitario} currency={dte.moneda} />
                  </td>
                  <td className="py-2 text-right">
                    <MoneyCell amount={iva} currency={dte.moneda} />
                  </td>
                  <td className="py-2 text-right">
                    <MoneyCell amount={base + iva} currency={dte.moneda} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Base gravable</span>
              <MoneyCell amount={totales.baseGravable} currency={dte.moneda} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">IVA (12%)</span>
              <MoneyCell amount={totales.iva} currency={dte.moneda} />
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-semibold">
              <span>Total</span>
              <span className="font-data text-blue-700">
                <MoneyCell amount={totales.total} currency={dte.moneda} />
              </span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-400">
          Certificado electrónicamente ante la SAT — representación gráfica de un Documento
          Tributario Electrónico (DTE). Prototipo de demostración, sin validez fiscal real.
        </p>
      </div>

      <AnularDocumentoModal
        isOpen={anularOpen}
        onOpenChange={setAnularOpen}
        documentoLabel={`${dte.serie}-${dte.numero}`}
        onConfirm={async (motivo) => {
          await anular(dte.id, motivo);
        }}
      />
    </div>
  );
}
