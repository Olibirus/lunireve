"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { readProfiles, getActiveProfile, type ChildProfile } from "@/lib/profiles";
import {
  buildStubStory,
  saveCustomStory,
  quotaUsed,
  customLimitFor,
  readTier,
  resetQuota,
  type CustomStoryParams,
  type CustomTier,
} from "@/lib/customStories";
import { generateStoryAction } from "@/app/actions/generateStory";
import { readCharacters, type SavedCharacter } from "@/lib/characters";
import { pushNotification } from "@/lib/notifications";
import { FoxMark } from "@/components/brand/FoxCloud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Lock, Sparkles, Wand2 } from "lucide-react";
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
const STYLES = ["automatique", "aquarelle", "bd", "anime3d", "crayons", "kawaii"] as const;

/**
 * Personalized story flow — feedback round 2:
 * continuous variable-speed loading bar (#12/#13), illustration style
 * choice (#15), saved characters as one-tap secondary characters (#16),
 * and on completion: in-app notification + redirect to the story's own
 * shareable URL /histoire-perso/<id> (#10/#14).
 */
export default function CreateStoryPage() {
  const t = useTranslations("create");
  const tThemes = useTranslations("themes");
  const router = useRouter();

  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const [tier, setTier] = useState<CustomTier>("free");
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"form" | "loading">("form");
  const [progress, setProgress] = useState(0);

  const [params, setParams] = useState<CustomStoryParams>({
    heroName: "",
    heroAge: 6,
    trait: "",
    theme: "aventure",
    mood: "doux",
    language: "fr",
    friend: "",
    place: "",
    fear: "",
    style: "automatique",
  });
  const set = <K extends keyof CustomStoryParams>(k: K, v: CustomStoryParams[K]) =>
    setParams((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const all = readProfiles();
    setProfiles(all);
    setCharacters(readCharacters());
    setUsed(quotaUsed());
    setTier(readTier());
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
      // Story length now follows the child's age (set via heroAge), not a picker.
      language: p.language === "both" ? "fr" : p.language,
    }));
  }

  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (interval.current) clearInterval(interval.current);
    },
    []
  );

  function startGeneration() {
    setPhase("loading");
    setProgress(0);

    // Real generation runs in parallel with the loading screen; the local
    // template story keeps the experience intact if the call fails. `id` is the
    // DB-assigned story id (null on stub/failure) — used for the shareable URL.
    let settled: { title: string; body: string[]; id: string | null } | null = null;
    generateStoryAction(params, profileId)
      .then((res) => {
        settled = res && res.ok
          ? { title: res.title, body: res.body, id: res.id }
          : { ...buildStubStory(params), id: null };
      })
      .catch(() => {
        settled = { ...buildStubStory(params), id: null };
      });

    // Continuous bar with variable speed (#13): quick start, slowdown as
    // it "works harder", crawl near the end, then a final sprint once the
    // generation has actually resolved.
    interval.current = setInterval(() => {
      setProgress((p) => {
        let next = p;
        if (settled && p >= 88) next = p + 4; // sprint to finish
        else if (p < 30) next = p + 2.6;
        else if (p < 60) next = p + 1.1;
        else if (p < 88) next = p + 0.45;
        else next = p + 0.05; // crawl while waiting for the model

        if (next >= 100 && settled) {
          if (interval.current) clearInterval(interval.current);
          // Cache locally under the DB id (when persisted) so the link resolves
          // offline and on the creating device, then route to that shareable id.
          const story = saveCustomStory(
            settled.title,
            settled.body,
            params,
            profileId,
            settled.id ?? undefined
          );
          setUsed(quotaUsed());
          pushNotification({
            title: t("notifReady"),
            body: story.title,
            href: `/histoire-perso/${story.id}`,
          });
          router.push({ pathname: "/histoire-perso/[id]", params: { id: story.id } });
          return 100;
        }
        return Math.min(next, settled ? 100 : 92);
      });
    }, 110);
  }

  const limit = customLimitFor(tier);
  const isUnlimited = !Number.isFinite(limit);
  const quotaLeft = isUnlimited ? Infinity : limit - used;
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];
  const canNext = step === 0 ? params.heroName.trim().length >= 2 : true;

  /* ---------- Loading screen ---------- */
  if (phase === "loading") {
    const stages = [
      { at: 0, title: t("loading1Title"), body: t("loading1Body") },
      { at: 18, title: t("loading2Title"), body: t("loading2Body", { name: params.heroName }) },
      { at: 55, title: t("loading3Title"), body: t("loading3Body") },
      { at: 85, title: t("loading4Title"), body: t("loading4Body") },
    ];
    return (
      <section className="mx-auto max-w-xl px-5 py-16 md:py-24 text-center">
        <FoxMark className="mx-auto h-14 w-14" />
        <h1 className="mt-6 font-serif text-2xl md:text-3xl tracking-tight">
          {t("loadingTitle")}
        </h1>
        <div className="mt-5 mx-auto max-w-sm">
          <div className="h-2.5 rounded-full bg-[var(--color-cream-200)]">
            <div
              className="h-2.5 rounded-full bg-[var(--color-mint-500)]"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--color-ink-400)]">{Math.floor(progress)}%</p>
        </div>
        <ol className="mx-auto mt-8 max-w-md space-y-4 text-left">
          {stages.map((s, i) => {
            const nextAt = stages[i + 1]?.at ?? 100;
            const state = progress >= nextAt ? "done" : progress >= s.at ? "active" : "waiting";
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
                      ? "bg-[var(--color-mint-400)] text-[#17224a]"
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

  /* ---------- Quota reached ---------- */
  if (quotaLeft <= 0) {
    return (
      <section className="mx-auto max-w-md px-5 py-20 text-center">
        <span className="inline-flex rounded-full bg-[var(--color-cream-200)] p-5">
          <Lock className="h-8 w-8 text-[var(--color-ink-400)]" />
        </span>
        <h1 className="mt-6 font-serif text-2xl tracking-tight">{t("quotaTitle")}</h1>
        <p className="mt-3 text-sm text-[var(--color-ink-500)] leading-relaxed">
          {t("quotaBody", { limit })}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button asChild variant="mint" size="lg">
            <Link href="/tarifs">
              <Sparkles className="h-4 w-4" />
              {t("quotaUpgrade")}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/histoires">{t("quotaCta")}</Link>
          </Button>
          <button
            type="button"
            onClick={() => {
              resetQuota();
              setUsed(0);
            }}
            className="mt-2 text-[11px] uppercase tracking-wider text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)]"
          >
            {t("quotaResetTest")}
          </button>
        </div>
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
          {isUnlimited ? t("quotaUnlimited") : t("quotaLeft", { count: quotaLeft })}
        </span>
      </div>

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
                        ? "border-transparent bg-[var(--color-mint-400)] text-[#17224a]"
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
              <Label>{t("style")}</Label>
              <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("styleHint")}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("style", s)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-sm",
                      params.style === s
                        ? "border-transparent bg-[var(--color-indigo-soft-500)] text-white"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {t(`style_${s}`)}
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
              {characters.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {characters.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => set("friend", `${c.name}, ${c.description}`)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs",
                        params.friend.startsWith(c.name)
                          ? "border-transparent bg-[var(--color-mint-400)] text-[#17224a]"
                          : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                  <Link
                    href="/compte/personnages"
                    className="rounded-full border border-dashed border-[var(--color-ink-200)] px-3 py-1 text-xs text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)]"
                  >
                    {t("manageCharacters")}
                  </Link>
                </div>
              )}
              <Input
                id="friend"
                value={params.friend}
                maxLength={80}
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
                [t("style"), t(`style_${params.style}`)],
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
