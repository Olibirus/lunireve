"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { GlossaryEntry } from "@/data/mock-stories";

/**
 * "Les mots de l'histoire" panel.
 *
 * Open on desktop, collapsed on phones: at 375px the definition list pushed the
 * related stories a whole screen down.
 *
 * The list is ALWAYS in the DOM and only hidden with a class, never unmounted.
 * Rendering it conditionally would keep the definitions out of the static HTML,
 * and this page is prerendered for crawlers, so the words would stop counting
 * for SEO. `hidden md:block` also means the mobile default needs no JavaScript
 * and cannot flash open during hydration.
 */
export function StoryGlossaryPanel({
  title,
  hint,
  entries,
}: {
  title: string;
  hint: string;
  entries: GlossaryEntry[];
}) {
  const [openOnMobile, setOpenOnMobile] = useState(false);
  if (!entries.length) return null;

  return (
    <section className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6">
      <button
        type="button"
        onClick={() => setOpenOnMobile((o) => !o)}
        aria-expanded={openOnMobile}
        aria-controls="story-glossary-list"
        className="flex w-full items-start gap-3 text-left md:cursor-default"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-xl tracking-tight">{title}</span>
          <span className="mt-1 block text-xs text-[var(--color-ink-400)]">{hint}</span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "mt-1 h-5 w-5 shrink-0 text-[var(--color-ink-500)] transition-transform md:hidden",
            openOnMobile && "rotate-180"
          )}
        />
      </button>

      <dl
        id="story-glossary-list"
        className={cn(
          "mt-4 space-y-3 border-t border-[var(--color-ink-100)] pt-4 md:block",
          openOnMobile ? "block" : "hidden"
        )}
      >
        {entries.map((g) => (
          <div key={g.word}>
            <dt className="font-medium text-[var(--color-ink-800)]">{g.word}</dt>
            <dd className="text-sm text-[var(--color-ink-600)]">{g.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
