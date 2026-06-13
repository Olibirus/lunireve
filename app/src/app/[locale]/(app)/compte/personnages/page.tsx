"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  readCharacters,
  createCharacter,
  deleteCharacter,
  CHARACTER_TYPES,
  CHARACTER_GENDERS,
  CHARACTER_TRAITS,
  FREE_LIMITS,
  slotsLeft,
  type SavedCharacter,
  type CharacterType,
  type CharacterRole,
  type CharacterGender,
} from "@/lib/characters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Plus, Trash2, UserSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Recurring characters (#16) — create once, reuse in every story. */
export default function CharactersPage() {
  const t = useTranslations("characters_page");
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<CharacterType>("animal");
  const [role, setRole] = useState<CharacterRole>("secondary");
  const [gender, setGender] = useState<CharacterGender>("neutre");
  const [description, setDescription] = useState("");
  const [traits, setTraits] = useState<string[]>([]);

  useEffect(() => {
    setCharacters(readCharacters());
  }, []);

  function toggleTrait(trait: string) {
    setTraits((prev) =>
      prev.includes(trait)
        ? prev.filter((x) => x !== trait)
        : prev.length < 4
        ? [...prev, trait]
        : prev
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
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
      setCharacters(readCharacters());
      setName("");
      setDescription("");
      setTraits([]);
    }
  }

  const mainLeft = slotsLeft("main");
  const secondaryLeft = slotsLeft("secondary");
  const roleLeft = role === "main" ? mainLeft : secondaryLeft;

  function remove(c: SavedCharacter) {
    if (!window.confirm(t("deleteConfirm", { name: c.name }))) return;
    deleteCharacter(c.id);
    setCharacters(readCharacters());
  }

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-500)]">{t("subtitle")}</p>

      {/* Existing characters */}
      <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {characters.map((c) => (
          <article
            key={c.id}
            className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-serif text-lg tracking-tight">{c.name}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider",
                      c.role === "main"
                        ? "bg-[var(--color-fox-300)]/25 text-[var(--color-fox-700)]"
                        : "bg-[var(--color-indigo-soft-100)] text-[var(--color-indigo-soft-700)]"
                    )}
                  >
                    {t(`role_${c.role ?? "secondary"}`)}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-ink-500)]">
                  {t(`type_${c.type}`)}
                  {c.description && ` · ${c.description}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(c)}
                aria-label={t("delete")}
                className="rounded-lg p-1.5 text-[var(--color-ink-400)] hover:text-[var(--color-fox-700)]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {c.traits.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {c.traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full bg-[var(--color-cream-200)] px-2 py-0.5 text-[11px] text-[var(--color-ink-600)]"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
        {characters.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-100)] p-8 text-center sm:col-span-2 xl:col-span-3 max-w-xl">
            <UserSquare className="mx-auto h-7 w-7 text-[var(--color-indigo-soft-500)]" />
            <p className="mt-3 text-sm text-[var(--color-ink-600)]">{t("empty")}</p>
          </div>
        )}
      </div>

      {/* Create form */}
      <div className="mt-10 max-w-xl rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-serif text-xl tracking-tight">{t("createTitle")}</h2>
        <p className="mt-1 text-xs text-[var(--color-ink-400)]">
          {t("slots", { main: mainLeft, secondary: secondaryLeft })}
        </p>
        <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="char-name">{t("name")}</Label>
              <Input
                id="char-name"
                value={name}
                maxLength={30}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>{t("role")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["main", "secondary"] as const).map((v) => {
                  const left = v === "main" ? mainLeft : secondaryLeft;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRole(v)}
                      className={cn(
                        "rounded-xl border px-3.5 py-2 text-sm",
                        role === v
                          ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                          : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                      )}
                    >
                      {t(`role_${v}`)} ({left})
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-[var(--color-ink-400)]">{t("roleHint")}</p>
            </div>
            <div>
              <Label>{t("gender")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CHARACTER_GENDERS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setGender(v)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-sm",
                      gender === v
                        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {t(`gender_${v}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>{t("type")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CHARACTER_TYPES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setType(v)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-sm",
                      type === v
                        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {t(`type_${v}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="char-desc">{t("description")}</Label>
              <Input
                id="char-desc"
                value={description}
                maxLength={80}
                placeholder={t("descriptionPlaceholder")}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>{t("traits")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CHARACTER_TRAITS.map((trait) => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => toggleTrait(trait)}
                    aria-pressed={traits.includes(trait)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      traits.includes(trait)
                        ? "border-transparent bg-[var(--color-mint-400)] text-[#17224a]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </div>
            {roleLeft <= 0 && (
              <p className="flex items-center gap-2 rounded-xl bg-[var(--color-cream-100)] px-4 py-3 text-sm text-[var(--color-ink-500)]">
                <Lock className="h-4 w-4" />
                {t(role === "main" ? "limitMain" : "limitSecondary", {
                  limit: FREE_LIMITS[role],
                })}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={name.trim().length < 2 || roleLeft <= 0}
            >
              <Plus className="h-4 w-4" />
              {t("createCta")}
            </Button>
          </form>
      </div>
    </div>
  );
}
