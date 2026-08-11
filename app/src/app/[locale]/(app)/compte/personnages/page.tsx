"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  readCharacters,
  deleteCharacter,
  duplicateCharacter,
  slotsLeft,
  characterLimits,
  type SavedCharacter,
} from "@/lib/characters";
import { traitLabel } from "@/lib/characterOptions";
import { readTier } from "@/lib/tier";
import { Button } from "@/components/ui/button";
import { Copy, Pencil, Plus, Trash2, UserSquare, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Recurring characters (#16) — create once via the 4-step wizard, reuse in
 * every story. This page lists and manages them; creation lives at
 * /compte/personnages/nouveau.
 */
export default function CharactersPage() {
  const t = useTranslations("characters_page");
  const locale = useLocale();
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const [slots, setSlots] = useState<{ main: number; secondary: number } | null>(null);

  useEffect(() => {
    setCharacters(readCharacters());
    setSlots({ main: slotsLeft("main"), secondary: slotsLeft("secondary") });
  }, []);

  function refresh() {
    setCharacters(readCharacters());
    setSlots({ main: slotsLeft("main"), secondary: slotsLeft("secondary") });
  }

  function remove(c: SavedCharacter) {
    if (!window.confirm(t("deleteConfirm", { name: c.name }))) return;
    deleteCharacter(c.id);
    refresh();
  }

  /** Branch a variant without losing the original. No-op when slots are full. */
  function duplicate(c: SavedCharacter) {
    if (duplicateCharacter(c.id, t("duplicateSuffix", { name: c.name }).slice(0, 40))) refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">{t("title")}</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-500)]">{t("subtitle")}</p>
        </div>
        <Button asChild variant="primary" size="md">
          <Link href="/compte/personnages/nouveau">
            <Plus className="h-4 w-4" />
            {t("addCta")}
          </Link>
        </Button>
      </div>

      {/* Quota bar: used / max per role, with an upgrade nudge on free plans */}
      {slots && (
        <div className="mt-4 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-ink-600)]">
            <span>
              {t("quotaLabel", {
                used: characters.length,
                max: characterLimits().main + characterLimits().secondary,
              })}
            </span>
            {readTier() === "free" && (
              <Link
                href="/compte/abonnement"
                className="font-medium text-[var(--color-indigo-soft-600)] underline underline-offset-2 hover:text-[var(--color-ink-800)]"
              >
                {t("quotaUpgrade")}
              </Link>
            )}
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--color-cream-200)]">
            <div
              className="h-1.5 rounded-full bg-[var(--color-mint-500)] transition-[width]"
              style={{
                width: `${Math.min(
                  100,
                  (characters.length /
                    Math.max(1, characterLimits().main + characterLimits().secondary)) *
                    100
                )}%`,
              }}
            />
          </div>
          <p className="mt-2 text-[11px] text-[var(--color-ink-400)]">
            {t("slots", { main: slots.main, secondary: slots.secondary })}
          </p>
        </div>
      )}

      <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {characters.map((c) => (
          <article
            key={c.id}
            className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-serif text-lg tracking-tight">{c.name}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider",
                      c.role === "main"
                        ? "bg-[var(--color-fox-300)]/25 text-[var(--color-fox-700)]"
                        : "bg-[var(--color-indigo-soft-100)] text-[var(--color-indigo-soft-700)]"
                    )}
                  >
                    {t(`role_${c.role ?? "secondary"}`)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--color-ink-500)]">
                  {t(`type_${c.type}`)}
                  {typeof c.age === "number" && ` · ${t("ageUnit", { age: c.age })}`}
                </p>
                {c.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-ink-500)] line-clamp-3">
                    {c.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Link
                  href={{ pathname: "/compte/personnages/nouveau", query: { edit: c.id } } as never}
                  aria-label={t("editCharacter")}
                  title={t("editCharacter")}
                  className="rounded-lg p-1.5 text-[var(--color-ink-400)] hover:text-[var(--color-ink-800)]"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                {/* Disabled at quota, with the reason on hover rather than a
                    button that silently does nothing. */}
                <button
                  type="button"
                  onClick={() => duplicate(c)}
                  disabled={(slots?.[c.role ?? "secondary"] ?? 0) <= 0}
                  aria-label={t("duplicate")}
                  title={
                    (slots?.[c.role ?? "secondary"] ?? 0) <= 0 ? t("duplicateFull") : t("duplicate")
                  }
                  className="rounded-lg p-1.5 text-[var(--color-ink-400)] hover:text-[var(--color-ink-800)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[var(--color-ink-400)]"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  aria-label={t("delete")}
                  title={t("delete")}
                  className="rounded-lg p-1.5 text-[var(--color-ink-400)] hover:text-[var(--color-fox-700)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {c.traits.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {c.traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full bg-[var(--color-cream-200)] px-2 py-0.5 text-[11px] text-[var(--color-ink-600)]"
                  >
                    {traitLabel(trait, locale)}
                  </span>
                ))}
              </div>
            )}
            {/* One tap from the character straight into the story flow (hero prefilled) */}
            {c.role === "main" && (
              <Link
                href={{ pathname: "/creer", query: { hero: c.id } }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink-800)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)] transition-colors"
              >
                <Wand2 className="h-3.5 w-3.5 text-[var(--color-create-icon)]" />
                {t("createStoryWith", { name: c.name })}
              </Link>
            )}
          </article>
        ))}

        {characters.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-100)] p-10 text-center sm:col-span-2 xl:col-span-3 max-w-xl">
            <UserSquare className="mx-auto h-7 w-7 text-[var(--color-indigo-soft-500)]" />
            <p className="mt-3 text-sm text-[var(--color-ink-600)]">{t("empty")}</p>
            <Button asChild variant="mint" size="md" className="mt-5">
              <Link href="/compte/personnages/nouveau">
                <Plus className="h-4 w-4" />
                {t("addCta")}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
