"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { readProfiles, updateProfile, type ChildProfile } from "@/lib/profiles";
import { FOX_COLORS, FoxMark, type FoxColor } from "@/components/brand/FoxCloud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
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

/** Edit a child profile (#5) — name, age, avatar, language, themes, duration. */
export default function EditProfilePage() {
  const t = useTranslations("profiles.create");
  const tThemes = useTranslations("themes");
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<ChildProfile | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [age, setAge] = useState(6);
  const [avatar, setAvatar] = useState<FoxColor>("orange");
  const [language, setLanguage] = useState<"fr" | "en" | "both">("fr");
  const [themes, setThemes] = useState<string[]>([]);
  const [maxDuration, setMaxDuration] = useState<"none" | "short" | "medium" | "long">("none");

  useEffect(() => {
    const p = readProfiles().find((x) => x.id === params.id) ?? null;
    setProfile(p);
    if (p) {
      setName(p.name);
      setAge(p.age);
      setAvatar(p.avatar);
      setLanguage(p.language);
      setThemes(p.themes);
      setMaxDuration(p.maxDuration);
    }
  }, [params.id]);

  useEffect(() => {
    if (profile === null) router.push("/compte");
  }, [profile, router]);

  if (!profile) return null;

  function toggleTheme(slug: string) {
    setThemes((prev) => (prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]));
  }

  function save() {
    updateProfile(profile!.id, { name: name.trim(), age, avatar, language, themes, maxDuration });
    router.push("/compte");
  }

  return (
    <section className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <Link href="/compte" className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]">
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <h1
        className="mt-6 font-serif text-3xl md:text-4xl tracking-tight"
        style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
      >
        {t("editTitle", { name: profile.name })}
      </h1>

      <div className="mt-8 space-y-6 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 md:p-8 shadow-[var(--shadow-soft)]">
        <div>
          <Label htmlFor="edit-name">{t("name")}</Label>
          <Input id="edit-name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
        </div>

        <div>
          <Label>{t("age")}</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Array.from({ length: 16 }, (_, i) => i + 1).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAge(a)}
                className={cn(
                  "h-10 w-10 rounded-xl border text-sm",
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

        <div>
          <Label>{t("stepAvatar")}</Label>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {(Object.keys(FOX_COLORS) as FoxColor[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAvatar(c)}
                aria-pressed={avatar === c}
                className={cn(
                  "flex items-center justify-center rounded-2xl border-2 p-2",
                  avatar === c ? "border-[var(--color-mint-500)] bg-[var(--color-mint-50)]" : "border-transparent hover:bg-[var(--color-cream-100)]"
                )}
              >
                <FoxMark color={c} className="h-10 w-10" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>{t("language")}</Label>
          <div className="mt-2 flex gap-1.5">
            {(["fr", "en", "both"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm",
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
                  "rounded-full border px-3 py-1.5 text-sm",
                  themes.includes(slug)
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
          <Label>{t("duration")}</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(["none", "short", "medium", "long"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setMaxDuration(d)}
                className={cn(
                  "rounded-xl border px-3.5 py-2 text-sm",
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

        <div className="flex justify-end gap-2 pt-2">
          <Button asChild variant="ghost" size="md">
            <Link href="/compte">{t("back")}</Link>
          </Button>
          <Button variant="mint" size="md" disabled={name.trim().length < 2} onClick={save}>
            {t("saveChanges")}
          </Button>
        </div>
      </div>
    </section>
  );
}
