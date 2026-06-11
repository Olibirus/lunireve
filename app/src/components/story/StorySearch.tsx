"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { searchStories, type MockStory } from "@/data/mock-stories";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Dynamic search — results render as you type (≥2 chars), no submit needed.
 * Phase 1 searches the mock array client-side; Phase 2 swaps the lookup for
 * a debounced /api/search call without touching this UI.
 */
export function StorySearch({ className }: { className?: string }) {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length >= 2 ? searchStories(query).slice(0, 6) : [];

  // Close on outside click / Escape
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <label htmlFor="story-search" className="sr-only">
        {t("label")}
      </label>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-400)]" />
      <input
        id="story-search"
        type="search"
        autoComplete="off"
        placeholder={t("placeholder")}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className={cn(
          "w-full rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]",
          "pl-10 pr-4 py-2.5 text-sm placeholder:text-[var(--color-ink-300)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-400)]/40 focus:border-[var(--color-mint-500)]"
        )}
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="story-search-results"
      />

      {open && query.trim().length >= 2 && (
        <div
          id="story-search-results"
          role="listbox"
          className={cn(
            "absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[var(--color-ink-100)]",
            "bg-[var(--color-cream-50)] shadow-[var(--shadow-float)]"
          )}
        >
          {results.length === 0 ? (
            <p className="px-4 py-5 text-sm text-[var(--color-ink-500)]">
              {t("noResults", { query: query.trim() })}
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto divide-y divide-[var(--color-ink-100)]/60">
              {results.map((s) => (
                <SearchResult key={s.slug} story={s} onSelect={() => setOpen(false)} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SearchResult({
  story,
  onSelect,
}: {
  story: MockStory;
  onSelect: () => void;
}) {
  const ageLabel =
    story.ageRange === "3-5" ? "3–5" : story.ageRange === "6-8" ? "6–8" : "9–11";
  return (
    <li role="option" aria-selected={false}>
      <Link
        href={{ pathname: "/histoires/[slug]", params: { slug: story.slug } }}
        onClick={onSelect}
        className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--color-cream-100)] transition-colors"
      >
        <span
          aria-hidden
          className={cn(story.cover, "h-12 w-9 shrink-0 rounded-lg")}
        />
        <span className="min-w-0">
          <span className="block truncate font-serif text-[15px] text-[var(--color-ink-800)]">
            {story.title}
          </span>
          <span className="block truncate text-xs text-[var(--color-ink-500)]">
            {ageLabel} ans · {story.readingMinutes} min — {story.excerpt}
          </span>
        </span>
      </Link>
    </li>
  );
}
