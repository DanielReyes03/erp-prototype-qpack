import { notFound } from "next/navigation";
import { PedidoDetail } from "@/components/ventas/pedido-detail";
import { pedidos } from "@/lib/mock";

export default async function PedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pedido = pedidos.find((p) => p.id === id);
  if (!pedido) notFound();
  return <PedidoDetail pedido={pedido} />;
}
