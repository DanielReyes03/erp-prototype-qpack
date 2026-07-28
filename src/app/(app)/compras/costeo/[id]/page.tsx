import { notFound } from "next/navigation";
import { CosteoDetail } from "@/components/compras/costeo-detail";
import { costeosImportacion } from "@/lib/mock";

export default async function CosteoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const costeo = costeosImportacion.find((c) => c.id === id);
  if (!costeo) notFound();
  return <CosteoDetail costeo={costeo} />;
}
