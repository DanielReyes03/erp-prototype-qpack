import { notFound } from "next/navigation";
import { CotizacionEditor } from "@/components/ventas/cotizacion-editor";
import { cotizaciones } from "@/lib/mock";

export default async function CotizacionDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cotizacion = cotizaciones.find((c) => c.id === id);
  if (!cotizacion) notFound();
  return <CotizacionEditor cotizacion={cotizacion} />;
}
