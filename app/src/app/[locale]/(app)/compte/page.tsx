"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  readProfiles,
  deleteProfile,
  setActiveProfile,
  FREE_PROFILE_LIMIT,
  type ChildProfile,
} from "@/lib/profiles";
import { readCustomStories } from "@/lib/customStories";
import { FoxMark } from "@/components/brand/FoxCloud";
import { Button } from "@/components/ui/button";
import { BookOpen, Flame, Lock, Plus, Trash2, Wand2 } from "lucide-react";

/** Parent dashboard — family overview + quick actions (#11). */
export default function AccountDashboardPage() {
  const t = useTranslations("account");
  const router = useRouter();
  const [profiles, setProfiles] = useState<ChildProfile[] | null>(null);
  const [storyCount, setStoryCount] = useState(0);

  useEffect(() => {
    setProfiles(readProfiles());
    setStoryCount(readCustomStories().length);
  }, []);

  function openChild(p: ChildProfile) {
    setActiveProfile(p.id);
    router.push("/enfant");
  }

  function removeChild(p: ChildProfile) {
    if (!window.confirm(t("deleteConfirm", { name: p.name }))) return;
    deleteProfile(p.id);
    setProfiles(readProfiles());
  }

  const limitReached = (profiles?.length ?? 0) >= FREE_PROFILE_LIMIT;

  return (
    <div className="space-y-10">
      <div>
        <h1
          className="font-serif text-3xl md:text-4xl tracking-tight"
          style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
        >
          {t("title")}
        </h1>
        <p className="mt-2 text-[var(--color-ink-500)]">{t("subtitle")}</p>
      </div>

      <section className="flex flex-wrap gap-3">
        <Button asChild variant="primary" size="md">
          <Link href="/creer">
            <Wand2 className="h-4 w-4" />
            {t("createStory")}
          </Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href="/histoires">
            <BookOpen className="h-4 w-4" />
            {t("browseLibrary")}
          </Link>
        </Button>
      </section>

      <section>
        <h2 className="font-serif text-2xl tracking-tight sparkle">{t("family")}</h2>
        <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {profiles?.map((p) => (
            <article
              key={p.id}
              className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center gap-3">
                <FoxMark color={p.avatar} className="h-14 w-14" />
                <div>
                  <p className="font-serif text-lg tracking-tight">{p.name}</p>
                  <p className="text-xs text-[var(--color-ink-500)]">
                    {t("childMeta", { age: p.age })}
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--color-fox-300)]/25 px-2 py-0.5 text-xs text-[var(--color-fox-700)]">
                  <Flame className="h-3 w-3" />
                  {p.streak}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => openChild(p)}
                  className="flex-1 rounded-xl bg-[var(--color-ink-800)] px-3 py-2 text-xs text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)]"
                >
                  {t("openProfile")}
                </button>
                <button
                  type="button"
                  onClick={() => removeChild(p)}
                  aria-label={t("deleteProfile")}
                  className="rounded-xl border border-[var(--color-ink-100)] px-3 py-2 text-[var(--color-ink-500)] hover:text-[var(--color-fox-700)] hover:border-[var(--color-fox-300)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}

          {limitReached ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] p-6 text-center opacity-70">
              <Lock className="h-6 w-6 text-[var(--color-ink-400)]" />
              <p className="text-sm text-[var(--color-ink-500)]">{t("addChild")}</p>
              <span className="rounded-full bg-[var(--color-indigo-soft-100)] px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-[var(--color-indigo-soft-700)]">
                {t("upgradeBadge")}
              </span>
            </div>
          ) : (
            <Link
              href="/profils/nouveau"
              className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] p-6 text-center text-[var(--color-ink-500)] hover:border-[var(--color-mint-500)] hover:text-[var(--color-ink-800)] transition-colors"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">{t("addChild")}</span>
            </Link>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl tracking-tight sparkle">{t("menu.customStories")}</h2>
        <p className="mt-3 text-sm text-[var(--color-ink-500)]">
          {t("customCount", { count: storyCount })}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href="/compte/histoires">{t("seeAll")}</Link>
        </Button>
      </section>
    </div>
  );
}
