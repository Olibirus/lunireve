"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  createCharacter,
  slotsLeft,
  CHARACTER_TYPES,
  CHARACTER_GENDERS,
  CHARACTER_TRAITS,
  type CharacterRole,
  type CharacterType,
  type CharacterGender,
  type SavedCharacter,
} from "@/lib/characters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Compact "create a recurring character" form embedded in the personalize-story
 * flow, so a family with no saved characters can make one without leaving the
 * page. Writes through the same lib/characters store as the manage page.
 */
export function InlineCharacterCreator({
  role,
  onCreated,
}: {
  role: CharacterRole;
  onCreated: (c: SavedCharacter) => void;
}) {
  const t = useTranslations("characters_page");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<CharacterType>(role === "main" ? "enfant" : "animal");
  const [gender, setGender] = useState<CharacterGender>("neutre");
  const [description, setDescription] = useState("");
  const [traits, setTraits] = useState<string[]>([]);

  const left = slotsLeft(role);

  function toggleTrait(tr: string) {
    setTraits((prev) =>
      prev.includes(tr) ? prev.filter((x) => x !== tr) : prev.length < 4 ? [...prev, tr] : prev
    );
  }

  function submit() {
    if (name.trim().length < 2) return;
    const created = createCharacter({
      name: name.trim(),
      type,
      role,
      gender,
      description: description.trim(),
      traits,
    });
    if (created) {
      onCreated(created);
      setName("");
      setDescription("");
      setTraits([]);
      setOpen(false);
    }
  }

  const pill = (active: boolean) =>
    cn(
      "rounded-xl border px-3 py-1.5 text-sm transition-colors",
      active
        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
        : "border-[var(--color-ink-100)] bg-[var(--color-cream-50)] hover:bg-[var(--color-cream-100)]"
    );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={left <= 0}
        className={cn(
          "mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1 text-xs transition-colors",
          left <= 0
            ? "cursor-not-allowed border-[var(--color-ink-100)] text-[var(--color-ink-300)]"
            : "border-[var(--color-ink-200)] text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
        )}
      >
        {left <= 0 ? <Lock className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        {t("createInline")}
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-100)] p-4">
      <div>
        <Label htmlFor="inline-char-name">{t("name")}</Label>
        <Input
          id="inline-char-name"
          value={name}
          maxLength={30}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5"
          autoFocus
        />
      </div>
      <div>
        <Label>{t("gender")}</Label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CHARACTER_GENDERS.map((v) => (
            <button key={v} type="button" onClick={() => setGender(v)} className={pill(gender === v)}>
              {t(`gender_${v}`)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>{t("type")}</Label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CHARACTER_TYPES.map((v) => (
            <button key={v} type="button" onClick={() => setType(v)} className={pill(type === v)}>
              {t(`type_${v}`)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="inline-char-desc">{t("description")}</Label>
        <Input
          id="inline-char-desc"
          value={description}
          maxLength={80}
          placeholder={t("descriptionPlaceholder")}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>{t("traits")}</Label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CHARACTER_TRAITS.map((tr) => (
            <button
              key={tr}
              type="button"
              onClick={() => toggleTrait(tr)}
              aria-pressed={traits.includes(tr)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                traits.includes(tr)
                  ? "border-transparent bg-[var(--color-mint-400)] text-[#17224a]"
                  : "border-[var(--color-ink-100)] bg-[var(--color-cream-50)] hover:bg-[var(--color-cream-100)]"
              )}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="primary" size="sm" disabled={name.trim().length < 2} onClick={submit}>
          <Plus className="h-3.5 w-3.5" />
          {t("createCta")}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
