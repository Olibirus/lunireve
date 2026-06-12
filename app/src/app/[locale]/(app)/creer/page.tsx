"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { readProfiles, getActiveProfile, type ChildProfile } from "@/lib/profiles";
import {
  buildStubStory,
  saveCustomStory,
  quotaUsed,
  FREE_CUSTOM_LIMIT,
  type CustomStory,
  type CustomStoryParams,
} from "@/lib/customStories";
import { generateStoryAction } from "@/app/actions/generateStory";
import { FoxMark } from "@/components/brand/FoxCloud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Copy, Lock, Wand2 } from "lucide-react";
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
const MOODS = ["drole", "mysterieux", "touchant", "palpitant", "doux"] as const;

/**
 * Personalized story flow (V1 = text only) — 4 steps, pre-filled from the
 * child profile, every field editable per-story. Generation is stubbed
 * (template story) until the n8n pipeline lands; the loading screen and the
 * private-share card are the final UX.
 */
export default function CreateStoryPage() {
  const t = useTranslations("create");
  const tThemes = useTranslations("themes");

  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"form" | "loading" | "done">("form");
  const [loadingStage, setLoadingStage] = useState(0);
  const [result, setResult] = useState<CustomStory | null>(null);
  const [copied, setCopied] = useState(false);

  const [params, setParams] = useState<CustomStoryParams>({
    heroName: "",
    heroAge: 6,
    trait: "",
    theme: "aventure",
    mood: "doux",
    length: "medium",
    language: "fr",
    friend: "",
    place: "",
    fear: "",
  });
  const set = <K extends keyof CustomStoryParams>(k: K, v: CustomStoryParams[K]) =>
    setParams((p) => ({ ...p, [k]: v }));

  // Pre-fill from the active (or first) child profile.
  useEffect(() => {
    const all = readProfiles();
    setProfiles(all);
    setUsed(quotaUsed());
    const active = getActiveProfile() ?? all[0] ?? null;
    if (active) applyProfile(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyProfile(p: ChildProfile) {
    setProfileId(p.id);
    setParams((prev) => ({
      ...prev,
      heroName: p.name,
      heroAge: p.age,
      theme: p.themes[0] ?? prev.theme,
      length:
        p.maxDuration === "none" || p.maxDuration === "long"
          ? "long"
          : p.maxDuration,
      language: p.language === "both" ? "fr" : p.language,
    }));
  }

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function startGeneration() {
    setPhase("loading");
    setLoadingStage(0);

    // Real generation (Claude via server action) kicks off immediately;
    // the staged loading screen plays in parallel. If the call fails or
    // times out, the local template story keeps the experience intact.
    const generation = generateStoryAction(params).catch(() => null);

    // Fast at the start, slower at the end (brief requirement)
    const delays = [900, 2200, 3200, 4200];
    let acc = 0;
    delays.forEach((d, i) => {
      acc += d;
      timers.current.push(
        setTimeout(() => {
          setLoadingStage(i + 1);
          if (i === delays.length - 1) {
            void (async () => {
              const generated = await generation;
              const content =
                generated && generated.ok
                  ? { title: generated.title, body: generated.body }
                  : buildStubStory(params);
              setResult(saveCustomStory(content.title, content.body, params, profileId));
              setUsed(quotaUsed());
              setPhase("done");
            })();
          }
        }, acc)
      );
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const quotaLeft = FREE_CUSTOM_LIMIT - used;
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];
  const canNext = step === 0 ? params.heroName.trim().length >= 2 : true;

  /* ---------- Loading screen ---------- */
  if (phase === "loading") {
    const stages = [
      { title: t("loading1Title"), body: t("loading1Body") },
      { title: t("loading2Title"), body: t("loading2Body", { name: params.heroName }) },
      { title: t("loading3Title"), body: t("loading3Body") },
      { title: t("loading4Title"), body: t("loading4Body") },
    ];
    return (
      <section className="mx-auto max-w-xl px-5 py-16 md:py-24 text-center">
        <FoxMark className="mx-auto h-14 w-14" />
        <h1 className="mt-6 font-serif text-2xl md:text-3xl tracking-tight">
          {t("loadingTitle")}
        </h1>
        <div className="mt-3 h-2 mx-auto max-w-sm rounded-full bg-[var(--color-cream-200)]">
          <div
            className="h-2 rounded-full bg-[var(--color-mint-500)] transition-[width] duration-700"
            style={{ width: `${Math.min(100, (loadingStage / 4) * 100)}%` }}
          />
        </div>
        <ol className="mx-auto mt-10 max-w-md space-y-4 text-left">
          {stages.map((s, i) => {
            const state = i < loadingStage ? "done" : i === loadingStage ? "active" : "waiting";
            return (
              <li
                key={i}
                className={cn(
                  "flex gap-4 rounded-2xl border p-4",
                  state === "active"
                    ? "border-[var(--color-mint-400)] bg-[var(--color-mint-50)]"
                    : "border-[var(--color-ink-100)] bg-[var(--color-cream-50)]",
                  state === "waiting" && "opacity-50"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif",
                    state === "done"
                      ? "bg-[var(--color-mint-400)] text-[var(--color-ink-800)]"
                      : "bg-[var(--color-cream-200)] text-[var(--color-ink-500)]"
                  )}
                >
                  {state === "done" ? <Check className="h-4 w-4" /> : `0${i + 1}`}
                </span>
                <span>
                  <span className="block font-medium text-sm">{s.title}</span>
                  <span className="block text-xs text-[var(--color-ink-500)]">{s.body}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-8 text-xs text-[var(--color-ink-400)]">{t("loadingNote")}</p>
      </section>
    );
  }

  /* ---------- Result ---------- */
  if (phase === "done" && result) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-12 md:py-16">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
          {t("doneKicker")}
        </p>
        <h1
          className="mt-3 font-serif text-3xl md:text-5xl tracking-tight"
          style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 70, 'wght' 500" }}
        >
          {result.title}
        </h1>

        <article className="prose-reading mt-8">
          {result.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>

        {/* Private share card (brief: private by default, shareable by link) */}
        <div className="mt-10 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-100)] p-6">
          <h2 className="font-serif text-lg tracking-tight">{t("shareTitle")}</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-600)] leading-relaxed">
            {t("shareBody")}
          </p>
          <button
            type="button"
            onClick={copyLink}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--color-ink-200)] bg-[var(--color-cream-50)] px-4 py-2 text-sm hover:bg-[var(--color-cream-100)]"
          >
            <Copy className="h-4 w-4" />
            {copied ? t("shareCopied") : t("shareCopy")}
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="primary" size="md">
            <Link href="/enfant">{t("backToBubble")}</Link>
          </Button>
          {quotaLeft > 0 && (
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setPhase("form");
                setStep(0);
                setResult(null);
              }}
            >
              {t("createAnother", { count: quotaLeft })}
            </Button>
          )}
        </div>
      </section>
    );
  }

  /* ---------- Quota reached ---------- */
  if (quotaLeft <= 0) {
    return (
      <section className="mx-auto max-w-md px-5 py-20 text-center">
        <span className="inline-flex rounded-full bg-[var(--color-cream-200)] p-5">
          <Lock className="h-8 w-8 text-[var(--color-ink-400)]" />
        </span>
        <h1 className="mt-6 font-serif text-2xl tracking-tight">{t("quotaTitle")}</h1>
        <p className="mt-3 text-sm text-[var(--color-ink-500)] leading-relaxed">
          {t("quotaBody", { limit: FREE_CUSTOM_LIMIT })}
        </p>
        <Button asChild variant="outline" size="md" className="mt-6">
          <Link href="/histoires">{t("quotaCta")}</Link>
        </Button>
      </section>
    );
  }

  /* ---------- Form ---------- */
  return (
    <section className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <Link
        href="/profils"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <h1
          className="font-serif text-3xl md:text-4xl tracking-tight"
          style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
        >
          {t("title")}
        </h1>
        <span className="shrink-0 rounded-full bg-[var(--color-mint-100)] border border-[var(--color-mint-300)] px-3 py-1 text-xs text-[var(--color-ink-700)]">
          {t("quotaLeft", { count: quotaLeft })}
        </span>
      </div>

      {/* Child pre-fill chips */}
      {profiles.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--color-ink-500)]">{t("forWhom")}</span>
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyProfile(p)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                profileId === p.id
                  ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                  : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
              )}
            >
              <FoxMark color={p.avatar} className="h-4 w-4" />
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Step pills */}
      <ol className="mt-6 flex flex-wrap items-center gap-2 text-xs">
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
              <Label htmlFor="hero-name">{t("heroName")}</Label>
              <Input
                id="hero-name"
                value={params.heroName}
                maxLength={30}
                onChange={(e) => set("heroName", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>{t("heroAge")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Array.from({ length: 16 }, (_, i) => i + 1).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => set("heroAge", a)}
                    className={cn(
                      "h-10 w-10 rounded-xl border text-sm",
                      params.heroAge === a
                        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="hero-trait">{t("heroTrait")}</Label>
              <Input
                id="hero-trait"
                value={params.trait}
                maxLength={60}
                placeholder={t("heroTraitPlaceholder")}
                onChange={(e) => set("trait", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label>{t("theme")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {THEME_OPTIONS.map((slug) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => set("theme", slug)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm",
                      params.theme === slug
                        ? "border-transparent bg-[var(--color-mint-400)] text-[var(--color-ink-800)]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {tThemes(slug)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>{t("mood")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set("mood", m)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-sm",
                      params.mood === m
                        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {t(`mood_${m}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>{t("length")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["short", "medium", "long"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => set("length", l)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-sm",
                      params.length === l
                        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {t(`length_${l}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>{t("language")}</Label>
              <div className="mt-2 flex gap-1.5">
                {(["fr", "en"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => set("language", l)}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm",
                      params.language === l
                        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {l === "fr" ? "Français" : "English"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <p className="text-xs text-[var(--color-ink-400)]">{t("optionalNote")}</p>
            <div>
              <Label htmlFor="friend">{t("friend")}</Label>
              <Input
                id="friend"
                value={params.friend}
                maxLength={40}
                placeholder={t("friendPlaceholder")}
                onChange={(e) => set("friend", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="place">{t("place")}</Label>
              <Input
                id="place"
                value={params.place}
                maxLength={60}
                placeholder={t("placePlaceholder")}
                onChange={(e) => set("place", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="fear">{t("fear")}</Label>
              <Input
                id="fear"
                value={params.fear}
                maxLength={60}
                placeholder={t("fearPlaceholder")}
                onChange={(e) => set("fear", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-serif text-xl tracking-tight text-center">
              {t("summaryTitle", { name: params.heroName })}
            </h2>
            <dl className="mt-5 space-y-2 text-sm">
              {[
                [t("heroName"), `${params.heroName}, ${params.heroAge} ans`],
                [t("theme"), tThemes(params.theme)],
                [t("mood"), t(`mood_${params.mood}`)],
                [t("length"), t(`length_${params.length}`)],
                params.trait && [t("heroTrait"), params.trait],
                params.friend && [t("friend"), params.friend],
                params.place && [t("place"), params.place],
                params.fear && [t("fear"), params.fear],
              ]
                .filter((x): x is [string, string] => Boolean(x))
                .map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-4 rounded-xl bg-[var(--color-cream-100)] px-4 py-2.5"
                  >
                    <dt className="text-[var(--color-ink-500)]">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button
            variant="ghost"
            size="md"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
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
            <Button variant="mint" size="md" onClick={startGeneration}>
              <Wand2 className="h-4 w-4" />
              {t("generate")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
