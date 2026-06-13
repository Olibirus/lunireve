import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";

type Crumb = {
  label: string;
  /** Omit href for the current (last) page. */
  href?: Parameters<typeof Link>[0]["href"];
};

/**
 * Breadcrumb for all story pages (#33). Always starts Home › Library, then
 * the page-specific trail. The last crumb is the current page (no link).
 */
export async function StoryBreadcrumb({ trail }: { trail: Crumb[] }) {
  const t = await getTranslations("nav");
  const tFunnel = await getTranslations("funnel");

  const crumbs: Crumb[] = [
    { label: t("home"), href: "/" },
    { label: tFunnel("breadcrumbLibrary"), href: "/histoires" },
    ...trail,
  ];

  return (
    <nav aria-label="Fil d'ariane" className="text-xs text-[var(--color-ink-400)]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3 w-3 text-[var(--color-ink-300)]" />}
              {c.href && !last ? (
                <Link href={c.href as never} className="hover:text-[var(--color-ink-700)]">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-[var(--color-ink-600)] truncate max-w-[12rem]">
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
