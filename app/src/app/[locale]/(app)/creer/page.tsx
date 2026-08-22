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
  STORY_MORALS,
  OCCASION_PRESETS,
  SITUATION_PRESETS,
  THEME_GENRES,
  THEME_UNIVERSES,
  storyOptLabel,
  relationLabel,
  capitalizeName,
  type OccasionPreset,
} from "@/lib/storyOptions";
import { traitLabel } from "@/lib/characterOptions";
import { findStory } from "@/data/mock-stories";
import { moderateText, isValidName } from "@/lib/moderation";
import { generateStoryAction } from "@/app/actions/generateStory";
import { fetchCustomStory, ensureCustomStoryImage } from "@/app/actions/customStories";
import { readCharacters, createCharacter, slotsLeft, type SavedCharacter } from "@/lib/characters";
import { getRole } from "@/lib/clientAuth";
import { saveLibraryStory } from "@/lib/adminStories";
import { pushNotification } from "@/lib/notifications";
import { FoxMark } from "@/components/brand/FoxCloud";
import { ChildAvatar } from "@/components/brand/ChildAvatar";
import { AccountShell } from "@/components/account/AccountShell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, BookmarkPlus, Check, Compass, ImageIcon, Lock, Pencil, Plus, Sparkles, Trash2, Wand2, X } from "lucide-react";
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
const STYLES = ["automatique", "vif", "aquarelle", "bd", "anime3d", "crayons", "kawaii"] as const;

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
 * Rotating "working on it" words (Claude-thinking style): one short phrase at
 * a time with a shimmering sweep, cycling while the model writes and draws.
 * Localized via the create.working* keys, so FR and EN each get their own set.
 */
function WorkingTicker({ phrases }: { phrases: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % phrases.length), 2400);
    return () => clearInterval(id);
  }, [phrases.length]);
  return (
    <div className="mt-4 flex h-6 items-center justify-center gap-2" aria-live="polite">
      <style>{`
        @keyframes lunireve-shimmer { 0% { background-position: 200% center } 100% { background-position: -200% center } }
        @keyframes lunireve-fade { 0% { opacity: 0; transform: translateY(3px) } 100% { opacity: 1; transform: none } }
      `}</style>
      <Sparkles
        className="h-3.5 w-3.5 text-[var(--color-mint-500)]"
        style={{ animation: "pulse 1.6s ease-in-out infinite" }}
      />
      <span
        key={index}
        className="bg-clip-text text-sm font-medium text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--color-ink-400) 20%, var(--color-mint-600) 40%, var(--color-indigo-soft-500) 60%, var(--color-ink-400) 80%)",
          backgroundSize: "200% auto",
          animation: "lunireve-shimmer 2.2s linear infinite, lunireve-fade 0.4s ease-out",
        }}
      >
        {phrases[index]}
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
  /** Story AUTHOR: null = the parent, else the child profile id. */
  const [profileId, setProfileId] = useState<string | null>(null);
  /** Which child profile filled the hero fields (highlight only, not the author). */
  const [heroProfileId, setHeroProfileId] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const [tier, setTier] = useState<CustomTier>("free");
  const [step, setStep] = useState(0);
  // Quick by default: hero + optional occasion, one button. Advanced opens
  // the full 4-step flow. Sequels land in advanced (recap prefilled).
  const [mode, setMode] = useState<"quick" | "advanced">("quick");
  const [phase, setPhase] = useState<"form" | "loading" | "done" | "rejected">("form");
  // Admin library mode (?bibliotheque=1): the SAME wizard, but the result is
  // saved as a LIBRARY story (admin bank content), not a personalized one.
  const [libraryMode, setLibraryMode] = useState(false);
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      setLibraryMode(sp.get("bibliotheque") === "1" && getRole() === "admin");
    } catch {
      /* ignore */
    }
  }, []);
  // Form field that tripped the safety gates, when known: highlighted in red
  // on the form so the parent sees exactly what to rephrase.
  const [blockedFields, setBlockedFields] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [presetId, setPresetId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  // Two light waves ripple off the "Advanced mode" pill on every visit: a
  // gentle nudge that a fuller mode exists, then gone (never loops).
  const [advancedWave, setAdvancedWave] = useState(true);
  useEffect(() => {
    // 4 ripples (2 pairs): the single pair was over before the eye caught it.
    const id = setTimeout(() => setAdvancedWave(false), 5200);
    return () => clearTimeout(id);
  }, []);

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
    moral: "",
  });
  const set = <K extends keyof CustomStoryParams>(k: K, v: CustomStoryParams[K]) =>
    setParams((p) => ({ ...p, [k]: v }));

  /**
   * Occasion preset (#5): fills theme + angle + mood and seeds one plot note.
   * Tapping the active preset again clears it. The seeded note is tagged so
   * re-picking a preset swaps it cleanly without stacking sentences.
   */
  function applyPreset(preset: OccasionPreset) {
    if (presetId === preset.id) {
      setPresetId(null);
      return;
    }
    setPresetId(preset.id);
    const subTheme = locale === "en" ? preset.subThemeEn : preset.subThemeFr;
    const extra = (locale === "en" ? preset.extraEn : preset.extraFr) ?? "";
    setParams((p) => {
      // Drop any note previously seeded by a preset, keep the parent's own.
      const seeded = new Set(
        [...OCCASION_PRESETS, ...SITUATION_PRESETS]
          .flatMap((x) => [x.extraFr, x.extraEn])
          .filter(Boolean) as string[]
      );
      const kept = (p.extraInfo ?? []).filter((s) => !seeded.has(s));
      const extraInfo = extra ? [extra, ...kept].slice(0, MAX_EXTRA_INFO) : kept;
      return { ...p, theme: preset.theme, subTheme: subTheme || undefined, mood: preset.mood, extraInfo };
    });
  }

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
    // AUTHOR: the child only when creating from their own bubble. A parent
    // stays the author even though the first child's details prefill the hero
    // (that prefill used to silently attribute the story to that child).
    setProfileId(bubble?.id ?? null);
    const heroSource = bubble ?? all[0] ?? null;
    if (heroSource) applyProfile(heroSource);

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
            // Image reference: the next episode reuses the previous cover so
            // the hero stays visually consistent.
            sequelOfId: prev.id,
          };
          setParams(sequelParams);
          // A sequel keeps the original episode's author.
          setProfileId(prev.profileId ?? null);
          setMode("advanced");
          setStep(3);
          setReady(true);
        };
        const local = findCustomStory(from);
        if (local) applySequel(local);
        else fetchCustomStory(from).then(applySequel).catch(() => setReady(true));
        return; // skip the filter prefill below
      }

      // "Next chapter" of a LIBRARY story: prefill hero + theme from the book
      // and land on the recap step; sequelOf drives a brand-new plot. The
      // hero's name is read from the title ("Léa et la baleine bleue" -> Léa),
      // falling back to the character label (Renard, Petit garçon...).
      const fromLib = sp.get("fromLib");
      if (fromLib) {
        const lib = findStory(fromLib);
        if (lib) {
          const titleName = lib.title.match(/^([A-ZÀ-Ý][\p{L}'-]+)\s+et\s/u)?.[1];
          const heroName = titleName ?? tChars(lib.character);
          setParams((prev) => ({
            ...prev,
            heroName,
            heroAge: parseInt(lib.ageRange, 10) || prev.heroAge,
            heroType:
              lib.character === "enfant-fille"
                ? "fille"
                : lib.character === "enfant-garcon"
                ? "garcon"
                : prev.heroType,
            theme: THEME_OPTIONS.includes(lib.theme) ? lib.theme : prev.theme,
            subTheme: undefined,
            sequelOf: lib.title,
          }));
          setStep(3);
          setReady(true);
          return;
        }
      }

      // Deep link from a character card: preselect that saved hero.
      const heroId = sp.get("hero");
      if (heroId) {
        const c = readCharacters().find((x) => x.id === heroId);
        if (c) applySavedHero(c);
      }

      // Theme card on the homepage: apply the matching preset (fills theme +
      // angle + mood + plot note), same as tapping it in the wizard.
      const occasion = sp.get("occasion");
      if (occasion) {
        const preset = [...OCCASION_PRESETS, ...SITUATION_PRESETS].find(
          (x) => x.id === occasion
        );
        if (preset) applyPreset(preset);
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

  /**
   * Use a child profile as the story's HERO. Deliberately does not touch the
   * author (`profileId`): who the story is about and who created it are two
   * different things, picked separately.
   */
  function applyProfile(p: ChildProfile) {
    setHeroProfileId(p.id);
    setSelectedHeroId(null);
    setParams((prev) => ({
      ...prev,
      heroName: p.name,
      heroAge: Math.min(p.age, FREE_HERO_MAX_AGE),
      heroDescription: undefined,
      // "tout" = no preferred theme, keep the current selection.
      theme: p.themes[0] && p.themes[0] !== "tout" ? p.themes[0] : prev.theme,
    }));
  }

  /**
   * One tap on a saved character fills the WHOLE hero step: name, age, type,
   * skin tone, and the character's FULL description (appearance + personality,
   * carried in heroDescription with no length cap). The 80-char trait input is
   * hidden while a saved hero is active: all-or-nothing, never a cut blurb.
   */
  function applySavedHero(c: SavedCharacter) {
    setSelectedHeroId(c.id);
    const fullDescription = [
      c.description,
      ...c.traits.map((id) => traitLabel(id, locale).replace(/^\S+\s/, "")),
    ]
      .filter(Boolean)
      .join(", ");
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
      trait: "",
      heroDescription: fullDescription || undefined,
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
   * Save a typed companion into the character library (role secondary), so
   * pets, grandparents and friends become reusable across every future story.
   * Type and gender are guessed from the relation.
   */
  function saveCompanionToLibrary(c: StoryCompanion) {
    const adults = ["papa", "maman", "grandpere", "grandmere", "enseignant", "voisin"];
    const girls = ["copine", "soeur", "maman", "grandmere", "cousine"];
    const boys = ["copain", "frere", "papa", "grandpere", "cousin"];
    const created = createCharacter({
      name: capitalizeName(c.name.trim()),
      type:
        c.relation === "animal"
          ? "animal"
          : c.relation === "doudou"
          ? "doudou"
          : adults.includes(c.relation)
          ? "adulte"
          : "enfant",
      role: "secondary",
      gender: girls.includes(c.relation) ? "fille" : boys.includes(c.relation) ? "garcon" : "neutre",
      description: relationLabel(c.relation, locale),
      traits: [],
    });
    if (created) setCharacters(readCharacters());
  }

  const isCompanionSaved = (name: string) =>
    characters.some((x) => x.role === "secondary" && x.name === capitalizeName(name.trim()));

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
        // A companion slot without a name is meaningless for the story:
        // the name is mandatory once the row exists.
        if (!c.name.trim()) return "companionNameRequired";
        if (!isValidName(c.name)) return "invalidName";
      }
    }
    if (s === 2) {
      if (p.place && !moderateText(p.place).ok) return "notAllowed";
      if (p.subTheme && !moderateText(p.subTheme).ok) return "notAllowed";
      if (p.moral && !moderateText(p.moral).ok) return "notAllowed";
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

    // Names always carry proper capitals; the story's language follows the
    // site language the family is browsing in (no picker); the legacy `friend`
    // summary keeps old consumers (stub story, PDF, result page) working.
    const companions = (base.companions ?? [])
      .filter((c) => c.name.trim().length >= 2)
      .map((c) => ({ ...c, name: capitalizeName(c.name) }));
    const friend = companions
      .map((c) => `${c.name} (${relationLabel(c.relation, locale)})`)
      .join(", ");
    const finalParams: CustomStoryParams = {
      ...base,
      heroName: capitalizeName(base.heroName),
      companions,
      friend,
      language: locale === "en" ? "en" : "fr",
    };
    setParams(finalParams);

    setPhase("loading");
    setProgress(0);
    setBlockedFields([]);
    savedIdRef.current = null;

    // The story is SAVED and the in-app notification pushed as soon as the
    // model answers (in .then, not in the animation loop), so the user can
    // leave this page and keep browsing: the notification bell will hold the
    // link to the finished story.
    generateStoryAction(finalParams, pid)
      .then((res) => {
        if (!res.ok && res.reason === "moderation") {
          if (interval.current) clearInterval(interval.current);
          // Dedicated rejection screen: explains, offers to fix (form stays
          // prefilled, offending field highlighted), browse, or read the FAQ.
          setBlockedFields(res.fields ?? []);
          setPhase("rejected");
          return;
        }
        const settled = res.ok
          ? { title: res.title, body: res.body, glossary: res.glossary, id: res.id }
          : { ...buildStubStory(finalParams), glossary: [], id: null };
        // Admin library mode: bank story, not a personalized one — no quota,
        // no family attribution; it lands in Admin > Histoires.
        if (libraryMode) {
          const lib = saveLibraryStory(settled.title, settled.body, {
            theme: finalParams.theme,
            heroAge: finalParams.heroAge,
            readingAge: finalParams.readingAge,
          });
          savedIdRef.current = lib.slug;
          savedTitleRef.current = lib.title;
          pushNotification({ title: t("notifReady"), body: lib.title, href: "/admin/histoires" });
          return;
        }
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
        // Pre-warm the illustration while the reader is still on their way,
        // so the story page opens with its image already cached.
        if (story.id.startsWith("PS-")) {
          ensureCustomStoryImage(story.id).catch(() => {});
        }
        pushNotification({
          title: t("notifReady"),
          body: story.title,
          href: `/histoire-perso/${story.id}`,
        });
      })
      .catch(() => {
        const stub = buildStubStory(finalParams);
        if (libraryMode) {
          const lib = saveLibraryStory(stub.title, stub.body, {
            theme: finalParams.theme,
            heroAge: finalParams.heroAge,
            readingAge: finalParams.readingAge,
          });
          savedIdRef.current = lib.slug;
          savedTitleRef.current = lib.title;
          pushNotification({ title: t("notifReady"), body: lib.title, href: "/admin/histoires" });
          return;
        }
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

    // Gently eased progress: a touch quicker early, a touch slower late, but
    // close enough that no stage flashes past and the end never feels stuck.
    interval.current = setInterval(() => {
      setProgress((p) => {
        let next = p;
        // Near-linear ramp; once the model has answered, glide to 100. While
        // still waiting past 85%, keep a visible slow creep (never parked):
        // the animated status words below carry the "working on it" feeling.
        if (savedIdRef.current) next = p + 2.2;
        else if (p < 85) next = p + 0.85;
        else next = p + 0.12;

        if (next >= 100 && savedIdRef.current) {
          if (interval.current) clearInterval(interval.current);
          // Title-reveal completion screen instead of an abrupt redirect.
          setPhase("done");
          return 100;
        }
        return Math.min(next, savedIdRef.current ? 100 : 97);
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

  /** Step that owns a moderation-blocked field (for the "fix" button). */
  const stepOfField = (f: string | null): number =>
    f === "heroName" || f === "trait"
      ? 0
      : f === "companions" || f === "friend"
      ? 1
      : f === "subTheme" || f === "place" || f === "fear" || f === "extraInfo" || f === "moral"
      ? 2
      : 0;

  /** Red outline for the field the safety gate pointed at. */
  const blockedCls = (f: string) =>
    blockedFields.includes(f)
      ? "border-[var(--color-fox-500)] ring-2 ring-[var(--color-fox-500)]/40"
      : "";

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

  if (phase === "rejected") {
    // The request was declined by the kid-safety gates. Explain briefly, keep
    // the form prefilled and point at the offending field when we know it.
    content = (
      <section className="mx-auto max-w-xl px-5 py-16 md:py-24 text-center">
        <span className="inline-flex rounded-full bg-[var(--color-fox-300)]/25 p-5">
          <Lock className="h-8 w-8 text-[var(--color-fox-700)]" />
        </span>
        <h1 className="mt-6 font-serif text-2xl md:text-3xl tracking-tight">
          {t("rejectedTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--color-ink-500)]">
          {t("rejectedBody")}
        </p>
        {blockedFields.length > 0 && (
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[var(--color-fox-700)]">
            {t("rejectedFieldHint")}
          </p>
        )}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setStep(stepOfField(blockedFields[0] ?? null));
              setPhase("form");
            }}
          >
            <Pencil className="h-4 w-4" />
            {t("rejectedFix")}
          </Button>
          <Button asChild variant="outline" size="md">
            <Link href="/histoires">{t("rejectedBrowse")}</Link>
          </Button>
          <Link
            href={{ pathname: "/faq", hash: "personalization" } as never}
            className="text-sm text-[var(--color-indigo-soft-600)] underline underline-offset-2 hover:text-[var(--color-ink-800)]"
          >
            {t("rejectedLearn")}
          </Link>
        </div>
      </section>
    );
  } else if (phase === "done") {
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
            if (libraryMode) {
              router.push("/admin/histoires" as never);
            } else if (savedIdRef.current) {
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
      { at: 25, title: t("loading2Title"), body: t("loading2Body", { name: params.heroName }) },
      { at: 55, title: t("loading3Title"), body: t("loading3Body") },
      { at: 82, title: t("loading4Title"), body: t("loading4Body") },
    ];
    content = (
      <section className="mx-auto max-w-xl px-5 py-12 md:py-16 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-s.webp" alt="Lunireve" className="mx-auto h-12 w-auto" />
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
          <WorkingTicker
            phrases={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => t(`working${n}`))}
          />
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

        {/* Keep browsing: the story saves itself and the bell will ring.
            Standard cream/ink pairing: readable in light AND dark mode. */}
        <div className="mt-8 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-100)] p-4">
          <p className="text-sm text-[var(--color-ink-700)]">{t("loadingBrowseHint")}</p>
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
            <Link href="/compte/abonnement">
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
          <p className="mt-3 rounded-xl bg-[var(--color-cream-100)] border border-[var(--color-ink-100)] px-3.5 py-2 text-xs text-[var(--color-ink-700)]">
            {t("sequelBanner", { title: params.sequelOf })}
          </p>
        )}

        {/* Quick / advanced switch — quick is the default bedtime path */}
        <div className="mt-5 inline-flex rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-100)] p-1">
          <style>{`@keyframes lunireve-wave { 0% { transform: scale(1); opacity: 0.5 } 100% { transform: scale(1.22); opacity: 0 } }`}</style>
          {(["quick", "advanced"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "relative rounded-full px-4 py-1.5 text-sm transition-colors",
                mode === m
                  ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                  : "text-[var(--color-ink-600)] hover:text-[var(--color-ink-800)]"
              )}
            >
              {/* The waves hug the pill only — the label never moves or scales */}
              {m === "advanced" && advancedWave && mode !== "advanced" && (
                <span className="pointer-events-none absolute inset-0" aria-hidden>
                  {[0, 1].map((w) => (
                    <span
                      key={w}
                      className="absolute inset-0 rounded-full border border-[var(--color-mint-500)]"
                      style={{ animation: `lunireve-wave 1.4s ease-out ${w * 0.55}s 2 both` }}
                    />
                  ))}
                </span>
              )}
              {t(m === "quick" ? "quickMode" : "advancedMode")}
            </button>
          ))}
        </div>

        {/* ---------- QUICK MODE: hero + optional occasion, one button ---------- */}
        {mode === "quick" && (
          <div className="mt-6 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 md:p-8 shadow-[var(--shadow-soft)]">
            {formError && (
              <p className="mb-5 flex items-start gap-2 rounded-xl border border-[var(--color-fox-300)] bg-[var(--color-fox-300)]/10 px-4 py-3 text-sm text-[var(--color-fox-700)]">
                <X className="mt-0.5 h-4 w-4 shrink-0" />
                {t(formError)}
              </p>
            )}
            <h2 className="font-serif text-xl tracking-tight">{t("quickTitle")}</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-500)]">{t("quickHint")}</p>

            {!isKid && profiles.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyProfile(p)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-3 transition-colors",
                      heroProfileId === p.id && params.heroName === p.name
                        ? "border-[var(--color-mint-500)] bg-[var(--color-mint-50)]"
                        : "border-[var(--color-ink-100)] hover:border-[var(--color-ink-200)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    <ChildAvatar color={p.avatar} className="h-12 w-12" />
                    <span className="text-sm font-medium text-[var(--color-ink-800)]">{p.name}</span>
                  </button>
                ))}
              </div>
            )}

            {savedHeroes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {savedHeroes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => applySavedHero(c)}
                    className={chip(selectedHeroId === c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <div className="min-w-[12rem] flex-1">
                <Label htmlFor="quick-name">{t("heroName")} *</Label>
                <Input
                  id="quick-name"
                  value={params.heroName}
                  maxLength={30}
                  onChange={(e) => {
                    setParams((p) => ({ ...p, heroName: e.target.value, heroDescription: undefined }));
                    setSelectedHeroId(null);
                  }}
                  className={cn("mt-1.5", blockedCls("heroName"))}
                />
              </div>
              <div>
                {/* Block label + breathing room below: the focus ring around
                    the select must never touch the label text */}
                <Label htmlFor="quick-age" className="block">
                  {t("heroAge")}
                </Label>
                <select
                  id="quick-age"
                  value={params.heroAge}
                  onChange={(e) => set("heroAge", parseInt(e.target.value, 10))}
                  className="mt-2.5 h-10 rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-3 text-sm text-[var(--color-ink-800)]"
                >
                  {Array.from({ length: isFree ? 12 : 16 }, (_, i) => i + 1).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* One merged group: occasions AND situations, one tap either way */}
            <div className="mt-5">
              <Label>{t("quickPresetTitle")}</Label>
              <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("situationHint")}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[...OCCASION_PRESETS, ...SITUATION_PRESETS].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={chip(presetId === preset.id)}
                  >
                    {locale === "en" ? preset.en : preset.fr}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme not in our list? Free text, same field as advanced mode */}
            <div className="mt-4">
              <Label htmlFor="quick-theme-free" className="block">
                {t("themeFree")}
              </Label>
              <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("themeFreeHint")}</p>
              <Input
                id="quick-theme-free"
                value={params.subTheme ?? ""}
                maxLength={60}
                placeholder={t("themeFreePlaceholder")}
                onChange={(e) => set("subTheme", e.target.value || undefined)}
                className={cn("mt-2 max-w-sm", blockedCls("subTheme"))}
              />
            </div>

            {/* Optional free-text details (max 3, shared with advanced mode) */}
            <div className="mt-4">
              <Label>{t("extraInfoTitle")}</Label>
              <div className="mt-2 space-y-2">
                {extraInfo.map((info, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={info}
                      maxLength={140}
                      placeholder={t("extraInfoPlaceholder")}
                      aria-label={`${t("extraInfoTitle")} #${i + 1}`}
                      onChange={(e) => setExtraInfo(i, e.target.value)}
                      className={cn("flex-1", blockedCls("extraInfo"))}
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

            {/* New character straight from quick mode */}
            {!isKid && (
              <Link
                href="/compte/personnages/nouveau"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--color-ink-200)] px-3.5 py-1.5 text-sm text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
              >
                <Plus className="h-3.5 w-3.5" />
                {tCharsPage("createInline")}
              </Link>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Button variant="mint" size="lg" onClick={() => startGeneration()}>
                <Wand2 className="h-4 w-4" />
                {t("generate")}
              </Button>
              <button
                type="button"
                onClick={() => setMode("advanced")}
                className="text-sm text-[var(--color-indigo-soft-600)] underline underline-offset-2 hover:text-[var(--color-ink-800)]"
              >
                {t("advancedSwitch")}
              </button>
            </div>
            <p className="mt-4 text-xs text-[var(--color-ink-400)]">{t("privacyNote")}</p>
          </div>
        )}

        {mode === "advanced" && (
          <>
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

              {/* Source 1: the family's child profiles (one tap = child is the hero) */}
              {!isKid && profiles.length > 0 && (
                <div>
                  <p className="text-xs text-[var(--color-ink-500)]">{t("heroFromChildren")}</p>
                  <div className="mt-2 flex flex-wrap gap-2.5">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyProfile(p)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-3 transition-colors",
                          heroProfileId === p.id && params.heroName === p.name
                            ? "border-[var(--color-mint-500)] bg-[var(--color-mint-50)]"
                            : "border-[var(--color-ink-100)] hover:border-[var(--color-ink-200)] hover:bg-[var(--color-cream-100)]"
                        )}
                      >
                        <ChildAvatar color={p.avatar} className="h-14 w-14" />
                        <span className="text-sm font-medium text-[var(--color-ink-800)]">{p.name}</span>
                        <span className="text-[11px] text-[var(--color-ink-500)]">
                          {tCharsPage("ageUnit", { age: p.age })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Source 2: saved characters from the wizard */}
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
                    setParams((p) => ({ ...p, heroName: e.target.value, heroDescription: undefined }));
                    setSelectedHeroId(null);
                  }}
                  className={cn("mt-1.5", blockedCls("heroName"))}
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
                  <Link
                    href="/compte/abonnement"
                    className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-ink-400)] underline underline-offset-2 hover:text-[var(--color-ink-700)]"
                  >
                    <Lock className="h-3 w-3" />
                    {t("heroAgeLockNote")}
                  </Link>
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
                  <Link
                    href="/compte/abonnement"
                    className="mt-1.5 inline-block text-xs text-[var(--color-ink-400)] underline underline-offset-2 hover:text-[var(--color-ink-700)]"
                  >
                    {t("heroTypeLockNote")}
                  </Link>
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

              {params.heroDescription ? (
                <div className="rounded-2xl border border-[var(--color-mint-300)] bg-[var(--color-mint-50)] p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-mint-700)]">
                    <Check className="h-3.5 w-3.5" />
                    {t("heroFullProfile")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-700)]">
                    {params.heroDescription}
                  </p>
                  <p className="mt-2 text-xs text-[var(--color-ink-400)]">
                    {t("heroFullProfileHint")}{" "}
                    <Link
                      href="/compte/personnages"
                      className="underline underline-offset-2 hover:text-[var(--color-ink-700)]"
                    >
                      {t("manageCharacters").replace(/^\+\s*/, "")}
                    </Link>
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="hero-trait">{t("heroTrait")}</Label>
                  <Input
                    id="hero-trait"
                    value={params.trait}
                    maxLength={80}
                    placeholder={t("heroTraitPlaceholder")}
                    onChange={(e) => set("trait", e.target.value)}
                    className={cn("mt-1.5", blockedCls("trait"))}
                  />
                  {counter(params.trait, 80)}
                </div>
              )}
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
                      className={cn("flex-1", blockedCls("companions"))}
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
                    {/* Bookmark: save this companion for reuse in future stories */}
                    {!isKid && c.name.trim().length >= 2 && (
                      isCompanionSaved(c.name) ? (
                        <span
                          title={t("companionSaved")}
                          className="rounded-lg p-2 text-[var(--color-mint-700)]"
                        >
                          <Check className="h-4 w-4" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={slotsLeft("secondary") <= 0}
                          onClick={() => saveCompanionToLibrary(c)}
                          title={t("companionSave")}
                          aria-label={t("companionSave")}
                          className="rounded-lg p-2 text-[var(--color-ink-400)] hover:text-[var(--color-mint-700)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <BookmarkPlus className="h-4 w-4" />
                        </button>
                      )
                    )}
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

                <div className="flex flex-wrap gap-2">
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
                  {!isKid && (
                    <Link
                      href="/compte/personnages/nouveau"
                      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--color-ink-200)] px-3.5 py-1.5 text-sm text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {tCharsPage("createInline")}
                    </Link>
                  )}
                </div>
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

              {/* ONE merged preset group (occasions AND situations), exactly
                  like quick mode: one tap fills theme + mood + a plot note */}
              <div>
                <Label>{t("quickPresetTitle")}</Label>
                <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("situationHint")}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[...OCCASION_PRESETS, ...SITUATION_PRESETS].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={chip(presetId === preset.id)}
                    >
                      {locale === "en" ? preset.en : preset.fr}
                    </button>
                  ))}
                </div>
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

              {/* One theme choice, organized in two readable groups: genre
                  (how the story feels) and universe (what it is about). */}
              <div>
                <Label>{t("theme")}</Label>
                <p className="mt-2 text-[11px] uppercase tracking-widest text-[var(--color-ink-400)]">
                  {t("genreGroup")}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {THEME_GENRES.map((slug) => (
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
                <p className="mt-3 text-[11px] uppercase tracking-widest text-[var(--color-ink-400)]">
                  {t("universGroup")}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {THEME_UNIVERSES.map((slug) => (
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

                {/* Same section, one concept: refine the picked theme with a
                    suggested angle, or write a theme we don't list. No more
                    separate "story angle" block. */}
                <div className="mt-4">
                  <Label htmlFor="theme-free" className="block">
                    {t("themeFree")}
                  </Label>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("themeFreeHint")}</p>
                  {(STORY_SUBTHEMES[params.theme] ?? []).length > 0 && (
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
                  )}
                  <Input
                    id="theme-free"
                    value={params.subTheme ?? ""}
                    maxLength={60}
                    placeholder={t("themeFreePlaceholder")}
                    onChange={(e) => set("subTheme", e.target.value || undefined)}
                    className={cn("mt-2 max-w-sm", blockedCls("subTheme"))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="place">{t("place", { gender: params.heroType ?? "autre" })}</Label>
                <Input
                  id="place"
                  value={params.place}
                  maxLength={80}
                  placeholder={t("placePlaceholder")}
                  onChange={(e) => set("place", e.target.value)}
                  className={cn("mt-1.5", blockedCls("place"))}
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
                            className={cn("flex-1", blockedCls("extraInfo"))}
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

              {/* Optional moral: one tap for the classics, free text for a
                  precise lesson (a fear to tame, a situation to work through). */}
              {!isKid && (
                <div>
                  <Label htmlFor="moral">{t("moralTitle")}</Label>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("moralHint")}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {STORY_MORALS.map((m) => {
                      const label = storyOptLabel(m, locale);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => set("moral", params.moral === label ? "" : label)}
                          className={chip(params.moral === label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <Input
                    id="moral"
                    value={params.moral ?? ""}
                    maxLength={100}
                    placeholder={t("moralPlaceholder")}
                    onChange={(e) => set("moral", e.target.value)}
                    className={cn("mt-2 max-w-sm", blockedCls("moral"))}
                  />
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

              {/* Author: who the story is filed under. Prefilled from the
                  current space (parent, or the child whose bubble we're in). */}
              {!isKid && (
                <div>
                  <Label>{t("authorTitle")}</Label>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("authorHint")}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setProfileId(null)}
                      className={chip(profileId === null)}
                    >
                      {t("authorParent")}
                    </button>
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProfileId(p.id)}
                        className={chip(profileId === p.id)}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isKid && (
                <div>
                  <Label>{t("style")}</Label>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{t("styleHint")}</p>
                  {/* Visual style cards: the IMAGE is the card (full-bleed,
                      /public/illustrations/style-<id>.png swaps in later) so
                      families SEE what watercolor vs comic-book looks like. */}
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {STYLES.map((s) => {
                      const locked = isFree && s !== "automatique";
                      const active = params.style === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={locked}
                          onClick={() => set("style", s)}
                          aria-pressed={active}
                          className={cn(
                            "group overflow-hidden rounded-2xl border-2 text-left transition-colors",
                            active
                              ? "border-[var(--color-mint-500)]"
                              : "border-[var(--color-ink-100)] hover:border-[var(--color-ink-300)]",
                            locked && "cursor-not-allowed opacity-50"
                          )}
                        >
                          <span
                            data-image-slot={`style-${s}`}
                            title={`style-${s}`}
                            aria-hidden
                            className="relative flex aspect-[4/3] w-full items-center justify-center bg-[var(--color-cream-100)] text-[var(--color-ink-300)]"
                          >
                            {/* The sample art shows itself as soon as the file
                                exists at /illustrations/style-<id>.webp; until
                                then (and if it ever 404s) the icon stands in. */}
                            <ImageIcon className="h-8 w-8" />
                            {/* Revealed on LOAD, not hidden on error: a handler
                                attached after the request already failed never
                                fires, leaving a broken-image glyph. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/illustrations/style-${s}.webp`}
                              alt=""
                              loading="lazy"
                              style={{ opacity: 0 }}
                              onLoad={(e) => {
                                e.currentTarget.style.opacity = "1";
                              }}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                            {locked && (
                              <span className="absolute right-2 top-2 rounded-full bg-black/30 p-1.5 text-white">
                                <Lock className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </span>
                          <span
                            className={cn(
                              "block px-3 py-2 text-sm font-medium text-[var(--color-ink-800)]",
                              active ? "bg-[var(--color-mint-100)]" : "bg-[var(--color-cream-50)]"
                            )}
                          >
                            {t(`style_${s}`)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {isFree && (
                    <Link
                      href="/compte/abonnement"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--color-indigo-soft-600)] underline underline-offset-2 hover:text-[var(--color-ink-800)]"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {t("styleUnlockCta")}
                    </Link>
                  )}
                </div>
              )}

              <div>
                <h3 className="font-serif text-lg tracking-tight text-center">
                  {t("summaryTitle", { name: capitalizeName(params.heroName) })}
                </h3>
                <dl className="mt-4 space-y-2 text-sm">
                  {[
                    [
                      t("heroName"),
                      `${capitalizeName(params.heroName)}, ${t("readingRangeLabel", { range: params.heroAge })} (${storyOptLabel(
                        HERO_TYPES.find((h) => h.id === params.heroType) ?? HERO_TYPES[0],
                        locale
                      ).toLowerCase()})`,
                    ],
                    !isKid && [
                      t("authorTitle"),
                      profiles.find((p) => p.id === profileId)?.name ?? t("authorParent"),
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
                    params.place && [t("place", { gender: params.heroType ?? "autre" }), params.place],
                    params.moral && [t("moralTitle"), params.moral],
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

          </>
        )}

        {/* Contextual help: creation-specific FAQ (parents only, kids keep
            the bubble distraction-free). Pushed well below the form with a
            divider + quiet kicker, so the creation card stays the only focus. */}
        {!isKid && (
          <div className="mt-24 border-t border-[var(--color-ink-100)] pt-10">
            <p className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-ink-400)]">
              {t("faqKicker")}
            </p>
            <h2 className="mt-1.5 mb-4 font-serif text-xl tracking-tight text-[var(--color-ink-600)]">
              {t("faqTitle")}
            </h2>
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
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 font-serif text-lg tracking-tight">
                {kidProfile && <ChildAvatar color={kidProfile.avatar} className="h-9 w-9" />}
                {kidProfile?.name}
              </span>
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        {content}
      </>
    );
  }

  return <AccountShell>{content}</AccountShell>;
}
