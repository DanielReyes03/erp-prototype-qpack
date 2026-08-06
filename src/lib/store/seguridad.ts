import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import { USUARIOS_SEED, type Usuario } from "@/lib/seed/usuarios";
import { ROLES_SEED, ACCESO_TOTAL, type Rol, type ModuloKey } from "@/lib/seed/roles";

export type UsuarioInput = Omit<Usuario, "id" | "createdAt">;

interface SeguridadState {
  usuarios: Usuario[];
  roles: Rol[];
  currentUserId: string;
  createUsuario: (input: UsuarioInput) => Promise<Usuario>;
  updateUsuario: (id: string, input: UsuarioInput) => Promise<Usuario>;
  deleteUsuario: (id: string) => Promise<void>;
  setActivo: (id: string, activo: boolean) => Promise<void>;
  actualizarPermisos: (rolId: string, permisos: Record<ModuloKey, boolean>) => Promise<Rol>;
  setCurrentUser: (id: string) => void;
}

export const useSeguridadStore = create<SeguridadState>()(
  persist(
    (set, get) => ({
      usuarios: USUARIOS_SEED,
      roles: ROLES_SEED,
      currentUserId: "usr-001",

      async createUsuario(input) {
        await sleep();
        const usuario: Usuario = { ...input, id: nextId("usr"), createdAt: new Date().toISOString() };
        set({ usuarios: [usuario, ...get().usuarios] });
        return usuario;
      },

      async updateUsuario(id, input) {
        await sleep();
        const existing = get().usuarios.find((u) => u.id === id);
        const updated: Usuario = { ...input, id, createdAt: existing?.createdAt ?? new Date().toISOString() };
        set({ usuarios: get().usuarios.map((u) => (u.id === id ? updated : u)) });
        return updated;
      },

      async deleteUsuario(id) {
        await sleep();
        set({ usuarios: get().usuarios.filter((u) => u.id !== id) });
      },

      async setActivo(id, activo) {
        await sleep();
        set({ usuarios: get().usuarios.map((u) => (u.id === id ? { ...u, activo } : u)) });
      },

      async actualizarPermisos(rolId, permisos) {
        await sleep();
        const updated = get().roles.map((r) => (r.id === rolId ? { ...r, permisos } : r));
        set({ roles: updated });
        return updated.find((r) => r.id === rolId)!;
      },

      setCurrentUser(id) {
        set({ currentUserId: id });
      },
    }),
    { name: "qpack-seguridad", skipHydration: true },
  ),
);

/** Permisos por módulo del usuario actualmente "logueado" en la demo; reactivo a cambios de usuario, rol o matriz de permisos. */
export function usePermisosActuales(): Record<ModuloKey, boolean> {
  const currentUserId = useSeguridadStore((s) => s.currentUserId);
  const usuarios = useSeguridadStore((s) => s.usuarios);
  const roles = useSeguridadStore((s) => s.roles);
  const usuario = usuarios.find((u) => u.id === currentUserId);
  const rol = roles.find((r) => r.id === usuario?.rolId);
  return rol?.permisos ?? ACCESO_TOTAL;
}

export function useUsuarioActual(): Usuario | undefined {
  const currentUserId = useSeguridadStore((s) => s.currentUserId);
  const usuarios = useSeguridadStore((s) => s.usuarios);
  return usuarios.find((u) => u.id === currentUserId);
}
