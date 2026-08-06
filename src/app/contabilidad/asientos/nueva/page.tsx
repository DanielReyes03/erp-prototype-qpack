"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Button,
  Select,
  ListBox,
  Label,
  TextField,
  Input,
  NumberField,
  DateField,
  Calendar,
  DatePicker,
  toast,
} from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { nextId } from "@/lib/async";
import { toDateValue, fromDateValue } from "@/lib/date-value";
import { useContabilidadStore } from "@/lib/store/contabilidad";
import { CATALOGO_CUENTAS } from "@/lib/seed/catalogo-cuentas";

const CUENTAS_IMPUTABLES = CATALOGO_CUENTAS.filter((c) => c.imputable);

interface Fila {
  id: string;
  cuentaCodigo: string;
  descripcion: string;
  debe: number;
  haber: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function nuevaFila(): Fila {
  return { id: nextId("row"), cuentaCodigo: "", descripcion: "", debe: 0, haber: 0 };
}

export default function NuevoAsientoManualPage() {
  const router = useRouter();
  const crearAsientoManual = useContabilidadStore((s) => s.crearAsientoManual);

  const [concepto, setConcepto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString());
  const [filas, setFilas] = useState<Fila[]>([nuevaFila(), nuevaFila()]);
  const [isSaving, setIsSaving] = useState(false);

  const totalDebe = round2(filas.reduce((s, f) => s + f.debe, 0));
  const totalHaber = round2(filas.reduce((s, f) => s + f.haber, 0));
  const diferencia = round2(totalDebe - totalHaber);
  const cuadra = Math.abs(diferencia) < 0.01 && totalDebe > 0;

  const filasValidas = useMemo(
    () => filas.every((f) => f.cuentaCodigo && (f.debe > 0 || f.haber > 0) && !(f.debe > 0 && f.haber > 0)),
    [filas],
  );

  const canSave = !!concepto.trim() && filas.length >= 2 && filasValidas && cuadra;

  function updateFila(id: string, patch: Partial<Fila>) {
    setFilas((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeFila(id: string) {
    setFilas((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleSave() {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const poliza = await crearAsientoManual({
        tipo: "manual",
        concepto: concepto.trim(),
        fecha,
        lineas: filas.map((f) => ({
          cuentaCodigo: f.cuentaCodigo,
          descripcion: f.descripcion || (CATALOGO_CUENTAS.find((c) => c.codigo === f.cuentaCodigo)?.nombre ?? ""),
          debe: f.debe,
          haber: f.haber,
        })),
      });
      toast.success("Asiento manual registrado", { description: `Póliza ${poliza.numero}` });
      router.push("/contabilidad/asientos");
    } catch (err) {
      toast.danger("No se pudo registrar el asiento", {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <Link
        href="/contabilidad/asientos"
        className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-700"
      >
        <ArrowLeft className="size-3.5" />
        Asientos manuales
      </Link>

      <PageHeader
        title="Nuevo asiento manual"
        description="El asiento solo puede guardarse cuando el total Debe es igual al total Haber."
        actions={
          <Button isPending={isSaving} isDisabled={!canSave} onPress={handleSave}>
            Guardar asiento
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-surface sm:grid-cols-2">
        <TextField className="flex flex-col gap-1" value={concepto} onChange={setConcepto} isRequired>
          <Label>Concepto</Label>
          <Input placeholder="Ej. Provisión de gastos de fin de mes" />
        </TextField>

        <DatePicker
          className="flex flex-col gap-1"
          value={toDateValue(fecha)}
          onChange={(v) => {
            const iso = fromDateValue(v);
            if (iso) setFecha(new Date(iso).toISOString());
          }}
        >
          <Label>Fecha</Label>
          <DateField.Group fullWidth>
            <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
            <DateField.Suffix>
              <DatePicker.Trigger>
                <DatePicker.TriggerIndicator />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <DatePicker.Popover>
            <Calendar aria-label="Fecha del asiento">
              <Calendar.Header>
                <Calendar.YearPickerTrigger>
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton slot="previous" />
                <Calendar.NavButton slot="next" />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridHeader>
                  {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                </Calendar.GridHeader>
                <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
              </Calendar.Grid>
            </Calendar>
          </DatePicker.Popover>
        </DatePicker>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="h-10 border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                <th className="px-3">Cuenta contable</th>
                <th className="px-3">Descripción</th>
                <th className="w-36 px-3 text-right">Debe</th>
                <th className="w-36 px-3 text-right">Haber</th>
                <th className="w-10 px-3" />
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id} className="h-14 border-b border-slate-100 last:border-b-0">
                  <td className="px-3 py-2">
                    <Select
                      className="flex flex-col gap-1"
                      placeholder="Seleccionar cuenta"
                      value={f.cuentaCodigo || null}
                      onChange={(k) => updateFila(f.id, { cuentaCodigo: k ? String(k) : "" })}
                    >
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {CUENTAS_IMPUTABLES.map((c) => (
                            <ListBox.Item key={c.codigo} id={c.codigo} textValue={`${c.codigo} ${c.nombre}`}>
                              <span className="font-data text-xs text-slate-500">{c.codigo}</span> {c.nombre}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <TextField
                      aria-label="Descripción de la línea"
                      className="flex flex-col gap-1"
                      value={f.descripcion}
                      onChange={(v) => updateFila(f.id, { descripcion: v })}
                    >
                      <Input placeholder="Detalle (opcional)" />
                    </TextField>
                  </td>
                  <td className="px-3 py-2">
                    <NumberField
                      aria-label="Debe"
                      value={f.debe}
                      minValue={0}
                      formatOptions={{ minimumFractionDigits: 2 }}
                      onChange={(v) => updateFila(f.id, { debe: v ?? 0, haber: v ? 0 : f.haber })}
                    >
                      <NumberField.Group>
                        <NumberField.Input className="col-span-3 text-right" />
                      </NumberField.Group>
                    </NumberField>
                  </td>
                  <td className="px-3 py-2">
                    <NumberField
                      aria-label="Haber"
                      value={f.haber}
                      minValue={0}
                      formatOptions={{ minimumFractionDigits: 2 }}
                      onChange={(v) => updateFila(f.id, { haber: v ?? 0, debe: v ? 0 : f.debe })}
                    >
                      <NumberField.Group>
                        <NumberField.Input className="col-span-3 text-right" />
                      </NumberField.Group>
                    </NumberField>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      isIconOnly
                      isDisabled={filas.length <= 2}
                      onPress={() => removeFila(f.id)}
                      aria-label="Eliminar línea"
                    >
                      <Trash2 className="size-4 text-slate-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 p-3">
          <Button variant="ghost" size="sm" onPress={() => setFilas((prev) => [...prev, nuevaFila()])}>
            <Plus className="size-4" />
            Agregar línea
          </Button>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="text-xs text-slate-500">Total Debe</p>
              <MoneyCell amount={totalDebe} className="font-semibold text-slate-900" />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total Haber</p>
              <MoneyCell amount={totalHaber} className="font-semibold text-slate-900" />
            </div>
            {cuadra ? (
              <span className="flex items-center gap-1.5 rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-medium text-[#059669]">
                <CheckCircle2 className="size-3.5" />
                Cuadrado
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-3 py-1 text-xs font-medium text-[#DC2626]">
                <AlertTriangle className="size-3.5" />
                Diferencia {diferencia.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
