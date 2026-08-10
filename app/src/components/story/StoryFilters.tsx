"use client";

import { useLocale, useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AGE_RANGES, ageLabel } from "@/data/mock-stories";

/**
 * Library filters. Phase 1 uses it as a visual affordance only — state is
 * local, no query-string plumbing yet (the funnel pages handle real filtered
 * navigation).
 *
 * Responsive: vertical sidebar on lg+, compact horizontal scroll rows on
 * mobile so the filters don't push the grid below the fold.
 */
export function StoryFilters() {
  const t = useTranslations("library.filters");
  const locale = useLocale();

  const ages = AGE_RANGES.map((r) => ({ id: r, label: ageLabel(r, locale) }));
  const themes = [
    { id: "aventure", label: t("themeAdventure") },
    { id: "amitie", label: t("themeFriendship") },
    { id: "emotions", label: t("themeEmotions") },
    { id: "nature", label: t("themeNature") },
    { id: "fantastique", label: t("themeFantasy") },
    { id: "humour", label: t("themeHumor") },
    { id: "courage", label: t("themeCourage") },
    { id: "decouverte", label: t("themeDiscovery") },
  ];
  const lengths = [
    { id: "short", label: t("lengthShort") },
    { id: "medium", label: t("lengthMedium") },
    { id: "long", label: t("lengthLong") },
  ];

  return (
    <aside className="space-y-5 lg:space-y-8 lg:sticky lg:top-24">
      {/* Search */}
      <div>
        <Label htmlFor="library-search" className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
          {t("searchLabel")}
        </Label>
        <div className="relative mt-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-400)]" />
          <Input id="library-search" placeholder={t("searchPlaceholder")} className="pl-10" />
        </div>
      </div>

      <FilterGroup title={t("ageTitle")} items={ages} />
      <FilterGroup title={t("themeTitle")} items={themes} />
      <FilterGroup title={t("lengthTitle")} items={lengths} />

      <div>
        <h3 className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-2 lg:mb-3">
          {t("extras")}
        </h3>
        <ul className="flex gap-4 overflow-x-auto pb-1 lg:block lg:space-y-2.5 lg:pb-0 text-sm text-[var(--color-ink-700)]">
          <li className="flex shrink-0 items-center gap-2.5 lg:gap-3">
            <Checkbox id="f-audio" />
            <Label htmlFor="f-audio" className="cursor-pointer font-normal whitespace-nowrap">{t("withAudio")}</Label>
          </li>
          <li className="flex shrink-0 items-center gap-2.5 lg:gap-3">
            <Checkbox id="f-new" />
            <Label htmlFor="f-new" className="cursor-pointer font-normal whitespace-nowrap">{t("newThisWeek")}</Label>
          </li>
        </ul>
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  items,
}: {
  title: string;
  items: { id: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-2 lg:mb-3">{title}</h3>
      {/* Mobile: horizontal scroll row · Desktop: vertical checkbox list */}
      <ul className="flex gap-4 overflow-x-auto pb-1 lg:block lg:space-y-2.5 lg:pb-0 text-sm text-[var(--color-ink-700)]">
        {items.map((item) => (
          <li key={item.id} className="flex shrink-0 items-center gap-2.5 lg:gap-3">
            <Checkbox id={`f-${item.id}`} />
            <Label htmlFor={`f-${item.id}`} className="cursor-pointer font-normal whitespace-nowrap">
              {item.label}
            </Label>
          </li>
        ))}
      </ul>
    </div>
  );
}
