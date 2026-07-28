import { notFound } from "next/navigation";
import { EmbarqueExpediente } from "@/components/compras/embarque-expediente";
import { embarques } from "@/lib/mock";

export default async function EmbarqueDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const embarque = embarques.find((e) => e.id === id);
  if (!embarque) notFound();
  return <EmbarqueExpediente embarque={embarque} />;
}
