"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ageLabel,
  DURATION_LABEL,
  type StoryAnalytics,
} from "@/data/mock-admin";
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
 * Per-story analytics table (#6) — every story column (age, genre, duration,
 * audio, interactive + all metrics), each header sortable, each header an
 * Excel-style filter (categorical = value checkboxes, text = search, numeric =
 * sort only). Export (Excel/PDF) follows the filtered + sorted view so what
 * you see is what you get. Numbers stay zero until real events land.
 */

type SortDir = "asc" | "desc";
type Row = StoryAnalytics;

type ColType = "text" | "cat" | "num";

type Column = {
  key: string;
  label: string;
  type: ColType;
  /** Comparable value for sorting. */
  sortVal: (r: Row) => number | string;
  /** Categorical/text value used for filtering (and as the checkbox label). */
  filterVal?: (r: Row) => string;
  /** Rendered table cell. */
  cell: (r: Row, n: (v: number) => string) => React.ReactNode;
  /** Flat value for CSV/PDF export. */
  exp: (r: Row, factor: number) => string | number;
  numeric?: boolean;
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const yesNo = (b: boolean) => (b ? "Oui" : "Non");

const COLUMNS: Column[] = [
  {
    key: "title",
    label: "Histoire",
    type: "text",
    sortVal: (r) => r.title.toLowerCase(),
    filterVal: (r) => r.title,
    cell: (r) => <span className="block truncate font-medium">{r.title}</span>,
    exp: (r) => r.title,
  },
  {
    key: "publishedAt",
    label: "Publié le",
    type: "num",
    sortVal: (r) => r.publishedAt,
    cell: (r) => (
      <span className="text-[var(--color-ink-500)]">
        {new Date(r.publishedAt).toLocaleDateString("fr-FR")}
      </span>
    ),
    exp: (r) => r.publishedAt,
  },
  {
    key: "age",
    label: "Âge",
    type: "cat",
    sortVal: (r) => Number(r.ageRange.split("-")[0]),
    filterVal: (r) => ageLabel(r.ageRange),
    cell: (r) => ageLabel(r.ageRange),
    exp: (r) => ageLabel(r.ageRange),
  },
  {
    key: "genre",
    label: "Genre",
    type: "cat",
    sortVal: (r) => r.genre,
    filterVal: (r) => cap(r.genre),
    cell: (r) => cap(r.genre),
    exp: (r) => cap(r.genre),
  },
  {
    key: "duration",
    label: "Durée",
    type: "cat",
    sortVal: (r) => ({ short: 0, medium: 1, long: 2 })[r.duration],
    filterVal: (r) => DURATION_LABEL[r.duration],
    cell: (r) => DURATION_LABEL[r.duration],
    exp: (r) => DURATION_LABEL[r.duration],
  },
  {
    key: "audio",
    label: "Audio",
    type: "cat",
    sortVal: (r) => (r.hasAudio ? 1 : 0),
    filterVal: (r) => yesNo(r.hasAudio),
    cell: (r) => yesNo(r.hasAudio),
    exp: (r) => yesNo(r.hasAudio),
  },
  {
    key: "interactive",
    label: "Interactif",
    type: "cat",
    sortVal: (r) => (r.interactive ? 1 : 0),
    filterVal: (r) => yesNo(r.interactive),
    cell: (r) => yesNo(r.interactive),
    exp: (r) => yesNo(r.interactive),
  },
  {
    key: "opens",
    label: "Ouvertures",
    type: "num",
    numeric: true,
    sortVal: (r) => r.opens,
    cell: (r, n) => n(r.opens),
    exp: (r, f) => Math.round(r.opens * f),
  },
  {
    key: "readPct",
    label: "% lu (moy.)",
    type: "num",
    numeric: true,
    sortVal: (r) => r.readPct,
    cell: (r) => `${r.readPct}%`,
    exp: (r) => `${r.readPct}%`,
  },
  {
    key: "completion",
    label: "Complétion",
    type: "num",
    numeric: true,
    sortVal: (r) => r.completionRate,
    cell: (r) => (
      <span className="inline-flex items-center gap-2">
        <span className="h-1.5 w-16 rounded-full bg-[var(--color-cream-200)]">
          <span
            className="block h-1.5 rounded-full bg-[var(--color-mint-500)]"
            style={{ width: `${r.completionRate}%` }}
          />
        </span>
        {r.completionRate}%
      </span>
    ),
    exp: (r) => `${r.completionRate}%`,
  },
  {
    key: "audioPlays",
    label: "Écoutes audio",
    type: "num",
    numeric: true,
    sortVal: (r) => r.audioPlays,
    cell: (r, n) => (r.audioPlays ? n(r.audioPlays) : "·"),
    exp: (r, f) => Math.round(r.audioPlays * f),
  },
  {
    key: "favorites",
    label: "Favoris",
    type: "num",
    numeric: true,
    sortVal: (r) => r.favorites,
    cell: (r, n) => n(r.favorites),
    exp: (r, f) => Math.round(r.favorites * f),
  },
  {
    key: "rating",
    label: "Note",
    type: "num",
    numeric: true,
    sortVal: (r) => r.avgRating,
    cell: (r) => r.avgRating.toFixed(1),
    exp: (r) => r.avgRating.toFixed(1),
  },
  {
    key: "readers",
    label: "Lecteurs F / G",
    type: "num",
    numeric: true,
    sortVal: (r) => r.readersGirlPct,
    cell: (r) =>
      r.readersGirlPct || r.readersBoyPct
        ? `${r.readersGirlPct}% / ${r.readersBoyPct}%`
        : "·",
    exp: (r) =>
      r.readersGirlPct || r.readersBoyPct
        ? `${r.readersGirlPct}% / ${r.readersBoyPct}%`
        : "-",
  },
  {
    key: "shares",
    label: "Partages",
    type: "num",
    numeric: true,
    sortVal: (r) => r.shares,
    cell: (r, n) => n(r.shares),
    exp: (r, f) => Math.round(r.shares * f),
  },
  {
    key: "reports",
    label: "Signalements",
    type: "num",
    numeric: true,
    sortVal: (r) => r.reports,
    cell: (r) =>
      r.reports > 0 ? <span className="text-red-600">{r.reports}</span> : "·",
    exp: (r) => r.reports,
  },
];

export function AnalyticsTable({
  rows,
  factor,
  n,
  exportTitle,
}: {
  rows: Row[];
  factor: number;
  n: (v: number) => string;
  exportTitle: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: SortDir }>({
    key: "title",
    dir: "asc",
  });
  // Categorical filters: selected values per column (empty/absent = all).
  const [catFilters, setCatFilters] = useState<Record<string, string[]>>({});
  // Text filters: substring query per column.
  const [textFilters, setTextFilters] = useState<Record<string, string>>({});

  function toggleSort(key: string) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  function setCat(key: string, values: string[]) {
    setCatFilters((f) => ({ ...f, [key]: values }));
  }

  function resetAll() {
    setCatFilters({});
    setTextFilters({});
    setSort({ key: "title", dir: "asc" });
  }

  const hasActiveFilters =
    Object.values(catFilters).some((v) => v && v.length > 0) ||
    Object.values(textFilters).some((v) => v && v.trim().length > 0);

  const visible = useMemo(() => {
    let list = [...rows];

    // Categorical filters
    for (const col of COLUMNS) {
      const sel = catFilters[col.key];
      if (col.type === "cat" && col.filterVal && sel && sel.length > 0) {
        list = list.filter((r) => sel.includes(col.filterVal!(r)));
      }
    }
    // Text filters
    for (const col of COLUMNS) {
      const q = textFilters[col.key]?.trim().toLowerCase();
      if (col.type === "text" && col.filterVal && q) {
        list = list.filter((r) => col.filterVal!(r).toLowerCase().includes(q));
      }
    }
    // Sort
    const col = COLUMNS.find((c) => c.key === sort.key) ?? COLUMNS[0];
    list.sort((a, b) => {
      const av = col.sortVal(a);
      const bv = col.sortVal(b);
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv), "fr");
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [rows, catFilters, textFilters, sort]);

  const exportHeaders = COLUMNS.map((c) => c.label);
  const exportRows = visible.map((r) => COLUMNS.map((c) => c.exp(r, factor)));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-ink-500)]">
          {visible.length} / {rows.length} histoires
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => downloadCsv(exportTitle, exportHeaders, exportRows)}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-ink-100)] px-3.5 py-2 text-xs hover:bg-[var(--color-cream-100)]"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>
          <button
            type="button"
            onClick={() => downloadTablePdf(exportTitle, exportHeaders, exportRows)}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-ink-100)] px-3.5 py-2 text-xs hover:bg-[var(--color-cream-100)]"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ink-100)] text-left text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
              {COLUMNS.map((col) => (
                <HeaderCell
                  key={col.key}
                  col={col}
                  rows={rows}
                  sort={sort}
                  onSort={() => toggleSort(col.key)}
                  selected={catFilters[col.key] ?? []}
                  onSelect={(v) => setCat(col.key, v)}
                  textQuery={textFilters[col.key] ?? ""}
                  onText={(q) =>
                    setTextFilters((f) => ({ ...f, [col.key]: q }))
                  }
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-ink-100)]/60">
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-10 text-center text-[var(--color-ink-400)]"
                >
                  Aucune histoire ne correspond aux filtres.
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={r.slug} className="hover:bg-[var(--color-cream-100)]/60">
                  {COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 whitespace-nowrap",
                        col.key === "title" && "max-w-56"
                      )}
                    >
                      {col.cell(r, n)}
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

function HeaderCell({
  col,
  rows,
  sort,
  onSort,
  selected,
  onSelect,
  textQuery,
  onText,
}: {
  col: Column;
  rows: Row[];
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

  // Distinct categorical values (sorted by the column's sort order).
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
    onSelect(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  return (
    <th ref={ref} className="relative px-4 py-3 font-medium">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onSort}
          className="inline-flex items-center gap-1 hover:text-[var(--color-ink-700)]"
          title="Trier"
        >
          {col.label}
          {active ? (
            sort.dir === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )
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
              isFiltered
                ? "text-[var(--color-fox-600)]"
                : "text-[var(--color-ink-300)]"
            )}
          >
            <ListFilter className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-2 text-left normal-case tracking-normal shadow-lg">
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
                <button
                  type="button"
                  onClick={() => onSelect(options)}
                  className="hover:text-[var(--color-ink-800)]"
                >
                  Tout
                </button>
                <button
                  type="button"
                  onClick={() => onSelect([])}
                  className="hover:text-[var(--color-ink-800)]"
                >
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
                          // From "all" (none selected) → start an explicit set.
                          if (selected.length === 0)
                            onSelect(options.filter((o) => o !== opt));
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
