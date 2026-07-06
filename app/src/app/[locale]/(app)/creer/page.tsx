"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  type StoryCompanion,
} from "@/lib/customStories";
import {
  HERO_TYPES,
  FREE_HERO_MAX_AGE,
  COMPANION_RELATIONS,
  MAX_COMPANIONS,
  MAX_EXTRA_INFO,
  STORY_SKIN_TONES,
  storyOptLabel,
  relationLabel,
} from "@/lib/storyOptions";
import { moderateText, isValidName } from "@/lib/moderation";
import { generateStoryAction } from "@/app/actions/generateStory";
import { readCharacters, type SavedCharacter } from "@/lib/characters";
import { pushNotification } from "@/lib/notifications";
import { FoxMark } from "@/components/brand/FoxCloud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Lock, Plus, Sparkles, Trash2, Wand2, X } from "lucide-react";
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
  "noel",
  "anniversaire",
  "ecole",
  "voyage",
  "animaux",
  "espace",
  "mer",
  "saisons",
  "sport",
  "famille",
];
const MOODS = ["drole", "mysterieux", "touchant", "palpitant", "doux"] as const;
const STYLES = ["automatique", "aquarelle", "bd", "anime3d", "crayons", "kawaii"] as const;

/** Reading-age ranges for the override select (first age of each range). */
const READING_RANGES = [
  { value: 1, label: "1-2" },
  { value: 3, label: "3-4" },
  { value: 5, label: "5-6" },
  { value: 7, label: "7-8" },
  { value: 9, label: "9-10" },
  { value: 11, label: "11-12" },
];

/**
 * Personalized story flow, modeled on the 4-step meshistoiresdusoir UX:
 * 1. the hero (saved characters one-tap, or direct entry: name/age/type),
 * 2. companions (up to 4, name + relation),
 * 3. the adventure (reading age, mood, theme, place, extra info),
 * 4. final settings (visual style, skin tone, language, recap, privacy note).
 *
 * Free-tier gates match the brief: hero is a child (boy/girl) aged <= 12;
 * animal/adult heroes, 13+, and non-default visual styles are paid perks.
 * All free-text inputs are screened by lib/moderation.ts before generation
 * (instant feedback here, hard gate server-side in generateStoryAction).
 */
export default function CreateStoryPage() {
  const t = useTranslations("create");
  const tThemes = useTranslations("themes");
  const tChars = useTranslations("characters");
  const tCharsPage = useTranslations("characters_page");
  const locale = useLocale();
  const router = useRouter();

  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const [tier, setTier] = useState<CustomTier>("free");
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"form" | "loading">("form");
  const [progress, setProgress] = useState(0);
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [params, setParams] = useState<CustomStoryParams>({
    heroName: "",
    heroAge: 6,
    heroType: "garcon",
    trait: "",
    theme: "aventure",
    mood: "doux",
    language: "fr",
    friend: "",
    place: "",
    fear: "",
    style: "automatique",
    companions: [],
    extraInfo: [],
    skinTone: "",
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
    // Pre-fill from filter params when arriving from an empty library result,
    // so "create this story" starts from what the family was looking for.
    try {
      const sp = new URLSearchParams(window.location.search);
      setParams((prev) => {
        const next = { ...prev };
        const theme = sp.get("theme");
        if (theme && THEME_OPTIONS.includes(theme)) next.theme = theme;
        const age = sp.get("age");
        if (age) {
          const n = parseInt(age, 10);
          if (n >= 1 && n <= 16) next.heroAge = n;
        }
        const character = sp.get("character");
        if (character) {
          try {
            next.companions = [{ name: tChars(character), relation: "autre" }];
          } catch {
            /* unknown character key */
          }
        }
        return next;
      });
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyProfile(p: ChildProfile) {
    setProfileId(p.id);
    setSelectedHeroId(null);
    setParams((prev) => ({
      ...prev,
      heroName: p.name,
      heroAge: Math.min(p.age, FREE_HERO_MAX_AGE),
      theme: p.themes[0] ?? prev.theme,
      // Story length now follows the child's age (set via heroAge), not a picker.
      language: p.language === "both" ? "fr" : p.language,
    }));
  }

  /** One tap on a saved main character fills the whole hero step. */
  function applySavedHero(c: SavedCharacter) {
    setSelectedHeroId(c.id);
    setParams((prev) => ({
      ...prev,
      heroName: c.name,
      heroAge: typeof c.age === "number" ? Math.min(c.age, isFree ? FREE_HERO_MAX_AGE : 16) : prev.heroAge,
      heroType:
        c.type === "animal" && !isFree
          ? "animal"
          : c.gender === "fille"
          ? "fille"
          : "garcon",
      trait: c.description || prev.trait,
    }));
  }

  function addCompanion(companion: StoryCompanion) {
    setParams((prev) => {
      const list = prev.companions ?? [];
      if (list.length >= MAX_COMPANIONS) return prev;
      return { ...prev, companions: [...list, companion] };
    });
  }

  function updateCompanion(index: number, patch: Partial<StoryCompanion>) {
    setParams((prev) => ({
      ...prev,
      companions: (prev.companions ?? []).map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));
  }

  function removeCompanion(index: number) {
    setParams((prev) => ({
      ...prev,
      companions: (prev.companions ?? []).filter((_, i) => i !== index),
    }));
  }

  function setExtraInfo(index: number, value: string) {
    setParams((prev) => ({
      ...prev,
      extraInfo: (prev.extraInfo ?? []).map((s, i) => (i === index ? value : s)),
    }));
  }

  /**
   * Client-side moderation per step: instant feedback before moving on.
   * The server re-checks everything in generateStoryAction (the real gate).
   */
  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!isValidName(params.heroName)) return "invalidName";
      if (params.trait && !moderateText(params.trait).ok) return "notAllowed";
    }
    if (s === 1) {
      for (const c of params.companions ?? []) {
        if (c.name.trim() && !isValidName(c.name)) return "invalidName";
      }
    }
    if (s === 2) {
      if (params.place && !moderateText(params.place).ok) return "notAllowed";
      for (const info of params.extraInfo ?? []) {
        if (info && !moderateText(info).ok) return "notAllowed";
      }
    }
    return null;
  }

  function goNext() {
    const error = validateStep(step);
    setFormError(error);
    if (!error) setStep((s) => s + 1);
  }

  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (interval.current) clearInterval(interval.current);
    },
    []
  );

  function startGeneration() {
    // Last full client check before spending the quota.
    for (const s of [0, 1, 2]) {
      const error = validateStep(s);
      if (error) {
        setFormError(error);
        setStep(s);
        return;
      }
    }
    setFormError(null);

    // Compose the legacy `friend` summary from the companions so old
    // consumers (stub story, PDF, result page) keep working unchanged.
    const companions = (params.companions ?? []).filter((c) => c.name.trim().length >= 2);
    const friend = companions
      .map((c) => `${c.name} (${relationLabel(c.relation, locale)})`)
      .join(", ");
    const finalParams: CustomStoryParams = { ...params, companions, friend };
    setParams(finalParams);

    setPhase("loading");
    setProgress(0);

    // Real generation runs in parallel with the loading screen; the local
    // template story keeps the experience intact if the call fails, EXCEPT
    // when the server blocked the content: then we return to the form.
    let settled: { title: string; body: string[]; id: string | null } | null = null;
    generateStoryAction(finalParams, profileId)
      .then((res) => {
        if (!res.ok && res.reason === "moderation") {
          if (interval.current) clearInterval(interval.current);
          setPhase("form");
          setStep(0);
          setFormError("moderationBlocked");
          return;
        }
        settled = res.ok
          ? { title: res.title, body: res.body, id: res.id }
          : { ...buildStubStory(finalParams), id: null };
      })
      .catch(() => {
        settled = { ...buildStubStory(finalParams), id: null };
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
            finalParams,
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

  const isFree = tier === "free";
  const limit = customLimitFor(tier);
  const isUnlimited = !Number.isFinite(limit);
  const quotaLeft = isUnlimited ? Infinity : limit - used;
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];
  const canNext = step === 0 ? params.heroName.trim().length >= 2 : true;
  const savedHeroes = characters.filter((c) => c.role === "main");
  const savedCompanions = characters.filter((c) => c.role === "secondary");
  const companions = params.companions ?? [];
  const extraInfo = params.extraInfo ?? [];

  const chip = (active: boolean, disabled = false) =>
    cn(
      "rounded-full border px-3 py-1.5 text-sm transition-colors",
      active
        ? "border-transparent bg-[var(--color-mint-400)] text-[#17224a]"
        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]",
      disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
    );

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
        {formError && (
          <p className="mb-5 flex items-start gap-2 rounded-xl border border-[var(--color-fox-300)] bg-[var(--color-fox-300)]/10 px-4 py-3 text-sm text-[var(--color-fox-700)]">
            <X className="mt-0.5 h-4 w-4 shrink-0" />
            {t(formError)}
          </p>
        )}

        {/* ---------- Step 1: the hero ---------- */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl tracking-tight">{t("heroTitle")}</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-500)]">{t("heroHint")}</p>
            </div>

            {savedHeroes.length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-ink-500)]">{t("heroPickSaved")}</p>
                <div className="mt-2 grid grid-cols-2 gap-2.5">
                  {savedHeroes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => applySavedHero(c)}
                      className={cn(
                        "rounded-2xl border-2 p-3 text-left transition-colors",
                        selectedHeroId === c.id
                          ? "border-[var(--color-mint-500)] bg-[var(--color-mint-50)]"
                          : "border-[var(--color-ink-100)] hover:border-[var(--color-ink-200)] hover:bg-[var(--color-cream-100)]"
                      )}
                    >
                      <span className="block font-serif text-base tracking-tight">{c.name}</span>
                      <span className="block text-xs text-[var(--color-ink-500)]">
                        {tCharsPage(`type_${c.type}`)}
                        {typeof c.age === "number" && ` · ${tCharsPage("ageUnit", { age: c.age })}`}
                      </span>
                    </button>
                  ))}
                  <Link
                    href="/compte/personnages/nouveau"
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[var(--color-ink-200)] p-3 text-center text-xs text-[var(--color-ink-500)] hover:border-[var(--color-mint-500)] hover:text-[var(--color-ink-800)]"
                  >
                    <Plus className="h-4 w-4" />
                    {tCharsPage("createInline")}
                  </Link>
                </div>
                <p className="mt-3 text-xs text-[var(--color-ink-400)]">{t("heroOrManual")}</p>
              </div>
            )}

            <div>
              <Label htmlFor="hero-name">{t("heroName")} *</Label>
              <Input
                id="hero-name"
                value={params.heroName}
                maxLength={30}
                onChange={(e) => {
                  set("heroName", e.target.value);
                  setSelectedHeroId(null);
                }}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>{t("heroAge")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Array.from({ length: 16 }, (_, i) => i + 1).map((a) => {
                  const locked = isFree && a > FREE_HERO_MAX_AGE;
                  return (
                    <button
                      key={a}
                      type="button"
                      disabled={locked}
                      onClick={() => set("heroAge", a)}
                      className={cn(
                        "h-10 w-10 rounded-xl border text-sm",
                        params.heroAge === a
                          ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                          : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]",
                        locked && "cursor-not-allowed opacity-40 hover:bg-transparent"
                      )}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
              {isFree && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-ink-400)]">
                  <Lock className="h-3 w-3" />
                  {t("heroAgeLockNote")}
                </p>
              )}
            </div>

            <div>
              <Label>{t("heroType")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {HERO_TYPES.map((h) => {
                  const locked = isFree && !h.free;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      disabled={locked}
                      onClick={() => set("heroType", h.id)}
                      className={chip(params.heroType === h.id, locked)}
                    >
                      {locked && <Lock className="mr-1 inline h-3 w-3" />}
                      {storyOptLabel(h, locale)}
                    </button>
                  );
                })}
              </div>
              {isFree && (
                <p className="mt-1.5 text-xs text-[var(--color-ink-400)]">{t("heroTypeLockNote")}</p>
              )}
            </div>

            <div>
              <Label htmlFor="hero-trait">{t("heroTrait")}</Label>
              <Input
                id="hero-trait"
                value={params.trait}
                maxLength={80}
                placeholder={t("heroTraitPlaceholder")}
                onChange={(e) => set("trait", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        )}

        {/* ---------- Step 2: companions ---------- */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl tracking-tight">{t("companionsTitle")}</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-500)]">{t("companionsHint")}</p>
            </div>

            {savedCompanions.length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-ink-500)]">{t("companionsFromSaved")}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {savedCompanions.map((c) => {
                    const added = companions.some((x) => x.name === c.name);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        disabled={added || companions.length >= MAX_COMPANIONS}
                        onClick={() =>
                          addCompanion({
                            name: c.name,
                            relation:
                              c.type === "animal"
                                ? "animal"
                                : c.gender === "fille"
                                ? "copine"
                                : c.gender === "garcon"
                                ? "copain"
                                : "autre",
                          })
                        }
                        className={chip(added, !added && companions.length >= MAX_COMPANIONS)}
                      >
                        {added ? <Check className="mr-1 inline h-3 w-3" /> : <Plus className="mr-1 inline h-3 w-3" />}
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {companions.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={c.name}
                    maxLength={30}
                    placeholder={t("companionNamePlaceholder")}
                    aria-label={t("companionNamePlaceholder")}
                    onChange={(e) => updateCompanion(i, { name: e.target.value })}
                    className="flex-1"
                  />
                  <span className="text-xs text-[var(--color-ink-400)]">{t("companionIs")}</span>
                  <select
                    value={c.relation}
                    aria-label={t("companionRelation")}
                    onChange={(e) => updateCompanion(i, { relation: e.target.value })}
                    className="h-10 rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-2.5 text-sm text-[var(--color-ink-800)]"
                  >
                    {COMPANION_RELATIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {storyOptLabel(r, locale)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeCompanion(i)}
                    aria-label={t("companionRemove")}
                    className="rounded-lg p-2 text-[var(--color-ink-400)] hover:text-[var(--color-fox-700)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {companions.length < MAX_COMPANIONS && (
                <button
                  type="button"
                  onClick={() => addCompanion({ name: "", relation: "copain" })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--color-ink-200)] px-3.5 py-1.5 text-sm text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("companionAdd", { count: companions.length, max: MAX_COMPANIONS })}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ---------- Step 3: the adventure ---------- */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl tracking-tight">{t("adventureTitle")}</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-500)]">{t("adventureHint")}</p>
            </div>

            <div>
              <Label htmlFor="reading-age">{t("readingAge")}</Label>
              <select
                id="reading-age"
                value={params.readingAge ?? ""}
                onChange={(e) =>
                  set("readingAge", e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                className="mt-1.5 h-10 w-full max-w-sm rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-2.5 text-sm text-[var(--color-ink-800)]"
              >
                <option value="">{t("readingAgeDefault")}</option>
                {READING_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {t("readingRangeLabel", { range: r.label })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>{t("mood")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button key={m} type="button" onClick={() => set("mood", m)} className={chip(params.mood === m)}>
                    {t(`mood_${m}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>{t("theme")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {THEME_OPTIONS.map((slug) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => set("theme", slug)}
                    className={chip(params.theme === slug)}
                  >
                    {tThemes(slug)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="place">{t("place")}</Label>
              <Input
                id="place"
                value={params.place}
                maxLength={80}
                placeholder={t("placePlaceholder")}
                onChange={(e) => set("place", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>{t("extraInfoTitle")}</Label>
              <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("extraInfoHint")}</p>
              <div className="mt-2 space-y-2">
                {extraInfo.map((info, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={info}
                      maxLength={140}
                      placeholder={t("extraInfoPlaceholder")}
                      aria-label={`${t("extraInfoTitle")} #${i + 1}`}
                      onChange={(e) => setExtraInfo(i, e.target.value)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        set("extraInfo", extraInfo.filter((_, x) => x !== i))
                      }
                      aria-label={t("companionRemove")}
                      className="rounded-lg p-2 text-[var(--color-ink-400)] hover:text-[var(--color-fox-700)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {extraInfo.length < MAX_EXTRA_INFO && (
                  <button
                    type="button"
                    onClick={() => set("extraInfo", [...extraInfo, ""])}
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--color-ink-200)] px-3.5 py-1.5 text-sm text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t("extraInfoAdd", { count: extraInfo.length, max: MAX_EXTRA_INFO })}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------- Step 4: final settings + recap ---------- */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl tracking-tight">{t("finalTitle")}</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-500)]">{t("finalHint")}</p>
            </div>

            <div>
              <Label>{t("style")}</Label>
              <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("styleHint")}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {STYLES.map((s) => {
                  const locked = isFree && s !== "automatique";
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={locked}
                      onClick={() => set("style", s)}
                      className={chip(params.style === s, locked)}
                    >
                      {locked && <Lock className="mr-1 inline h-3 w-3" />}
                      {t(`style_${s}`)}
                    </button>
                  );
                })}
              </div>
              {isFree && (
                <p className="mt-1.5 text-xs text-[var(--color-ink-400)]">{t("styleLockedNote")}</p>
              )}
            </div>

            <div>
              <Label>{t("skinTone")}</Label>
              <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("skinToneHint")}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => set("skinTone", "")}
                  className={chip(!params.skinTone)}
                >
                  {t("skinToneNone")}
                </button>
                {STORY_SKIN_TONES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => set("skinTone", s.id)}
                    className={chip(params.skinTone === s.id)}
                  >
                    {storyOptLabel(s, locale)}
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
                    className={chip(params.language === l)}
                  >
                    {l === "fr" ? "Français" : "English"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg tracking-tight text-center">
                {t("summaryTitle", { name: params.heroName })}
              </h3>
              <dl className="mt-4 space-y-2 text-sm">
                {[
                  [
                    t("heroName"),
                    `${params.heroName}, ${t("readingRangeLabel", { range: params.heroAge })} (${storyOptLabel(
                      HERO_TYPES.find((h) => h.id === params.heroType) ?? HERO_TYPES[0],
                      locale
                    ).toLowerCase()})`,
                  ],
                  companions.filter((c) => c.name.trim()).length > 0 && [
                    t("recapCompanions"),
                    companions
                      .filter((c) => c.name.trim())
                      .map((c) => `${c.name} (${relationLabel(c.relation, locale)})`)
                      .join(", "),
                  ],
                  [t("mood"), t(`mood_${params.mood}`)],
                  [t("theme"), tThemes(params.theme)],
                  params.place && [t("place"), params.place],
                  [
                    t("readingAge"),
                    params.readingAge
                      ? t("readingRangeLabel", {
                          range:
                            READING_RANGES.find((r) => r.value === params.readingAge)?.label ??
                            String(params.readingAge),
                        })
                      : t("readingAgeDefault"),
                  ],
                  [t("style"), t(`style_${params.style}`)],
                ]
                  .filter((x): x is [string, string] => Boolean(x))
                  .map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between gap-4 rounded-xl bg-[var(--color-cream-100)] px-4 py-2.5"
                    >
                      <dt className="shrink-0 text-[var(--color-ink-500)]">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
              </dl>
              <p className="mt-4 text-center text-xs text-[var(--color-ink-400)]">
                {t("privacyNote")}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button
            variant="ghost"
            size="md"
            disabled={step === 0}
            onClick={() => {
              setFormError(null);
              setStep((s) => s - 1);
            }}
          >
            {t("back")}
          </Button>
          {step < 3 ? (
            <Button variant="primary" size="md" disabled={!canNext} onClick={goNext}>
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
