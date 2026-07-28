"use client";

import * as React from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parametrosSistema } from "@/lib/mock";

const categorias = Array.from(new Set(parametrosSistema.map((p) => p.categoria)));

export default function ParametrosPage() {
  const [valores, setValores] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(parametrosSistema.map((p) => [p.id, p.valor]))
  );

  function handleGuardar(categoria: string) {
    toast.success(`Parametros de ${categoria} guardados`, { description: "Los cambios se aplican de forma simulada en este prototipo." });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Parametros del sistema" description="Configuracion general de los modulos del ERP." />

      {categorias.map((categoria) => (
        <Card key={categoria}>
          <CardHeader>
            <CardTitle>{categoria}</CardTitle>
            <CardDescription>Parametros de configuracion del modulo de {categoria.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {parametrosSistema
              .filter((p) => p.categoria === categoria)
              .map((p) => (
                <div key={p.id} className="grid grid-cols-1 items-start gap-2 sm:grid-cols-3 sm:items-center sm:gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium">{p.clave}</Label>
                    <p className="text-xs text-muted-foreground">{p.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={valores[p.id]}
                      disabled={!p.editable}
                      onChange={(e) => setValores((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    />
                    {!p.editable && <Badge variant="outline">Fijo</Badge>}
                  </div>
                </div>
              ))}
            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => handleGuardar(categoria)}>
                <Save />
                Guardar cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
