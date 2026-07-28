"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface QuickCreateField {
  id: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "select" | "number";
  required?: boolean;
  options?: { label: string; value: string }[];
}

export function QuickCreateDialog({
  trigger,
  title,
  description,
  fields,
  submitLabel = "Guardar",
  successMessage,
  onCreated,
}: {
  trigger: React.ReactElement;
  title: string;
  description?: string;
  fields: QuickCreateField[];
  submitLabel?: string;
  successMessage?: string;
  onCreated?: (values: Record<string, string>) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function reset() {
    setValues({});
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    for (const f of fields) {
      if (f.required && !values[f.id]?.trim()) {
        nextErrors[f.id] = "Este campo es obligatorio.";
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onCreated?.(values);
    toast.success(successMessage ?? `${title} registrado`, {
      description: "Los datos se guardaron en el prototipo (simulado, sin persistencia real).",
    });
    setOpen(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.id} className={cn("flex flex-col gap-1.5", f.type === "textarea" && "sm:col-span-2")}>
                <Label htmlFor={f.id}>
                  {f.label}
                  {f.required && <span className="text-destructive"> *</span>}
                </Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.id}
                    placeholder={f.placeholder}
                    value={values[f.id] ?? ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [f.id]: e.target.value }))}
                    aria-invalid={!!errors[f.id]}
                    className={cn(errors[f.id] && "border-destructive")}
                  />
                ) : f.type === "select" ? (
                  <Select
                    value={values[f.id] ?? ""}
                    onValueChange={(v) => setValues((prev) => ({ ...prev, [f.id]: (v as string) ?? "" }))}
                  >
                    <SelectTrigger className={cn("w-full", errors[f.id] && "border-destructive")}>
                      <SelectValue placeholder={f.placeholder ?? "Selecciona una opcion"} />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={f.id}
                    type={f.type === "number" ? "number" : "text"}
                    placeholder={f.placeholder}
                    value={values[f.id] ?? ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [f.id]: e.target.value }))}
                    aria-invalid={!!errors[f.id]}
                    className={cn(errors[f.id] && "border-destructive")}
                  />
                )}
                {errors[f.id] && <p className="text-xs text-destructive">{errors[f.id]}</p>}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
