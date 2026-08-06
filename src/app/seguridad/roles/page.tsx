"use client";

import { Checkbox, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { useSeguridadStore } from "@/lib/store/seguridad";
import { MODULOS, type ModuloKey } from "@/lib/seed/roles";

export default function RolesPage() {
  const roles = useSeguridadStore((s) => s.roles);
  const actualizarPermisos = useSeguridadStore((s) => s.actualizarPermisos);

  async function toggle(rolId: string, moduloKey: ModuloKey, current: boolean) {
    const rol = roles.find((r) => r.id === rolId);
    if (!rol) return;
    await actualizarPermisos(rolId, { ...rol.permisos, [moduloKey]: !current });
  }

  return (
    <div>
      <PageHeader
        title="Roles y permisos"
        description="Matriz de acceso por módulo; los cambios ocultan o muestran secciones del menú en tiempo real según el usuario activo."
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="h-12 border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                <th className="sticky left-0 z-10 min-w-[220px] bg-slate-50 px-4">Rol</th>
                {MODULOS.map((m) => (
                  <th key={m.key} className="min-w-[110px] px-2 text-center">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((rol) => {
                const isAdmin = rol.id === "rol-admin";
                return (
                  <tr key={rol.id} className="h-16 border-b border-slate-100 last:border-b-0">
                    <td className="sticky left-0 z-10 min-w-[220px] bg-white px-4 py-2">
                      <p className="font-medium text-slate-900">{rol.nombre}</p>
                      <p className="text-xs text-slate-500">{rol.descripcion}</p>
                    </td>
                    {MODULOS.map((m) => (
                      <td key={m.key} className="px-2 text-center">
                        <Checkbox
                          aria-label={`${rol.nombre} — ${m.label}`}
                          isSelected={rol.permisos[m.key]}
                          isDisabled={isAdmin}
                          onChange={async () => {
                            await toggle(rol.id, m.key, rol.permisos[m.key]);
                            toast.success("Permisos actualizados", {
                              description: `${rol.nombre} · ${m.label}`,
                            });
                          }}
                        >
                          <Checkbox.Content>
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                          </Checkbox.Content>
                        </Checkbox>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
