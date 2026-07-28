"use client";

import { LogOut, Settings, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usuarios } from "@/lib/mock";

const usuarioActivo = usuarios[0];

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {usuarioActivo.avatarIniciales}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm font-medium">{usuarioActivo.nombre}</span>
          <span className="text-xs font-normal text-muted-foreground">{usuarioActivo.cargo}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast.info("Perfil de usuario", { description: "Pantalla no incluida en el prototipo." })}>
          <UserCircle />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info("Preferencias", { description: "Configura parametros en Administracion > Parametros." })}>
          <Settings />
          Preferencias
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => toast.success("Sesion cerrada (simulado)")}>
          <LogOut />
          Cerrar sesion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
