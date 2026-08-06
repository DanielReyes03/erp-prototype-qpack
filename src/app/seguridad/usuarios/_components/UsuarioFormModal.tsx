"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormTextField, FormSelect, FormSwitch } from "@/components/patterns/form-fields";
import { useSeguridadStore } from "@/lib/store/seguridad";
import type { Usuario } from "@/lib/seed/usuarios";
import { usuarioSchema, EMPTY_USUARIO_FORM, type UsuarioFormValues } from "./usuario-schema";

interface UsuarioFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: Usuario;
}

function toFormValues(u: Usuario): UsuarioFormValues {
  return {
    nombre: u.nombre,
    email: u.email,
    telefono: u.telefono,
    rolId: u.rolId,
    activo: u.activo,
  };
}

export function UsuarioFormModal({ isOpen, onOpenChange, usuario }: UsuarioFormModalProps) {
  const roles = useSeguridadStore((s) => s.roles);
  const createUsuario = useSeguridadStore((s) => s.createUsuario);
  const updateUsuario = useSeguridadStore((s) => s.updateUsuario);
  const isEditing = !!usuario;

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: usuario ? toFormValues(usuario) : EMPTY_USUARIO_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(usuario ? toFormValues(usuario) : EMPTY_USUARIO_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, usuario]);

  async function handleSubmit(values: UsuarioFormValues) {
    if (isEditing && usuario) {
      await updateUsuario(usuario.id, values);
      toast.success("Usuario actualizado", { description: values.nombre });
    } else {
      await createUsuario(values);
      toast.success("Usuario creado", { description: values.nombre });
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar usuario" : "Nuevo usuario"}
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? "Guardar cambios" : "Crear usuario"}
    >
      <FormTextField control={form.control} name="nombre" label="Nombre completo" isRequired />
      <FormTextField control={form.control} name="email" label="Correo" type="email" isRequired />
      <FormTextField control={form.control} name="telefono" label="Teléfono" isRequired />
      <FormSelect
        control={form.control}
        name="rolId"
        label="Rol"
        isRequired
        options={roles.map((r) => ({ id: r.id, label: r.nombre, description: r.descripcion }))}
      />
      <FormSwitch control={form.control} name="activo" label="Usuario activo" />
    </FormModal>
  );
}
