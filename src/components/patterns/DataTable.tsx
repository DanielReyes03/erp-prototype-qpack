"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { EllipsisVertical } from "lucide-react";
import {
  Table,
  Checkbox,
  Dropdown,
  Label,
  Pagination,
  Skeleton,
  Button,
  type Selection,
  type SortDescriptor,
} from "@heroui/react";
import { cn } from "@/lib/cn";
import { EmptyState } from "./EmptyState";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortAccessor?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  width?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableRowAction<T> {
  key: string;
  label: string;
  icon?: LucideIcon;
  onSelect: (row: T) => void;
  isDanger?: boolean;
  isDisabled?: (row: T) => boolean;
}

interface DataTableProps<T> {
  ariaLabel: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  rowActions?: DataTableRowAction<T>[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectedIdsChange?: (ids: Set<string>) => void;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  className?: string;
}

const ALIGN_CLASS: Record<NonNullable<DataTableColumn<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function DataTable<T>({
  ariaLabel,
  columns,
  rows,
  getRowId,
  isLoading = false,
  emptyTitle = "Sin resultados",
  emptyDescription = "No se encontraron registros con los filtros actuales.",
  rowActions,
  selectable = false,
  selectedIds,
  onSelectedIdsChange,
  pageSize = 25,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | undefined>(undefined);
  const [page, setPage] = useState(1);

  const sortedRows = useMemo(() => {
    if (!sortDescriptor) return rows;
    const column = columns.find((c) => c.key === sortDescriptor.column);
    if (!column?.sortAccessor) return rows;
    const sorted = [...rows].sort((a, b) => {
      const av = column.sortAccessor!(a);
      const bv = column.sortAccessor!(b);
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    if (sortDescriptor.direction === "descending") sorted.reverse();
    return sorted;
  }, [rows, sortDescriptor, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const selection: Selection = selectedIds ?? new Set();

  function handleSelectionChange(keys: Selection) {
    if (!onSelectedIdsChange) return;
    if (keys === "all") {
      onSelectedIdsChange(new Set(rows.map(getRowId)));
    } else {
      onSelectedIdsChange(new Set(Array.from(keys, String)));
    }
  }

  const showEmpty = !isLoading && pageRows.length === 0;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white shadow-surface", className)}>
      <Table variant="secondary" className="bg-transparent">
        <Table.ScrollContainer>
          <Table.Content
            aria-label={ariaLabel}
            className="w-full min-w-full"
            selectionMode={selectable ? "multiple" : "none"}
            selectedKeys={selection}
            onSelectionChange={handleSelectionChange}
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            onRowAction={
              onRowClick
                ? (key) => {
                    const row = sortedRows.find((r) => getRowId(r) === String(key));
                    if (row) onRowClick(row);
                  }
                : undefined
            }
          >
            <Table.Header>
              {[
                ...(selectable
                  ? [
                      <Table.Column key="__select" className="w-10 bg-slate-50 pe-0">
                        <Checkbox aria-label="Seleccionar todo" slot="selection" variant="secondary">
                          <Checkbox.Content>
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                          </Checkbox.Content>
                        </Checkbox>
                      </Table.Column>,
                    ]
                  : []),
                ...columns.map((col) => (
                  <Table.Column
                    key={col.key}
                    id={col.key}
                    isRowHeader={col === columns[0]}
                    allowsSorting={Boolean(col.sortAccessor)}
                    className={cn(
                      "h-10 border-b border-slate-200 bg-slate-50 py-0 text-[11px] font-semibold tracking-wide text-slate-500 uppercase",
                      ALIGN_CLASS[col.align ?? "left"],
                      col.headerClassName,
                    )}
                  >
                    {({ sortDirection }) =>
                      col.sortAccessor ? (
                        <Table.SortableColumnHeader sortDirection={sortDirection}>
                          {col.header}
                        </Table.SortableColumnHeader>
                      ) : (
                        col.header
                      )
                    }
                  </Table.Column>
                )),
                ...(rowActions
                  ? [<Table.Column key="__actions" className="w-10 bg-slate-50" />]
                  : []),
              ]}
            </Table.Header>
            <Table.Body
              renderEmptyState={() =>
                showEmpty ? (
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                ) : null
              }
            >
              {isLoading
                ? Array.from({ length: Math.min(pageSize, 8) }, (_, i) => (
                    <Table.Row key={`skeleton-${i}`} id={`skeleton-${i}`} className="h-10">
                      {[
                        ...(selectable
                          ? [
                              <Table.Cell key="__select">
                                <Skeleton className="h-4 w-4 rounded" />
                              </Table.Cell>,
                            ]
                          : []),
                        ...columns.map((col) => (
                          <Table.Cell key={col.key} className="px-3">
                            <Skeleton className="h-3.5 w-3/4 rounded" />
                          </Table.Cell>
                        )),
                        ...(rowActions
                          ? [
                              <Table.Cell key="__actions">
                                <Skeleton className="h-4 w-4 rounded" />
                              </Table.Cell>,
                            ]
                          : []),
                      ]}
                    </Table.Row>
                  ))
                : pageRows.map((row) => {
                    const id = getRowId(row);
                    return (
                      <Table.Row
                        key={id}
                        id={id}
                        className={cn("h-10", onRowClick && "cursor-pointer")}
                      >
                        {[
                          ...(selectable
                            ? [
                                <Table.Cell key="__select" className="pe-0">
                                  <Checkbox
                                    aria-label={`Seleccionar fila ${id}`}
                                    slot="selection"
                                    variant="secondary"
                                  >
                                    <Checkbox.Content>
                                      <Checkbox.Control>
                                        <Checkbox.Indicator />
                                      </Checkbox.Control>
                                    </Checkbox.Content>
                                  </Checkbox>
                                </Table.Cell>,
                              ]
                            : []),
                          ...columns.map((col) => (
                            <Table.Cell
                              key={col.key}
                              className={cn(
                                "px-3 text-sm text-slate-700",
                                ALIGN_CLASS[col.align ?? "left"],
                                col.cellClassName,
                              )}
                            >
                              {col.cell(row)}
                            </Table.Cell>
                          )),
                          ...(rowActions
                            ? [
                                <Table.Cell key="__actions" className="text-right">
                                  <Dropdown>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="ghost"
                                      aria-label="Acciones"
                                    >
                                      <EllipsisVertical className="size-4" />
                                    </Button>
                                    <Dropdown.Popover className="min-w-[180px]">
                                      <Dropdown.Menu
                                        onAction={(key) => {
                                          const action = rowActions.find((a) => a.key === key);
                                          action?.onSelect(row);
                                        }}
                                        disabledKeys={rowActions
                                          .filter((a) => a.isDisabled?.(row))
                                          .map((a) => a.key)}
                                      >
                                        {rowActions.map((action) => {
                                          const Icon = action.icon;
                                          return (
                                            <Dropdown.Item
                                              key={action.key}
                                              id={action.key}
                                              textValue={action.label}
                                              variant={action.isDanger ? "danger" : "default"}
                                            >
                                              {Icon ? (
                                                <Icon
                                                  className={cn(
                                                    "size-3.5 shrink-0",
                                                    action.isDanger
                                                      ? "text-danger"
                                                      : "text-muted",
                                                  )}
                                                />
                                              ) : null}
                                              <Label>{action.label}</Label>
                                            </Dropdown.Item>
                                          );
                                        })}
                                      </Dropdown.Menu>
                                    </Dropdown.Popover>
                                  </Dropdown>
                                </Table.Cell>,
                              ]
                            : []),
                        ]}
                      </Table.Row>
                    );
                  })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {!showEmpty && totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2">
          <Pagination.Summary className="text-xs text-slate-500">
            Mostrando {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, sortedRows.length)} de {sortedRows.length}
          </Pagination.Summary>
          <Pagination size="sm">
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={safePage === 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1,
                )
                .map((p, i, arr) => (
                  <PaginationLinkWithGap
                    key={p}
                    page={p}
                    isActive={p === safePage}
                    showGapBefore={i > 0 && p - arr[i - 1] > 1}
                    onPress={() => setPage(p)}
                  />
                ))}
              <Pagination.Item>
                <Pagination.Next
                  isDisabled={safePage === totalPages}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
}

function PaginationLinkWithGap({
  page,
  isActive,
  showGapBefore,
  onPress,
}: {
  page: number;
  isActive: boolean;
  showGapBefore: boolean;
  onPress: () => void;
}) {
  return (
    <>
      {showGapBefore ? (
        <Pagination.Item>
          <Pagination.Ellipsis />
        </Pagination.Item>
      ) : null}
      <Pagination.Item>
        <Pagination.Link isActive={isActive} onPress={onPress}>
          {page}
        </Pagination.Link>
      </Pagination.Item>
    </>
  );
}
