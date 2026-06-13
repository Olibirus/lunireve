"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AGE_RANGES, GENRES, ageLabel } from "@/data/mock-stories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Mail } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Newsletter management (#31): choose a name, one or more ages, one or more
 * story types, and confirm weekly delivery. Stored locally; Phase 2 syncs to
 * Brevo (a list + contact attributes per preference).
 */
const KEY = "lunireve:newsletterPrefs";

export default function NewsletterPage() {
  const t = useTranslations("newsletter_prefs");
  const tAll = useTranslations();
  const [name, setName] = useState("");
  const [ages, setAges] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [weekly, setWeekly] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      if (p.name) setName(p.name);
      if (Array.isArray(p.ages)) setAges(p.ages);
      if (Array.isArray(p.genres)) setGenres(p.genres);
      if (typeof p.weekly === "boolean") setWeekly(p.weekly);
    } catch {
      /* ignore */
    }
  }, []);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ name, ages, genres, weekly }));
    } catch {
      /* ignore */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-500)]">{t("subtitle")}</p>

      <div className="mt-6 max-w-xl space-y-6 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6">
        <div>
          <Label htmlFor="nl-name">{t("name")}</Label>
          <Input id="nl-name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
        </div>

        <div>
          <Label>{t("ages")}</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {AGE_RANGES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggle(ages, setAges, a)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm",
                  ages.includes(a)
                    ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                    : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                )}
              >
                {ageLabel(a)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>{t("types")}</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {GENRES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggle(genres, setGenres, g)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm",
                  genres.includes(g)
                    ? "border-transparent bg-[var(--color-mint-400)] text-[#17224a]"
                    : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                )}
              >
                {tAll(`genres.${g}`)}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-[var(--color-cream-100)] px-4 py-3">
          <input
            type="checkbox"
            checked={weekly}
            onChange={(e) => setWeekly(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-mint-600)]"
          />
          <span className="text-sm text-[var(--color-ink-700)]">{t("weekly")}</span>
        </label>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="md" onClick={save}>
            <Mail className="h-4 w-4" />
            {t("save")}
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-mint-700)]">
              <Check className="h-4 w-4" />
              {t("saved")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
