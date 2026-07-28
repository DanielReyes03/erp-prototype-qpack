"use client";

import * as React from "react";
import { Download, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./empty-state";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface DataTableFilter {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  filters?: DataTableFilter[];
  statusOptions?: FilterOption[];
  getStatus?: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  toolbarExtra?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
  pageSize?: number;
  exportFileName?: string;
  exportRow?: (row: T) => Record<string, string | number>;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchPlaceholder = "Buscar...",
  searchFn,
  filters = [],
  statusOptions,
  getStatus,
  onRowClick,
  rowActions,
  toolbarExtra,
  emptyTitle,
  emptyDescription,
  loading = false,
  pageSize = 10,
  exportFileName = "exportacion",
  exportRow,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<string>("todos");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    let rows = data;
    if (query && searchFn) {
      rows = rows.filter((r) => searchFn(r, query.toLowerCase()));
    }
    for (const f of filters) {
      const val = filterValues[f.id];
      if (val && val !== "todos") {
        rows = rows.filter((r) => (r as Record<string, unknown>)[f.id] === val || String((r as Record<string, unknown>)[f.id]) === val);
      }
    }
    if (getStatus && status !== "todos") {
      rows = rows.filter((r) => getStatus(r) === status);
    }
    return rows;
  }, [data, query, searchFn, filters, filterValues, getStatus, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function setQueryAndResetPage(value: string) {
    setQuery(value);
    setPage(1);
  }

  function setFilterValueAndResetPage(id: string, value: string) {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
    setPage(1);
  }

  function setStatusAndResetPage(value: string) {
    setStatus(value);
    setPage(1);
  }

  function handleExport() {
    if (!exportRow || filtered.length === 0) {
      toast.info("Exportando datos", { description: "Se generara un archivo con los registros filtrados (simulado)." });
      return;
    }
    const rows = filtered.map(exportRow);
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Archivo exportado", { description: `${rows.length} registros exportados a ${exportFileName}.csv` });
  }

  const activeFilterCount = Object.values(filterValues).filter((v) => v && v !== "todos").length + (status !== "todos" ? 1 : 0) + (query ? 1 : 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {searchFn && (
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQueryAndResetPage(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8"
              />
            </div>
          )}
          {filters.map((f) => (
            <Select
              key={f.id}
              value={filterValues[f.id] ?? "todos"}
              onValueChange={(v) => setFilterValueAndResetPage(f.id, (v as string) ?? "todos")}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">{f.label}: todos</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-muted-foreground"
              onClick={() => {
                setQuery("");
                setFilterValues({});
                setStatus("todos");
                setPage(1);
              }}
            >
              <X className="size-3.5" />
              Limpiar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {toolbarExtra}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-3.5" />
            Exportar
          </Button>
        </div>
      </div>

      {statusOptions && getStatus && (
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusChip label={`Todos (${data.length})`} active={status === "todos"} onClick={() => setStatusAndResetPage("todos")} />
          {statusOptions.map((opt) => {
            const count = data.filter((r) => getStatus(r) === opt.value).length;
            return (
              <StatusChip
                key={opt.value}
                label={`${opt.label} (${count})`}
                active={status === opt.value}
                onClick={() => setStatusAndResetPage(opt.value)}
              />
            );
          })}
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((col) => (
                <TableHead key={col.id} className={cn("whitespace-nowrap", col.headerClassName)}>
                  {col.header}
                </TableHead>
              ))}
              {rowActions && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell>
                      <Skeleton className="h-4 w-6" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : pageRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length + (rowActions ? 1 : 0)} className="p-0">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                      {rowActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && filtered.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Mostrando {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} de {filtered.length} registros
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-16 text-center text-xs text-muted-foreground">
              Pag. {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className="cursor-pointer select-none rounded-full px-2.5 py-1 font-normal"
    >
      {label}
    </Badge>
  );
}
