import { MoneyCell } from "@/components/patterns/MoneyCell";
import { formatDate } from "@/lib/format";
import { cuentaDe } from "@/lib/seed/catalogo-cuentas";
import type { Poliza } from "@/lib/seed/polizas";

const TIPO_LABEL: Record<string, string> = {
  venta: "Venta",
  compra: "Compra",
  cobro: "Cobro",
  pago: "Pago",
  gasto: "Gasto",
  manual: "Asiento manual",
};

/** Representación de una póliza contable con sus partidas de debe/haber. */
export function PolizaCard({ poliza }: { poliza: Poliza }) {
  const totalDebe = poliza.lineas.reduce((s, l) => s + l.debe, 0);
  const totalHaber = poliza.lineas.reduce((s, l) => s + l.haber, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-surface">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <p className="font-data text-sm font-medium text-slate-900">
            Póliza {poliza.numero} · {TIPO_LABEL[poliza.tipo] ?? poliza.tipo}
          </p>
          <p className="text-xs text-slate-500">
            {poliza.concepto} · {formatDate(poliza.fecha)}
          </p>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <th className="px-4 py-2">Cuenta</th>
            <th className="px-4 py-2 text-right">Debe</th>
            <th className="px-4 py-2 text-right">Haber</th>
          </tr>
        </thead>
        <tbody>
          {poliza.lineas.map((linea) => (
            <tr key={linea.id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-2">
                <p className="text-slate-900">{cuentaDe(linea.cuentaCodigo)?.nombre ?? linea.descripcion}</p>
                <p className="font-data text-xs text-slate-500">{linea.cuentaCodigo}</p>
              </td>
              <td className="px-4 py-2 text-right">
                {linea.debe > 0 ? <MoneyCell amount={linea.debe} /> : <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-2 text-right">
                {linea.haber > 0 ? <MoneyCell amount={linea.haber} /> : <span className="text-slate-300">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-200 font-medium">
            <td className="px-4 py-2 text-right text-xs text-slate-500 uppercase">Totales</td>
            <td className="px-4 py-2 text-right">
              <MoneyCell amount={totalDebe} className="font-semibold text-slate-900" />
            </td>
            <td className="px-4 py-2 text-right">
              <MoneyCell amount={totalHaber} className="font-semibold text-slate-900" />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
