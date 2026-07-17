"use client";

import { useEffect, useState } from "react";
import { listStoryFeedback } from "@/app/actions/customStories";
import { ThumbsDown, ThumbsUp } from "lucide-react";

type Entry = { storyId: string; title: string; verdict: "up" | "down"; reason?: string; at: string };

/**
 * Admin: thumbs feedback left by parents on personalized stories. REAL data
 * only (recorded server-side on each vote); empty state shows zeros.
 */
export function StoryFeedbackPanel() {
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    listStoryFeedback()
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  const up = entries?.filter((e) => e.verdict === "up").length ?? 0;
  const down = entries?.filter((e) => e.verdict === "down").length ?? 0;

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="font-serif text-xl tracking-tight">Avis sur les histoires personnalisées</h2>
        <span className="text-xs text-[var(--color-ink-500)]">
          {up} 👍 · {down} 👎
        </span>
      </div>

      {entries === null ? (
        <p className="mt-3 text-sm text-[var(--color-ink-400)]">Chargement…</p>
      ) : entries.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-100)] px-4 py-3 text-sm text-[var(--color-ink-500)]">
          Aucun avis pour l&apos;instant. Chaque pouce levé ou baissé des parents apparaîtra ici.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-[var(--color-ink-100)] rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
          {entries.slice(0, 30).map((e, i) => (
            <li key={`${e.storyId}-${e.at}-${i}`} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              {e.verdict === "up" ? (
                <ThumbsUp className="h-4 w-4 shrink-0 text-[var(--color-mint-600)]" />
              ) : (
                <ThumbsDown className="h-4 w-4 shrink-0 text-[var(--color-fox-600)]" />
              )}
              <span className="min-w-0 flex-1 truncate font-medium text-[var(--color-ink-800)]">
                {e.title}
              </span>
              {e.reason && (
                <span className="hidden sm:inline truncate text-xs text-[var(--color-ink-500)]">
                  {e.reason}
                </span>
              )}
              <span className="shrink-0 text-xs text-[var(--color-ink-400)]">
                {new Date(e.at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
