import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";

export function clienteDe(id: string) {
  return CLIENTES_SEED.find((c) => c.id === id);
}
export function vendedorDe(id: string) {
  return VENDEDORES_SEED.find((v) => v.id === id);
}
