"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createProfile } from "@/lib/profiles";
import { type FoxColor } from "@/components/brand/FoxCloud";
import { ChildAvatar, AVATAR_COLORS } from "@/components/brand/ChildAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

const THEME_OPTIONS = [
  "aventure",
  "amitie",
  "emotions",
  "nature",
  "fantastique",
  "humour",
  "courage",
  "decouverte",
];

/**
 * Child profile creation — 4 steps per the brief:
 * 1. name + age · 2. avatar color · 3. language + themes + duration · 4. confirm
 */
export default function NewProfilePage() {
  const t = useTranslations("profiles.create");
  const tThemes = useTranslations("themes");
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState(6);
  const [avatar, setAvatar] = useState<FoxColor>("golden");
  const [language, setLanguage] = useState<"fr" | "en" | "both">("fr");
  const [themes, setThemes] = useState<string[]>([]);
  const [maxDuration, setMaxDuration] = useState<"none" | "short" | "medium" | "long">("none");

  const steps = [t("stepIdentity"), t("stepAvatar"), t("stepTastes"), t("stepConfirm")];
  const canNext =
    step === 0 ? name.trim().length >= 2 : step === 2 ? themes.length > 0 : true;

  function toggleTheme(slug: string) {
    setThemes((prev) =>
      prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
    );
  }

  function finish() {
    const created = createProfile({
      name: name.trim(),
      age,
      avatar,
      language,
      themes,
      maxDuration,
    });
    if (created) router.push("/profils");
  }

  return (
    <section className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <h1
        className="font-serif text-3xl md:text-4xl tracking-tight"
        style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
      >
        {t("title")}
      </h1>

      {/* Step indicator */}
      <ol className="mt-6 flex items-center gap-2 text-xs">
        {steps.map((label, i) => (
          <li
            key={label}
            className={cn(
              "rounded-full px-3 py-1",
              i === step
                ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                : i < step
                ? "bg-[var(--color-mint-200)] text-[var(--color-ink-700)]"
                : "bg-[var(--color-cream-200)] text-[var(--color-ink-400)]"
            )}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 md:p-8 shadow-[var(--shadow-soft)]">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="child-name">{t("name")}</Label>
              <Input
                id="child-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                className="mt-1.5"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="child-age">{t("age")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Array.from({ length: 16 }, (_, i) => i + 1).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAge(a)}
                    className={cn(
                      "h-10 w-10 rounded-xl border text-sm transition-colors",
                      age === a
                        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-sm text-[var(--color-ink-600)]">{t("avatarHint")}</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatar(c)}
                  aria-pressed={avatar === c}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-colors",
                    avatar === c
                      ? "border-[var(--color-mint-500)] bg-[var(--color-mint-50)]"
                      : "border-transparent hover:bg-[var(--color-cream-100)]"
                  )}
                >
                  <ChildAvatar color={c} className="h-20 w-20" />
                  <span className="text-xs text-[var(--color-ink-600)]">
                    {t(`color_${c}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label>{t("language")}</Label>
              <div className="mt-2 flex gap-1.5">
                {(["fr", "en", "both"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm transition-colors",
                      language === l
                        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {t(`language_${l}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>{t("themes")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {THEME_OPTIONS.map((slug) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => toggleTheme(slug)}
                    aria-pressed={themes.includes(slug)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      themes.includes(slug)
                        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {tThemes(slug)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>{t("duration")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["none", "short", "medium", "long"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setMaxDuration(d)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-sm transition-colors",
                      maxDuration === d
                        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {t(`duration_${d}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <ChildAvatar color={avatar} className="mx-auto h-24 w-24" />
            <p className="mt-4 font-serif text-2xl tracking-tight">{name}</p>
            <p className="mt-1 text-sm text-[var(--color-ink-500)]">
              {t("confirmSummary", { age, count: themes.length })}
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button
            variant="ghost"
            size="md"
            onClick={() => (step === 0 ? router.push("/profils") : setStep((s) => s - 1))}
          >
            {t("back")}
          </Button>
          {step < 3 ? (
            <Button
              variant="primary"
              size="md"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
            >
              {t("next")}
            </Button>
          ) : (
            <Button variant="mint" size="md" onClick={finish}>
              {t("confirm")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
