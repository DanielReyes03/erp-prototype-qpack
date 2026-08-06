import { CLIENTES_SEED } from "@/lib/seed/clientes";

export function clienteDe(id: string) {
  return CLIENTES_SEED.find((c) => c.id === id);
}

export const TIPO_DTE_LABEL: Record<string, string> = {
  FACT: "Factura",
  NCRE: "Nota de crédito",
  NDEB: "Nota de débito",
};
