"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  createCharacter,
  slotsLeft,
  characterLimits,
  type CharacterAppearance,
  type CharacterGender,
  type CharacterRole,
  type CharacterType,
} from "@/lib/characters";
import {
  WIZARD_TYPES,
  GENDER_HUMAN,
  GENDER_ANIMAL,
  SKIN_OPTIONS,
  HAIR_COLORS,
  HAIR_STYLES,
  HAIR_SPECIALS,
  EYE_OPTIONS,
  GLASSES_OPTIONS,
  BUILD_OPTIONS,
  MOBILITY_OPTIONS,
  HAT_OPTIONS,
  CLOTHING_OPTIONS,
  EXTRA_OPTIONS,
  ANIMAL_FAMILIES,
  ANIMAL_SPECIES,
  COAT_OPTIONS,
  ANIMAL_SIZES,
  ANIMAL_ACCESSORIES,
  TRAIT_GROUPS,
  MAX_TRAITS,
  MAX_ACCESSORIES,
  MAX_MOBILITY,
  MAX_ANIMAL_ACCESSORIES,
  optLabel,
  describeCharacter,
} from "@/lib/characterOptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionCard, Chip, Section, MiniSlot } from "./OptionCards";
import { ArrowLeft, Check, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Recurring-character creation wizard: 4 steps (Type, Identité, Apparence,
 * Personnalité) with visual option cards + a live preview panel, modeled on
 * the meshistoiresdusoir flow. Step 3 is tailored per type: humans pick skin,
 * hair, eyes, glasses, build, inclusivity details and up to 6 accessories;
 * animals pick a family, species, coat, size and up to 3 accessories.
 * Dashboard-only: lives under /compte, which is auth-gated.
 */
export default function NewCharacterWizard() {
  const t = useTranslations("characters_page");
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [type, setType] = useState<CharacterType | null>(null);
  const [role, setRole] = useState<CharacterRole>("secondary");
  const [name, setName] = useState("");
  const [age, setAge] = useState(6);
  const [gender, setGender] = useState<CharacterGender>("neutre");
  const [app, setApp] = useState<CharacterAppearance>({});
  const [traits, setTraits] = useState<string[]>([]);
  const [slots, setSlots] = useState<{ main: number; secondary: number } | null>(null);

  useEffect(() => {
    setSlots({ main: slotsLeft("main"), secondary: slotsLeft("secondary") });
  }, []);

  const setA = <K extends keyof CharacterAppearance>(k: K, v: CharacterAppearance[K]) =>
    setApp((p) => ({ ...p, [k]: p[k] === v ? undefined : v }));

  function toggleIn(k: "mobility" | "clothing" | "extras" | "accessories", id: string, cap: number) {
    setApp((p) => {
      const list = p[k] ?? [];
      if (list.includes(id)) return { ...p, [k]: list.filter((x) => x !== id) };
      if (list.length >= cap) return p;
      return { ...p, [k]: [...list, id] };
    });
  }

  function pickType(next: CharacterType) {
    setType(next);
    setApp({});
    setAge(next === "enfant" ? 6 : next === "adulte" ? 30 : 3);
  }

  function toggleTrait(id: string) {
    setTraits((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX_TRAITS ? [...prev, id] : prev
    );
  }

  const accessoriesUsed = (app.hat ? 1 : 0) + (app.clothing?.length ?? 0) + (app.extras?.length ?? 0);
  const genders = type === "animal" ? GENDER_ANIMAL : GENDER_HUMAN;
  const hairIsSpecial = HAIR_SPECIALS.some((s) => s.id === app.hairStyle);
  const preview = useMemo(
    () => (type ? describeCharacter({ type, appearance: app }, locale) : ""),
    [type, app, locale]
  );
  const roleLeft = slots ? slots[role] : 1;
  const ageChoices =
    type === "adulte" ? [13, 15, 18, 25, 30, 40, 50, 60, 70] : type === "animal"
      ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const steps = [t("step_type"), t("step_identity"), t("step_appearance"), t("step_personality")];
  const canNext =
    step === 0 ? type !== null : step === 1 ? name.trim().length >= 2 : true;

  function create() {
    if (!type || name.trim().length < 2 || roleLeft <= 0) return;
    const created = createCharacter({
      name: name.trim(),
      type,
      role,
      gender,
      age,
      description: describeCharacter({ type, appearance: app }, locale),
      traits,
      appearance: app,
    });
    if (created) router.push("/compte/personnages");
  }

  const typeLabel = type ? optLabel(WIZARD_TYPES.find((x) => x.id === type)!, locale) : "";
  const genderLabel = optLabel(genders.find((g) => g.id === gender)!, locale);

  return (
    <div>
      <Link
        href="/compte/personnages"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("wizardBack")}
      </Link>

      <h1 className="mt-4 font-serif text-3xl tracking-tight">{t("wizardTitle")}</h1>

      {/* Step indicator: 01-04, completed steps clickable */}
      <ol className="mt-5 flex flex-wrap items-center gap-2 text-xs">
        {steps.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && setStep(i)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors",
                i === step
                  ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                  : i < step
                  ? "bg-[var(--color-mint-200)] text-[var(--color-ink-700)] hover:bg-[var(--color-mint-300)]"
                  : "bg-[var(--color-cream-200)] text-[var(--color-ink-400)]"
              )}
            >
              {i < step ? <Check className="h-3 w-3" /> : <span className="font-mono">0{i + 1}</span>}
              {label}
            </button>
          </li>
        ))}
        <li className="ml-auto text-[var(--color-ink-400)]">{t("stepOf", { current: step + 1 })}</li>
      </ol>

      {/* Mobile live summary */}
      {type && (
        <p className="mt-3 rounded-xl bg-[var(--color-cream-100)] px-3.5 py-2 text-xs text-[var(--color-ink-600)] lg:hidden">
          <span className="font-medium">{name.trim() || t("previewEmptyName")}</span>
          {" · "}{typeLabel}{" · "}{t("ageUnit", { age })}{" · "}{genderLabel}
          {preview && <span className="block mt-0.5 text-[var(--color-ink-400)]">{preview}</span>}
        </p>
      )}

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_280px] lg:items-start lg:gap-8">
        {/* ---------------- Steps ---------------- */}
        <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 md:p-8 shadow-[var(--shadow-soft)]">
          {step === 0 && (
            <div>
              <h2 className="font-serif text-xl tracking-tight">{t("typeTitle")}</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-500)]">{t("typeHint")}</p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {WIZARD_TYPES.map((opt) => (
                  <OptionCard
                    key={opt.id}
                    size="lg"
                    selected={type === opt.id}
                    onClick={() => pickType(opt.id as CharacterType)}
                    label={optLabel(opt, locale)}
                    sublabel={t(`typeSub_${opt.id}`)}
                    slotId={`char-type-${opt.id}`}
                  />
                ))}
              </div>
              <p className="mt-5 text-xs text-[var(--color-ink-400)]">{t("typeNote")}</p>
            </div>
          )}

          {step === 1 && type && (
            <div className="space-y-7">
              <div>
                <h2 className="font-serif text-xl tracking-tight">{t("identityTitle")}</h2>
                <p className="mt-1 text-sm text-[var(--color-ink-500)]">{t("identityHint")}</p>
              </div>

              <div>
                <Label htmlFor="wiz-name">{t("name")} *</Label>
                <Input
                  id="wiz-name"
                  value={name}
                  maxLength={30}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 max-w-sm"
                  autoFocus
                />
              </div>

              <Section title={t("ageTitle")}>
                <div className="flex flex-wrap gap-1.5">
                  {ageChoices.map((a) => (
                    <Chip key={a} selected={age === a} onClick={() => setAge(a)}>
                      {t("ageUnit", { age: a })}
                    </Chip>
                  ))}
                </div>
              </Section>

              <Section title={t("genderTitle")}>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {genders.map((g) => (
                    <OptionCard
                      key={g.id}
                      size="md"
                      selected={gender === g.id}
                      onClick={() => setGender(g.id as CharacterGender)}
                      label={optLabel(g, locale)}
                      slotId={`char-gender-${type === "animal" ? "animal-" : ""}${g.id}`}
                    />
                  ))}
                </div>
              </Section>

              <Section title={t("role")} hint={t("roleHint")}>
                <div className="flex flex-wrap gap-2">
                  {(["main", "secondary"] as const).map((r) => (
                    <Chip key={r} selected={role === r} onClick={() => setRole(r)}>
                      {t(`role_${r}`)}
                      {slots && (
                        <span className="opacity-70">({t("slotsLeftShort", { count: slots[r] })})</span>
                      )}
                    </Chip>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {step === 2 && type && type !== "animal" && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-xl tracking-tight">{t("appearanceTitle")}</h2>
                <p className="mt-1 text-sm text-[var(--color-ink-500)]">{t("appearanceHint")}</p>
              </div>

              <Section title={t("skinTitle")}>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {SKIN_OPTIONS.map((o) => (
                    <OptionCard
                      key={o.id}
                      size="md"
                      selected={app.skin === o.id}
                      onClick={() => setA("skin", o.id)}
                      label={optLabel(o, locale)}
                      slotId={`char-skin-${o.id}`}
                    />
                  ))}
                </div>
              </Section>

              <Section title={t("hairTitle")} hint={t("hairHint")}>
                <div className="flex flex-wrap gap-1.5">
                  {HAIR_COLORS.map((o) => (
                    <Chip
                      key={o.id}
                      dot={o.dot}
                      selected={app.hairColor === o.id && !hairIsSpecial}
                      disabled={hairIsSpecial}
                      onClick={() => setA("hairColor", o.id)}
                    >
                      {optLabel(o, locale)}
                    </Chip>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {HAIR_STYLES.map((o) => (
                    <OptionCard
                      key={o.id}
                      size="sm"
                      selected={app.hairStyle === o.id}
                      onClick={() => setA("hairStyle", o.id)}
                      label={optLabel(o, locale)}
                      slotId={`char-hair-${o.id}`}
                    />
                  ))}
                  {HAIR_SPECIALS.map((o) => (
                    <OptionCard
                      key={o.id}
                      size="sm"
                      selected={app.hairStyle === o.id}
                      onClick={() =>
                        setApp((p) => ({
                          ...p,
                          hairStyle: p.hairStyle === o.id ? undefined : o.id,
                          hairColor: p.hairStyle === o.id ? p.hairColor : undefined,
                        }))
                      }
                      label={optLabel(o, locale)}
                      slotId={`char-hair-${o.id}`}
                    />
                  ))}
                </div>
              </Section>

              <Section title={t("eyesTitle")}>
                <div className="flex flex-wrap gap-1.5">
                  {EYE_OPTIONS.map((o) => (
                    <Chip key={o.id} dot={o.dot} selected={app.eyes === o.id} onClick={() => setA("eyes", o.id)}>
                      {optLabel(o, locale)}
                    </Chip>
                  ))}
                </div>
              </Section>

              <Section title={t("glassesTitle")}>
                <div className="mb-2.5">
                  <Chip selected={!app.glasses} onClick={() => setApp((p) => ({ ...p, glasses: undefined }))}>
                    {t("noGlasses")}
                  </Chip>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {GLASSES_OPTIONS.map((o) => (
                    <OptionCard
                      key={o.id}
                      size="sm"
                      selected={app.glasses === o.id}
                      onClick={() => setA("glasses", o.id)}
                      label={optLabel(o, locale)}
                      slotId={`char-glasses-${o.id}`}
                    />
                  ))}
                </div>
              </Section>

              <Section title={t("buildTitle")}>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {BUILD_OPTIONS.map((o) => (
                    <OptionCard
                      key={o.id}
                      size="sm"
                      selected={app.build === o.id}
                      onClick={() => setA("build", o.id)}
                      label={optLabel(o, locale)}
                      slotId={`char-build-${o.id}`}
                    />
                  ))}
                </div>
              </Section>

              <details className="group rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-100)]/60 p-4">
                <summary className="cursor-pointer list-none font-serif text-lg tracking-tight">
                  {t("optionalDetails")}
                  <span className="ml-2 text-xs font-sans text-[var(--color-ink-400)]">{t("mobilityHint")}</span>
                </summary>
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {MOBILITY_OPTIONS.map((o) => (
                    <OptionCard
                      key={o.id}
                      size="sm"
                      selected={(app.mobility ?? []).includes(o.id)}
                      onClick={() => toggleIn("mobility", o.id, MAX_MOBILITY)}
                      label={optLabel(o, locale)}
                      slotId={`char-mobility-${o.id}`}
                    />
                  ))}
                </div>
              </details>

              <Section
                title={t("accessoriesTitle")}
                hint={t("accessoriesHint", { max: MAX_ACCESSORIES, count: accessoriesUsed })}
              >
                <p className="text-sm font-medium text-[var(--color-ink-700)]">{t("hatsTitle")}</p>
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {HAT_OPTIONS.map((o) => (
                    <OptionCard
                      key={o.id}
                      size="sm"
                      selected={app.hat === o.id}
                      onClick={() => {
                        if (app.hat !== o.id && accessoriesUsed >= MAX_ACCESSORIES && !app.hat) return;
                        setA("hat", o.id);
                      }}
                      label={optLabel(o, locale)}
                      slotId={`char-hat-${o.id}`}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm font-medium text-[var(--color-ink-700)]">{t("clothesTitle")}</p>
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {CLOTHING_OPTIONS.map((o) => {
                    const on = (app.clothing ?? []).includes(o.id);
                    return (
                      <OptionCard
                        key={o.id}
                        size="sm"
                        selected={on}
                        onClick={() => {
                          if (!on && accessoriesUsed >= MAX_ACCESSORIES) return;
                          toggleIn("clothing", o.id, MAX_ACCESSORIES);
                        }}
                        label={optLabel(o, locale)}
                        slotId={`char-clothing-${o.id}`}
                      />
                    );
                  })}
                </div>
                <p className="mt-4 text-sm font-medium text-[var(--color-ink-700)]">{t("othersTitle")}</p>
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {EXTRA_OPTIONS.map((o) => {
                    const on = (app.extras ?? []).includes(o.id);
                    return (
                      <OptionCard
                        key={o.id}
                        size="sm"
                        selected={on}
                        onClick={() => {
                          if (!on && accessoriesUsed >= MAX_ACCESSORIES) return;
                          toggleIn("extras", o.id, MAX_ACCESSORIES);
                        }}
                        label={optLabel(o, locale)}
                        slotId={`char-extra-${o.id}`}
                      />
                    );
                  })}
                </div>
              </Section>
            </div>
          )}

          {step === 2 && type === "animal" && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-xl tracking-tight">{t("appearanceTitle")}</h2>
                <p className="mt-1 text-sm text-[var(--color-ink-500)]">{t("animalAppearanceHint")}</p>
              </div>

              <Section title={t("familyTitle")}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {ANIMAL_FAMILIES.map((o) => (
                    <OptionCard
                      key={o.id}
                      size="md"
                      selected={app.family === o.id}
                      onClick={() =>
                        setApp((p) => ({
                          ...p,
                          family: p.family === o.id ? undefined : o.id,
                          species: undefined,
                        }))
                      }
                      label={optLabel(o, locale)}
                      slotId={`char-animal-${o.id}`}
                    />
                  ))}
                </div>
              </Section>

              {app.family && (
                <Section title={t("speciesTitle")}>
                  <div className="flex flex-wrap gap-1.5">
                    {(ANIMAL_SPECIES[app.family] ?? []).map((o) => (
                      <Chip key={o.id} selected={app.species === o.id} onClick={() => setA("species", o.id)}>
                        {optLabel(o, locale)}
                      </Chip>
                    ))}
                  </div>
                </Section>
              )}

              <Section title={t("coatTitle")}>
                <div className="flex flex-wrap gap-1.5">
                  {COAT_OPTIONS.map((o) => (
                    <Chip key={o.id} dot={o.dot} selected={app.coat === o.id} onClick={() => setA("coat", o.id)}>
                      {optLabel(o, locale)}
                    </Chip>
                  ))}
                </div>
              </Section>

              <Section title={t("sizeTitle")}>
                <div className="flex flex-wrap gap-1.5">
                  {ANIMAL_SIZES.map((o) => (
                    <Chip key={o.id} selected={app.size === o.id} onClick={() => setA("size", o.id)}>
                      {optLabel(o, locale)}
                    </Chip>
                  ))}
                </div>
              </Section>

              <Section
                title={t("accessoriesTitle")}
                hint={t("accessoriesHint", {
                  max: MAX_ANIMAL_ACCESSORIES,
                  count: app.accessories?.length ?? 0,
                })}
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {ANIMAL_ACCESSORIES.map((o) => (
                    <OptionCard
                      key={o.id}
                      size="sm"
                      selected={(app.accessories ?? []).includes(o.id)}
                      onClick={() => toggleIn("accessories", o.id, MAX_ANIMAL_ACCESSORIES)}
                      label={optLabel(o, locale)}
                      slotId={`char-animal-acc-${o.id}`}
                    />
                  ))}
                </div>
              </Section>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="font-serif text-xl tracking-tight">{t("personalityTitle")}</h2>
                  <p className="mt-1 text-sm text-[var(--color-ink-500)]">{t("personalityHint")}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs",
                    traits.length >= MAX_TRAITS
                      ? "bg-[var(--color-mint-200)] text-[var(--color-ink-800)]"
                      : "bg-[var(--color-cream-200)] text-[var(--color-ink-500)]"
                  )}
                >
                  {t("traitsCount", { count: traits.length, max: MAX_TRAITS })}
                </span>
              </div>

              {TRAIT_GROUPS.map((group) => (
                <div key={group.id}>
                  <p className="text-sm font-medium text-[var(--color-ink-700)]">
                    {optLabel(group, locale)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {group.traits.map((tr) => {
                      const on = traits.includes(tr.id);
                      return (
                        <Chip
                          key={tr.id}
                          selected={on}
                          disabled={!on && traits.length >= MAX_TRAITS}
                          onClick={() => toggleTrait(tr.id)}
                        >
                          <span aria-hidden>{tr.emoji}</span> {optLabel(tr, locale)}
                        </Chip>
                      );
                    })}
                  </div>
                </div>
              ))}

              {roleLeft <= 0 && slots && (
                <p className="flex items-center gap-2 rounded-xl bg-[var(--color-cream-100)] px-4 py-3 text-sm text-[var(--color-ink-500)]">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>
                    {t(role === "main" ? "limitMain" : "limitSecondary", {
                      limit: characterLimits()[role],
                    })}{" "}
                    <Link href="/tarifs" className="underline hover:text-[var(--color-ink-800)]">
                      {t("upgradeLink")}
                    </Link>
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between border-t border-[var(--color-ink-100)] pt-5">
            <Button
              variant="ghost"
              size="md"
              onClick={() => (step === 0 ? router.push("/compte/personnages") : setStep((s) => s - 1))}
            >
              {t("wizardBack")}
            </Button>
            {step < 3 ? (
              <Button variant="primary" size="md" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                {t("wizardNext")}
              </Button>
            ) : (
              <Button
                variant="mint"
                size="md"
                disabled={!type || name.trim().length < 2 || roleLeft <= 0}
                onClick={create}
              >
                <Sparkles className="h-4 w-4" />
                {t("createCta")}
              </Button>
            )}
          </div>
        </div>

        {/* ---------------- Live preview (desktop) ---------------- */}
        <aside className="hidden lg:block sticky top-24 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
            {t("previewTitle")}
          </p>
          <MiniSlot slotId="char-preview" className="mt-3 aspect-[3/4] w-full" />
          <p className="mt-4 font-serif text-xl tracking-tight">
            {name.trim() || t("previewEmptyName")}
          </p>
          {type && (
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-full bg-[var(--color-cream-200)] px-2.5 py-0.5">{typeLabel}</span>
              <span className="rounded-full bg-[var(--color-cream-200)] px-2.5 py-0.5">
                {t("ageUnit", { age })}
              </span>
              <span className="rounded-full bg-[var(--color-cream-200)] px-2.5 py-0.5">{genderLabel}</span>
              <span className="rounded-full bg-[var(--color-indigo-soft-100)] px-2.5 py-0.5 text-[var(--color-indigo-soft-700)]">
                {t(`role_${role}`)}
              </span>
            </div>
          )}
          {preview && (
            <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-500)]">{preview}</p>
          )}
          {traits.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {traits.map((id) => {
                const tr = TRAIT_GROUPS.flatMap((g) => g.traits).find((x) => x.id === id);
                return (
                  <span
                    key={id}
                    className="rounded-full bg-[var(--color-mint-100)] px-2 py-0.5 text-[11px] text-[var(--color-ink-700)]"
                  >
                    {tr ? `${tr.emoji} ${optLabel(tr, locale)}` : id}
                  </span>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
