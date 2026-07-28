import { notFound } from "next/navigation";
import { DteDetail } from "@/components/facturacion/dte-detail";
import { dtesEmitidos } from "@/lib/mock";

export default async function DteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dte = dtesEmitidos.find((d) => d.id === id);
  if (!dte) notFound();
  return <DteDetail dte={dte} />;
}
