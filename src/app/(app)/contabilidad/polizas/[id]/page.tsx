import { notFound } from "next/navigation";
import { PolizaEditor } from "@/components/contabilidad/poliza-editor";
import { polizas } from "@/lib/mock";

export default async function PolizaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poliza = polizas.find((p) => p.id === id);
  if (!poliza) notFound();
  return <PolizaEditor poliza={poliza} />;
}
