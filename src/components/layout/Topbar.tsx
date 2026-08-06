"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, RotateCcw, Building2, ChevronDown, UserCog } from "lucide-react";
import { Button, Dropdown, Label, Description, Popover, Kbd, Avatar, Badge, Separator } from "@heroui/react";
import { useUiStore } from "@/lib/store/ui";
import { resetDemoData } from "@/lib/store/reset";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { useSeguridadStore, useUsuarioActual } from "@/lib/store/seguridad";
import { Breadcrumb } from "./Breadcrumb";

const COMPANIES = [
  { id: "qpack-gt", name: "QPack Importadora, S.A." },
  { id: "qpack-occidente", name: "QPack Occidente, S.A." },
];

const NOTIFICATIONS = [
  {
    id: "n1",
    title: "5 documentos DTE pendientes de certificar",
    time: "hace 12 min",
  },
  {
    id: "n2",
    title: "Orden de venta OV-000231 lista para despacho",
    time: "hace 1 hora",
  },
  {
    id: "n3",
    title: "Cliente Distribuidora El Progreso superó su límite de crédito",
    time: "hace 3 horas",
  },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Topbar() {
  const router = useRouter();
  const activeCompanyId = useUiStore((s) => s.activeCompanyId);
  const setActiveCompanyId = useUiStore((s) => s.setActiveCompanyId);
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const [isResetOpen, setResetOpen] = useState(false);

  const usuarios = useSeguridadStore((s) => s.usuarios);
  const roles = useSeguridadStore((s) => s.roles);
  const setCurrentUser = useSeguridadStore((s) => s.setCurrentUser);
  const usuarioActual = useUsuarioActual();
  const rolActual = roles.find((r) => r.id === usuarioActual?.rolId);

  const activeCompany = COMPANIES.find((c) => c.id === activeCompanyId) ?? COMPANIES[0];

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-4 sm:gap-4">
      <div className="min-w-0 flex-1">
        <Breadcrumb />
      </div>

      <button
        type="button"
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 hover:border-slate-300 hover:bg-white xl:flex"
      >
        <Search className="size-4" />
        <span>Buscar…</span>
        <Kbd variant="light" className="ms-6">
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>K</Kbd.Content>
        </Kbd>
      </button>

      <Button
        isIconOnly
        variant="ghost"
        className="xl:hidden"
        aria-label="Buscar"
        onPress={() => setCommandPaletteOpen(true)}
      >
        <Search className="size-4" />
      </Button>

      <Dropdown>
        <Button variant="ghost" className="gap-2 text-slate-700">
          <Building2 className="size-4 text-slate-500" />
          <span className="hidden max-w-[160px] truncate lg:inline">{activeCompany.name}</span>
          <ChevronDown className="size-3.5 text-slate-500" />
        </Button>
        <Dropdown.Popover className="min-w-[260px]">
          <Dropdown.Menu
            selectionMode="single"
            selectedKeys={new Set([activeCompanyId])}
            onSelectionChange={(keys) => {
              const [id] = Array.from(keys);
              if (typeof id === "string") setActiveCompanyId(id);
            }}
          >
            {COMPANIES.map((company) => (
              <Dropdown.Item key={company.id} id={company.id} textValue={company.name}>
                <Dropdown.ItemIndicator />
                <Label>{company.name}</Label>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <Popover>
        <Button isIconOnly variant="ghost" aria-label="Notificaciones" className="relative">
          <Badge.Anchor>
            <Bell className="size-4.5" />
            <Badge color="danger" size="sm" />
          </Badge.Anchor>
        </Button>
        <Popover.Content className="w-[340px]" placement="bottom end">
          <Popover.Dialog>
            <Popover.Heading className="px-1 pb-2 text-sm font-semibold">
              Notificaciones
            </Popover.Heading>
            <ul className="flex flex-col divide-y divide-slate-200">
              {NOTIFICATIONS.map((n) => (
                <li key={n.id} className="px-1 py-2.5 text-sm">
                  <p className="text-slate-900">{n.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{n.time}</p>
                </li>
              ))}
            </ul>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>

      <Button isIconOnly variant="ghost" className="xl:hidden" aria-label="Restablecer datos de demo" onPress={() => setResetOpen(true)}>
        <RotateCcw className="size-4" />
      </Button>
      <Button variant="ghost" className="hidden gap-2 text-slate-700 xl:flex" onPress={() => setResetOpen(true)}>
        <RotateCcw className="size-4" />
        <span>Restablecer datos de demo</span>
      </Button>

      <Dropdown>
        <Dropdown.Trigger className="rounded-full">
          <Avatar size="sm">
            <Avatar.Fallback>{usuarioActual ? initials(usuarioActual.nombre) : "?"}</Avatar.Fallback>
          </Avatar>
        </Dropdown.Trigger>
        <Dropdown.Popover className="min-w-[260px]">
          <div className="px-3 pt-3 pb-2">
            <p className="text-sm leading-5 font-medium text-slate-900">{usuarioActual?.nombre ?? "—"}</p>
            <p className="text-xs leading-none text-slate-500">{rolActual?.nombre ?? "—"}</p>
          </div>
          <Dropdown.Menu onAction={(key) => key === "seguridad" && router.push("/seguridad/usuarios")}>
            <Dropdown.Item id="seguridad" textValue="Usuarios y roles">
              <UserCog className="size-4 text-slate-500" />
              <Label>Usuarios y roles</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
          <Separator />
          <div className="px-3 pt-2 pb-1">
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              Cambiar usuario (demo)
            </p>
          </div>
          <Dropdown.Menu
            selectionMode="single"
            selectedKeys={new Set(usuarioActual ? [usuarioActual.id] : [])}
            onSelectionChange={(keys) => {
              const [id] = Array.from(keys);
              if (typeof id === "string") setCurrentUser(id);
            }}
          >
            {usuarios
              .filter((u) => u.activo)
              .map((u) => {
                const rol = roles.find((r) => r.id === u.rolId);
                return (
                  <Dropdown.Item key={u.id} id={u.id} textValue={u.nombre}>
                    <Dropdown.ItemIndicator />
                    <div className="flex flex-col">
                      <Label>{u.nombre}</Label>
                      <Description>{rol?.nombre}</Description>
                    </div>
                  </Dropdown.Item>
                );
              })}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <ConfirmDialog
        isOpen={isResetOpen}
        onOpenChange={setResetOpen}
        status="warning"
        title="¿Restablecer los datos de demostración?"
        description="Se borrará todo el estado actual (clientes, documentos, inventario, contabilidad, etc.) y se volverá a sembrar la información de demo desde cero. Esta acción no se puede deshacer."
        confirmLabel="Restablecer"
        onConfirm={async () => {
          resetDemoData();
        }}
      />
    </header>
  );
}
