"use client";

import { useMemo } from "react";
import {
  ageLabel,
  DURATION_LABEL,
  formatListen,
  type StoryAnalytics,
} from "@/data/mock-admin";
import { DataTable, type Column } from "@/components/admin/DataTable";

/**
 * Per-story analytics table (#6) — every story column (age, genre, duration,
 * audio, interactive), publication date, and all metrics including PDF/ePub
 * downloads and average listen time. Sortable headers + Excel-style filters +
 * export are provided by DataTable. Numbers are date-range scaled via `n`/
 * `factor`.
 */

type Row = StoryAnalytics;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const yesNo = (b: boolean) => (b ? "Oui" : "Non");

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
  // Built inside the component so cells/export close over the scaling factor.
  const columns = useMemo<Column<Row>[]>(
    () => [
      {
        key: "title",
        label: "Histoire",
        type: "text",
        sortVal: (r) => r.title.toLowerCase(),
        filterVal: (r) => r.title,
        cell: (r) => <span className="block max-w-56 truncate font-medium">{r.title}</span>,
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
      },
      {
        key: "genre",
        label: "Genre",
        type: "cat",
        sortVal: (r) => r.genre,
        filterVal: (r) => cap(r.genre),
        cell: (r) => cap(r.genre),
      },
      {
        key: "duration",
        label: "Durée",
        type: "cat",
        sortVal: (r) => ({ short: 0, medium: 1, long: 2 })[r.duration],
        filterVal: (r) => DURATION_LABEL[r.duration],
        cell: (r) => DURATION_LABEL[r.duration],
      },
      {
        key: "audio",
        label: "Audio",
        type: "cat",
        sortVal: (r) => (r.hasAudio ? 1 : 0),
        filterVal: (r) => yesNo(r.hasAudio),
        cell: (r) => yesNo(r.hasAudio),
      },
      {
        key: "interactive",
        label: "Interactif",
        type: "cat",
        sortVal: (r) => (r.interactive ? 1 : 0),
        filterVal: (r) => yesNo(r.interactive),
        cell: (r) => yesNo(r.interactive),
      },
      {
        key: "opens",
        label: "Ouvertures",
        type: "num",
        sortVal: (r) => r.opens,
        cell: (r) => n(r.opens),
        exp: (r) => Math.round(r.opens * factor),
      },
      {
        key: "readPct",
        label: "% lu (moy.)",
        type: "num",
        sortVal: (r) => r.readPct,
        cell: (r) => `${r.readPct}%`,
        exp: (r) => `${r.readPct}%`,
      },
      {
        key: "completion",
        label: "Complétion",
        type: "num",
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
        sortVal: (r) => r.audioPlays,
        cell: (r) => (r.audioPlays ? n(r.audioPlays) : "·"),
        exp: (r) => Math.round(r.audioPlays * factor),
      },
      {
        key: "avgListen",
        label: "Écoute moy.",
        type: "num",
        sortVal: (r) => r.avgListenSec,
        cell: (r) => formatListen(r.avgListenSec),
        exp: (r) => formatListen(r.avgListenSec),
      },
      {
        key: "pdf",
        label: "Téléch. PDF",
        type: "num",
        sortVal: (r) => r.pdfDownloads,
        cell: (r) => n(r.pdfDownloads),
        exp: (r) => Math.round(r.pdfDownloads * factor),
      },
      {
        key: "epub",
        label: "Téléch. ePub",
        type: "num",
        sortVal: (r) => r.epubDownloads,
        cell: (r) => (r.epubDownloads ? n(r.epubDownloads) : "·"),
        exp: (r) => Math.round(r.epubDownloads * factor),
      },
      {
        key: "favorites",
        label: "Favoris",
        type: "num",
        sortVal: (r) => r.favorites,
        cell: (r) => n(r.favorites),
        exp: (r) => Math.round(r.favorites * factor),
      },
      {
        key: "rating",
        label: "Note",
        type: "num",
        sortVal: (r) => r.avgRating,
        cell: (r) => r.avgRating.toFixed(1),
        exp: (r) => r.avgRating.toFixed(1),
      },
      {
        key: "readers",
        label: "Lecteurs F / G",
        type: "num",
        sortVal: (r) => r.readersGirlPct,
        cell: (r) =>
          r.readersGirlPct || r.readersBoyPct ? `${r.readersGirlPct}% / ${r.readersBoyPct}%` : "·",
        exp: (r) =>
          r.readersGirlPct || r.readersBoyPct ? `${r.readersGirlPct}% / ${r.readersBoyPct}%` : "-",
      },
      {
        key: "shares",
        label: "Partages",
        type: "num",
        sortVal: (r) => r.shares,
        cell: (r) => n(r.shares),
        exp: (r) => Math.round(r.shares * factor),
      },
      {
        key: "reports",
        label: "Signalements",
        type: "num",
        sortVal: (r) => r.reports,
        cell: (r) => (r.reports > 0 ? <span className="text-red-600">{r.reports}</span> : "·"),
        exp: (r) => r.reports,
      },
    ],
    [factor, n]
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(r) => r.slug}
      initialSortKey="title"
      exportTitle={exportTitle}
      unit="histoires"
    />
  );
}
