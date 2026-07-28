import { notFound } from "next/navigation";
import { RecepcionMovil } from "@/components/compras/recepcion-movil";
import { recepciones } from "@/lib/mock";

export default async function RecepcionMovilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recepcion = recepciones.find((r) => r.id === id);
  if (!recepcion) notFound();
  return <RecepcionMovil recepcion={recepcion} />;
}
