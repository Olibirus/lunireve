"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { downloadCsv, downloadTablePdf } from "@/lib/pdf/tableExport";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Download,
  FileSpreadsheet,
  ListFilter,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Generic admin data table (#6 + users): every header sortable, every
 * categorical/text header an Excel-style filter (value checkboxes / search).
 * Export (Excel/PDF) follows the filtered + sorted view. Used by the per-story
 * analytics table and the users table so the filtering UX is identical.
 */

export type ColType = "text" | "cat" | "num";

export type Column<T> = {
  key: string;
  label: string;
  type: ColType;
  /** Comparable value for sorting. */
  sortVal: (r: T) => number | string;
  /** Categorical/text value used for filtering (and as the checkbox label). */
  filterVal?: (r: T) => string;
  /** Rendered table cell. */
  cell: (r: T) => React.ReactNode;
  /** Flat value for CSV/PDF export (defaults to filterVal/sortVal). */
  exp?: (r: T) => string | number;
  align?: "left" | "right";
  cellClassName?: string;
};

type SortDir = "asc" | "desc";

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  initialSortKey,
  initialSortDir = "asc",
  exportTitle,
  emptyText = "Aucune ligne.",
  unit = "lignes",
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (r: T) => string;
  initialSortKey?: string;
  initialSortDir?: SortDir;
  exportTitle?: string;
  emptyText?: string;
  unit?: string;
}) {
  const firstKey = initialSortKey ?? columns[0]?.key ?? "";
  const [sort, setSort] = useState<{ key: string; dir: SortDir }>({
    key: firstKey,
    dir: initialSortDir,
  });
  const [catFilters, setCatFilters] = useState<Record<string, string[]>>({});
  const [textFilters, setTextFilters] = useState<Record<string, string>>({});

  function toggleSort(key: string) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  function resetAll() {
    setCatFilters({});
    setTextFilters({});
    setSort({ key: firstKey, dir: initialSortDir });
  }

  const hasActiveFilters =
    Object.values(catFilters).some((v) => v && v.length > 0) ||
    Object.values(textFilters).some((v) => v && v.trim().length > 0);

  const visible = useMemo(() => {
    let list = [...rows];
    for (const col of columns) {
      const sel = catFilters[col.key];
      if (col.type === "cat" && col.filterVal && sel && sel.length > 0) {
        list = list.filter((r) => sel.includes(col.filterVal!(r)));
      }
    }
    for (const col of columns) {
      const q = textFilters[col.key]?.trim().toLowerCase();
      if (col.type === "text" && col.filterVal && q) {
        list = list.filter((r) => col.filterVal!(r).toLowerCase().includes(q));
      }
    }
    const col = columns.find((c) => c.key === sort.key) ?? columns[0];
    if (col) {
      list.sort((a, b) => {
        const av = col.sortVal(a);
        const bv = col.sortVal(b);
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), "fr");
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [rows, columns, catFilters, textFilters, sort]);

  const expValue = (col: Column<T>, r: T): string | number =>
    col.exp ? col.exp(r) : col.filterVal ? col.filterVal(r) : col.sortVal(r);

  function doExport(kind: "csv" | "pdf") {
    const headers = columns.map((c) => c.label);
    const data = visible.map((r) => columns.map((c) => expValue(c, r)));
    const title = exportTitle ?? "Export";
    if (kind === "csv") downloadCsv(title, headers, data);
    else downloadTablePdf(title, headers, data);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-ink-500)]">
          {visible.length} / {rows.length} {unit}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAll}
              className="ml-3 inline-flex items-center gap-1 text-[var(--color-ink-600)] underline-offset-2 hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              Réinitialiser
            </button>
          )}
        </p>
        {exportTitle && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => doExport("csv")}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-ink-100)] px-3.5 py-2 text-xs hover:bg-[var(--color-cream-100)]"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </button>
            <button
              type="button"
              onClick={() => doExport("pdf")}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-ink-100)] px-3.5 py-2 text-xs hover:bg-[var(--color-cream-100)]"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ink-100)] text-left text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
              {columns.map((col) => (
                <HeaderCell
                  key={col.key}
                  col={col}
                  rows={rows}
                  sort={sort}
                  onSort={() => toggleSort(col.key)}
                  selected={catFilters[col.key] ?? []}
                  onSelect={(v) => setCatFilters((f) => ({ ...f, [col.key]: v }))}
                  textQuery={textFilters[col.key] ?? ""}
                  onText={(q) => setTextFilters((f) => ({ ...f, [col.key]: q }))}
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-ink-100)]/60">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[var(--color-ink-400)]">
                  {hasActiveFilters ? "Aucune ligne ne correspond aux filtres." : emptyText}
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={rowKey(r)} className="hover:bg-[var(--color-cream-100)]/60">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 whitespace-nowrap",
                        col.align === "right" && "text-right",
                        col.cellClassName
                      )}
                    >
                      {col.cell(r)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeaderCell<T>({
  col,
  rows,
  sort,
  onSort,
  selected,
  onSelect,
  textQuery,
  onText,
}: {
  col: Column<T>;
  rows: T[];
  sort: { key: string; dir: SortDir };
  onSort: () => void;
  selected: string[];
  onSelect: (v: string[]) => void;
  textQuery: string;
  onText: (q: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const active = sort.key === col.key;
  const isFiltered =
    (col.type === "cat" && selected.length > 0) ||
    (col.type === "text" && textQuery.trim().length > 0);

  const options = useMemo(() => {
    if (col.type !== "cat" || !col.filterVal) return [];
    const seen = new Map<string, number | string>();
    for (const r of rows) {
      const label = col.filterVal(r);
      if (!seen.has(label)) seen.set(label, col.sortVal(r));
    }
    return [...seen.entries()]
      .sort((a, b) =>
        typeof a[1] === "number" && typeof b[1] === "number"
          ? a[1] - b[1]
          : String(a[1]).localeCompare(String(b[1]), "fr")
      )
      .map((e) => e[0]);
  }, [col, rows]);

  function toggleValue(value: string) {
    onSelect(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  return (
    <th ref={ref} className={cn("relative px-4 py-3 font-medium", col.align === "right" && "text-right")}>
      <div className={cn("flex items-center gap-1.5", col.align === "right" && "justify-end")}>
        <button
          type="button"
          onClick={onSort}
          className="inline-flex items-center gap-1 hover:text-[var(--color-ink-700)]"
          title="Trier"
        >
          {col.label}
          {active ? (
            sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          ) : (
            <ChevronsUpDown className="h-3 w-3 opacity-40" />
          )}
        </button>
        {(col.type === "cat" || col.type === "text") && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={`Filtrer ${col.label}`}
            className={cn(
              "rounded p-0.5 transition-colors hover:bg-[var(--color-cream-200)]",
              isFiltered ? "text-[var(--color-fox-600)]" : "text-[var(--color-ink-300)]"
            )}
          >
            <ListFilter className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-2 text-left normal-case tracking-normal shadow-lg">
          {col.type === "text" ? (
            <input
              autoFocus
              value={textQuery}
              onChange={(e) => onText(e.target.value)}
              placeholder="Rechercher…"
              className="w-full rounded-lg border border-[var(--color-ink-100)] bg-white px-2.5 py-1.5 text-sm text-[var(--color-ink-800)] outline-none focus:border-[var(--color-ink-300)]"
            />
          ) : (
            <>
              <div className="flex items-center justify-between px-1 pb-1.5 text-xs text-[var(--color-ink-500)]">
                <button type="button" onClick={() => onSelect(options)} className="hover:text-[var(--color-ink-800)]">
                  Tout
                </button>
                <button type="button" onClick={() => onSelect([])} className="hover:text-[var(--color-ink-800)]">
                  Aucun
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {options.map((opt) => {
                  const checked = selected.length === 0 || selected.includes(opt);
                  return (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-sm text-[var(--color-ink-700)] hover:bg-[var(--color-cream-100)]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (selected.length === 0) onSelect(options.filter((o) => o !== opt));
                          else toggleValue(opt);
                        }}
                        className="h-3.5 w-3.5 accent-[var(--color-ink-700)]"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </th>
  );
}
