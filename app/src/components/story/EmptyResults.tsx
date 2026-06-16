import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Wand2 } from "lucide-react";

/**
 * Shown when a filter combination matches no library story: instead of a dead
 * end, invite the family to create exactly that story. The chosen filters are
 * forwarded to /creer as query params so the creation form is pre-filled.
 */
export async function EmptyResults({
  theme,
  age,
  character,
}: {
  theme?: string;
  age?: string;
  character?: string;
}) {
  const t = await getTranslations("funnel");
  const query: Record<string, string> = {};
  if (theme) query.theme = theme;
  if (age) query.age = age.split("-")[0]; // age range -> starting age
  if (character) query.character = character;

  return (
    <div className="rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-100)] p-10 md:p-12 text-center">
      <p className="font-serif text-xl">{t("emptyTitle")}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-ink-500)]">{t("emptyBody")}</p>
      <Link
        href={{ pathname: "/creer", query }}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-ink-800)] px-6 py-3 text-sm font-medium text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)] transition-colors"
      >
        <Wand2 className="h-4 w-4 text-[var(--color-mint-400)]" />
        {t("emptyCreateCta")}
      </Link>
    </div>
  );
}
