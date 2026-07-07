"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { readProfiles, getActiveProfile, type ChildProfile } from "@/lib/profiles";
import {
  buildStubStory,
  saveCustomStory,
  findCustomStory,
  quotaUsed,
  customLimitFor,
  readTier,
  resetQuota,
  type CustomStory,
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
  STORY_SUBTHEMES,
  storyOptLabel,
  relationLabel,
} from "@/lib/storyOptions";
import { traitLabel } from "@/lib/characterOptions";
import { moderateText, isValidName } from "@/lib/moderation";
import { generateStoryAction } from "@/app/actions/generateStory";
import { fetchCustomStory } from "@/app/actions/customStories";
import { readCharacters, type SavedCharacter } from "@/lib/characters";
import { pushNotification } from "@/lib/notifications";
import { FoxMark } from "@/components/brand/FoxCloud";
import { AccountShell } from "@/components/account/AccountShell";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Compass, Lock, Plus, Sparkles, Trash2, Wand2, X } from "lucide-react";
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

/** Open book with lines writing themselves in, for the generation screen. */
function BookWriting() {
  return (
    <div className="relative mx-auto mt-8 w-64" aria-hidden>
      <style>{`@keyframes lunireve-write { 0% { width: 0 } 55% { width: 100% } 100% { width: 100% } }`}</style>
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5 shadow-[var(--shadow-card)]">
        {[0, 1].map((page) => (
          <div key={page} className="space-y-2.5 border-r last:border-r-0 border-[var(--color-ink-100)]/60 pr-2 last:pr-0">
            {[0, 1, 2, 3, 4, 5].map((line) => (
              <div key={line} className="h-1.5 overflow-hidden rounded-full bg-[var(--color-cream-200)]">
                <div
                  className="h-full rounded-full bg-[var(--color-indigo-soft-300)]"
                  style={{
                    animation: `lunireve-write 3.6s ease-in-out ${(page * 6 + line) * 300}ms infinite`,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <span className="absolute -right-4 -top-4 text-3xl" style={{ animation: "bounce 1.6s infinite" }}>
        ✍️
      </span>
    </div>
  );
}

/**
 * Personalized story flow, 4 steps (meshistoiresdusoir UX): hero first
 * (saved characters one-tap or direct entry), companions, adventure, final
 * settings. Always framed by the family portal: parents get the account
 * shell (sidebar + top bar), children creating from their bubble get a
 * simplified child bar and a reduced set of options.
 *
 * Sequels: /creer?from=<storyId>&next=auto|custom prefills everything from a
 * previous story; auto also launches generation immediately.
 */
export default function CreateStoryPage() {
  const t = useTranslations("create");
  const tThemes = useTranslations("themes");
  const tChars = useTranslations("characters");
  const tCharsPage = useTranslations("characters_page");
  const locale = useLocale();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [kidProfile, setKidProfile] = useState<ChildProfile | null>(null);
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const [tier, setTier] = useState<CustomTier>("free");
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"form" | "loading" | "done">("form");
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
    // A child creating from their bubble keeps the child view; a parent gets
    // the full account shell (the active profile is cleared on /compte).
    const bubble = getActiveProfile();
    setKidProfile(bubble);
    const active = bubble ?? all[0] ?? null;
    if (active) applyProfile(active);

    try {
      const sp = new URLSearchParams(window.location.search);
      // Sequel entry point: prefill everything from the previous episode and
      // land on the FINAL step (recap) so the parent confirms before launch.
      // Never auto-generate: they can still walk back to tweak any step.
      const from = sp.get("from");
      if (from) {
        const applySequel = (prev: CustomStory | null) => {
          if (!prev) {
            setReady(true);
            return;
          }
          const sequelParams: CustomStoryParams = {
            ...prev.params,
            sequelOf: prev.title,
          };
          setParams(sequelParams);
          if (prev.profileId) setProfileId(prev.profileId);
          setStep(3);
          setReady(true);
        };
        const local = findCustomStory(from);
        if (local) applySequel(local);
        else fetchCustomStory(from).then(applySequel).catch(() => setReady(true));
        return; // skip the filter prefill below
      }

      // Deep link from a character card: preselect that saved hero.
      const heroId = sp.get("hero");
      if (heroId) {
        const c = readCharacters().find((x) => x.id === heroId);
        if (c) applySavedHero(c);
      }

      // Pre-fill from filter params when arriving from an empty library result.
      setParams((prev) => {
        const nextP = { ...prev };
        const theme = sp.get("theme");
        if (theme && THEME_OPTIONS.includes(theme)) nextP.theme = theme;
        const age = sp.get("age");
        if (age) {
          const n = parseInt(age, 10);
          if (n >= 1 && n <= 16) nextP.heroAge = n;
        }
        const character = sp.get("character");
        if (character) {
          try {
            nextP.companions = [{ name: tChars(character), relation: "autre" }];
          } catch {
            /* unknown character key */
          }
        }
        return nextP;
      });
    } catch {
      /* ignore */
    }
    setReady(true);
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
      language: p.language === "both" ? "fr" : p.language,
    }));
  }

  /**
   * One tap on a saved character fills the WHOLE hero step: name, age, type,
   * trait (description + personality) and skin tone from its appearance.
   */
  function applySavedHero(c: SavedCharacter) {
    setSelectedHeroId(c.id);
    const traitText = [
      c.description,
      ...c.traits.map((id) => traitLabel(id, locale).replace(/^\S+\s/, "")),
    ]
      .filter(Boolean)
      .join(", ")
      .slice(0, 80);
    setParams((prev) => ({
      ...prev,
      heroName: c.name,
      heroAge:
        typeof c.age === "number"
          ? Math.min(c.age, tier === "free" ? FREE_HERO_MAX_AGE : 16)
          : prev.heroAge,
      heroType:
        c.type === "animal" && tier !== "free"
          ? "animal"
          : c.gender === "fille"
          ? "fille"
          : "garcon",
      trait: traitText,
      skinTone: c.appearance?.skin ?? "",
    }));
  }

  const selectedHero = characters.find((c) => c.id === selectedHeroId) ?? null;
  /** Skin tone comes from the saved character when it has one: no need to re-ask. */
  const skinFromCharacter = Boolean(selectedHero?.appearance?.skin);

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
  function validateStep(s: number, p: CustomStoryParams = params): string | null {
    if (s === 0) {
      if (!isValidName(p.heroName)) return "invalidName";
      if (p.trait && !moderateText(p.trait).ok) return "notAllowed";
    }
    if (s === 1) {
      for (const c of p.companions ?? []) {
        if (c.name.trim() && !isValidName(c.name)) return "invalidName";
      }
    }
    if (s === 2) {
      if (p.place && !moderateText(p.place).ok) return "notAllowed";
      if (p.subTheme && !moderateText(p.subTheme).ok) return "notAllowed";
      for (const info of p.extraInfo ?? []) {
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
  const savedIdRef = useRef<string | null>(null);
  const savedTitleRef = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (interval.current) clearInterval(interval.current);
    },
    []
  );

  function startGeneration(pOverride?: CustomStoryParams, pidOverride?: string | null) {
    const base = pOverride ?? params;
    const pid = pidOverride !== undefined ? pidOverride : profileId;
    // Server enforces the quota too; this avoids burning a call client-side.
    const lim = customLimitFor(readTier());
    if (Number.isFinite(lim) && quotaUsed() >= lim) return;
    for (const s of [0, 1, 2]) {
      const error = validateStep(s, base);
      if (error) {
        setFormError(error);
        setStep(s);
        return;
      }
    }
    setFormError(null);

    // Compose the legacy `friend` summary from the companions so old
    // consumers (stub story, PDF, result page) keep working unchanged.
    const companions = (base.companions ?? []).filter((c) => c.name.trim().length >= 2);
    const friend = companions
      .map((c) => `${c.name} (${relationLabel(c.relation, locale)})`)
      .join(", ");
    const finalParams: CustomStoryParams = { ...base, companions, friend };
    setParams(finalParams);

    setPhase("loading");
    setProgress(0);
    savedIdRef.current = null;

    // The story is SAVED and the in-app notification pushed as soon as the
    // model answers (in .then, not in the animation loop), so the user can
    // leave this page and keep browsing: the notification bell will hold the
    // link to the finished story.
    generateStoryAction(finalParams, pid)
      .then((res) => {
        if (!res.ok && res.reason === "moderation") {
          if (interval.current) clearInterval(interval.current);
          setPhase("form");
          setStep(0);
          setFormError("moderationBlocked");
          return;
        }
        const settled = res.ok
          ? { title: res.title, body: res.body, glossary: res.glossary, id: res.id }
          : { ...buildStubStory(finalParams), glossary: [], id: null };
        const story = saveCustomStory(
          settled.title,
          settled.body,
          finalParams,
          pid,
          settled.id ?? undefined,
          settled.glossary
        );
        savedIdRef.current = story.id;
        savedTitleRef.current = story.title;
        setUsed(quotaUsed());
        pushNotification({
          title: t("notifReady"),
          body: story.title,
          href: `/histoire-perso/${story.id}`,
        });
      })
      .catch(() => {
        const stub = buildStubStory(finalParams);
        const story = saveCustomStory(stub.title, stub.body, finalParams, pid);
        savedIdRef.current = story.id;
        savedTitleRef.current = story.title;
        setUsed(quotaUsed());
        pushNotification({
          title: t("notifReady"),
          body: story.title,
          href: `/histoire-perso/${story.id}`,
        });
      });

    // Smoothed progress curve: steady start, gentle taper, no dead crawl.
    interval.current = setInterval(() => {
      setProgress((p) => {
        let next = p;
        if (savedIdRef.current && p >= 85) next = p + 3.5; // finish sprint
        else if (p < 40) next = p + 1.6;
        else if (p < 70) next = p + 0.9;
        else if (p < 85) next = p + 0.5;
        else next = p + 0.18; // gentle wait, still visibly moving

        if (next >= 100 && savedIdRef.current) {
          if (interval.current) clearInterval(interval.current);
          // Title-reveal completion screen instead of an abrupt redirect.
          setPhase("done");
          return 100;
        }
        return Math.min(next, savedIdRef.current ? 100 : 94);
      });
    }, 110);
  }

  const isFree = tier === "free";
  const isKid = kidProfile !== null;
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

  const counter = (value: string, max: number) => (
    <span className="mt-1 block text-right text-[11px] text-[var(--color-ink-300)]">
      {value.length}/{max}
    </span>
  );

  if (!ready) return null;

  /* ---------- Content (wrapped in the right chrome at the bottom) ---------- */
  let content: React.ReactNode;

  if (phase === "done") {
    // Completion: reveal the generated title, one clear CTA to read it.
    content = (
      <section className="mx-auto max-w-xl px-5 py-16 md:py-24 text-center">
        <span className="inline-flex rounded-full bg-[var(--color-mint-100)] p-5">
          <Check className="h-8 w-8 text-[var(--color-mint-700)]" />
        </span>
        <h1 className="mt-6 font-serif text-2xl md:text-3xl tracking-tight">
          {t("doneTitle")}
        </h1>
        <p className="mt-3 text-sm text-[var(--color-ink-500)]">
          {t("doneSubtitle", { name: params.heroName })}
        </p>
        {savedTitleRef.current && (
          <p
            className="mt-6 font-serif text-3xl md:text-4xl tracking-tight text-[var(--color-ink-800)]"
            style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
          >
            « {savedTitleRef.current} »
          </p>
        )}
        <Button
          variant="mint"
          size="xl"
          className="mt-8"
          onClick={() => {
            if (savedIdRef.current) {
              router.push({ pathname: "/histoire-perso/[id]", params: { id: savedIdRef.current } });
            }
          }}
        >
          <Sparkles className="h-4 w-4" />
          {t("doneRead")}
        </Button>
      </section>
    );
  } else if (phase === "loading") {
    const stages = [
      { at: 0, title: t("loading1Title"), body: t("loading1Body") },
      { at: 18, title: t("loading2Title"), body: t("loading2Body", { name: params.heroName }) },
      { at: 55, title: t("loading3Title"), body: t("loading3Body") },
      { at: 85, title: t("loading4Title"), body: t("loading4Body") },
    ];
    content = (
      <section className="mx-auto max-w-xl px-5 py-12 md:py-16 text-center">
        <FoxMark className="mx-auto h-14 w-14" />
        <h1 className="mt-6 font-serif text-2xl md:text-3xl tracking-tight">
          {t("loadingTitle")}
        </h1>

        <BookWriting />

        <div className="mt-8 mx-auto max-w-sm">
          <div className="h-2.5 rounded-full bg-[var(--color-cream-200)]">
            <div
              className="h-2.5 rounded-full bg-[var(--color-mint-500)] transition-[width] duration-150"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--color-ink-400)]">{Math.floor(progress)}%</p>
        </div>

        <ol className="mx-auto mt-8 max-w-md space-y-3 text-left">
          {stages.map((s, i) => {
            const nextAt = stages[i + 1]?.at ?? 100;
            const state = progress >= nextAt ? "done" : progress >= s.at ? "active" : "waiting";
            return (
              <li
                key={i}
                className={cn(
                  "flex gap-4 rounded-2xl border p-3.5",
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

        {/* Keep browsing: the story saves itself and the bell will ring. */}
        <div className="mt-8 rounded-2xl border border-[var(--color-indigo-soft-200)] bg-[var(--color-indigo-soft-50)] p-4">
          <p className="text-sm text-[var(--color-ink-600)]">{t("loadingBrowseHint")}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => router.push("/histoires")}
          >
            <Compass className="h-4 w-4" />
            {t("loadingBrowse")}
          </Button>
        </div>
      </section>
    );
  } else if (quotaLeft <= 0) {
    content = (
      <section className="mx-auto max-w-md px-5 py-16 text-center">
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
  } else {
    content = (
      <section className={cn("max-w-xl px-0 py-2", isKid && "mx-auto px-5 py-10")}>
        <div className="flex items-start justify-between gap-4">
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

        {params.sequelOf && (
          <p className="mt-3 rounded-xl bg-[var(--color-indigo-soft-50)] border border-[var(--color-indigo-soft-200)] px-3.5 py-2 text-xs text-[var(--color-indigo-soft-700)]">
            {t("sequelBanner", { title: params.sequelOf })}
          </p>
        )}

        {!isKid && profiles.length > 0 && (
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
                          {typeof c.age === "number" &&
                            ` · ${tCharsPage("ageUnit", { age: c.age })}`}
                        </span>
                      </button>
                    ))}
                    {!isKid && (
                      <Link
                        href="/compte/personnages/nouveau"
                        className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[var(--color-ink-200)] p-3 text-center text-xs text-[var(--color-ink-500)] hover:border-[var(--color-mint-500)] hover:text-[var(--color-ink-800)]"
                      >
                        <Plus className="h-4 w-4" />
                        {tCharsPage("createInline")}
                      </Link>
                    )}
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
                {isFree && !isKid && (
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
                    if (isKid && locked) return null;
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
                {isFree && !isKid && (
                  <p className="mt-1.5 text-xs text-[var(--color-ink-400)]">
                    {t("heroTypeLockNote")}
                  </p>
                )}
              </div>

              {/* Skin tone lives with the hero (moved from the last step); a
                  saved character already carries it, so nothing to re-ask. */}
              {!isKid && !skinFromCharacter && (
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
              )}

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
                {counter(params.trait, 80)}
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
                          {added ? (
                            <Check className="mr-1 inline h-3 w-3" />
                          ) : (
                            <Plus className="mr-1 inline h-3 w-3" />
                          )}
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

              {!isKid && (
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
                        {t("readingRangeLabel", { range: r.label })} · {t(`lengthHint${r.value}`)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label>{t("mood")}</Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set("mood", m)}
                      className={chip(params.mood === m)}
                    >
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
                      onClick={() => {
                        set("theme", slug);
                        set("subTheme", undefined);
                      }}
                      className={chip(params.theme === slug)}
                    >
                      {tThemes(slug)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional finer angle inside the theme + free custom input */}
              {(STORY_SUBTHEMES[params.theme] ?? []).length > 0 && (
                <div>
                  <Label htmlFor="sub-theme">{t("subTheme")}</Label>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("subThemeHint")}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(STORY_SUBTHEMES[params.theme] ?? []).map((s) => {
                      const label = storyOptLabel(s, locale);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() =>
                            set("subTheme", params.subTheme === label ? undefined : label)
                          }
                          className={chip(params.subTheme === label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <Input
                    id="sub-theme"
                    value={params.subTheme ?? ""}
                    maxLength={60}
                    placeholder={t("subThemePlaceholder")}
                    onChange={(e) => set("subTheme", e.target.value || undefined)}
                    className="mt-2 max-w-sm"
                  />
                </div>
              )}

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
                {counter(params.place, 80)}
              </div>

              {!isKid && (
                <div>
                  <Label>{t("extraInfoTitle")}</Label>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("extraInfoHint")}</p>
                  <div className="mt-2 space-y-2">
                    {extraInfo.map((info, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2">
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
                            onClick={() => set("extraInfo", extraInfo.filter((_, x) => x !== i))}
                            aria-label={t("companionRemove")}
                            className="rounded-lg p-2 text-[var(--color-ink-400)] hover:text-[var(--color-fox-700)]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {counter(info, 140)}
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
              )}
            </div>
          )}

          {/* ---------- Step 4: final settings + recap ---------- */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl tracking-tight">{t("finalTitle")}</h2>
                <p className="mt-1 text-sm text-[var(--color-ink-500)]">{t("finalHint")}</p>
              </div>

              {!isKid && (
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
                    <p className="mt-1.5 text-xs text-[var(--color-ink-400)]">
                      {t("styleLockedNote")}
                    </p>
                  )}
                </div>
              )}

              {!isKid && (
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
              )}

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
                    params.sequelOf && [t("recapSequel"), params.sequelOf],
                    companions.filter((c) => c.name.trim()).length > 0 && [
                      t("recapCompanions"),
                      companions
                        .filter((c) => c.name.trim())
                        .map((c) => `${c.name} (${relationLabel(c.relation, locale)})`)
                        .join(", "),
                    ],
                    [t("mood"), t(`mood_${params.mood}`)],
                    [t("theme"), tThemes(params.theme)],
                    params.subTheme && [t("subTheme"), params.subTheme],
                    params.place && [t("place"), params.place],
                    !isKid && [
                      t("readingAge"),
                      params.readingAge
                        ? t("readingRangeLabel", {
                            range:
                              READING_RANGES.find((r) => r.value === params.readingAge)?.label ??
                              String(params.readingAge),
                          })
                        : t("readingAgeDefault"),
                    ],
                    !isKid && [t("style"), t(`style_${params.style}`)],
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
              onClick={() => {
                setFormError(null);
                if (step === 0) router.push(isKid ? "/enfant" : "/compte");
                else setStep((s) => s - 1);
              }}
            >
              {t("back")}
            </Button>
            {step < 3 ? (
              <Button variant="primary" size="md" disabled={!canNext} onClick={goNext}>
                {t("next")}
              </Button>
            ) : (
              <Button variant="mint" size="md" onClick={() => startGeneration()}>
                <Wand2 className="h-4 w-4" />
                {t("generate")}
              </Button>
            )}
          </div>
        </div>

        {/* Contextual help: creation-specific FAQ (parents only, kids keep
            the bubble distraction-free) */}
        {!isKid && (
          <div className="mt-10">
            <h2 className="mb-4 font-serif text-xl tracking-tight">{t("faqTitle")}</h2>
            <Accordion
              items={[1, 2, 3, 4, 5].map((n) => ({
                question: t(`faqQ${n}`),
                answer: t(`faqA${n}`),
              }))}
            />
          </div>
        )}
      </section>
    );
  }

  /* ---------- Chrome: child bar for kids, account shell for parents ---------- */
  if (isKid) {
    return (
      <>
        <header className="sticky top-0 z-40 border-b border-[var(--color-ink-100)] bg-[var(--color-cream-50)]/90 backdrop-blur-md">
          <div className="flex h-16 w-full items-center justify-between px-5 md:px-8">
            <Link
              href="/enfant"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-600)] hover:text-[var(--color-ink-800)]"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToBubble")}
            </Link>
            <span className="flex items-center gap-2 font-serif text-lg tracking-tight">
              {kidProfile && <FoxMark color={kidProfile.avatar} className="h-8 w-8" />}
              {kidProfile?.name}
            </span>
          </div>
        </header>
        {content}
      </>
    );
  }

  return <AccountShell>{content}</AccountShell>;
}
