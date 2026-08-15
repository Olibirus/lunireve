import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Crumb = {
  label: string;
  /** Omit href for the current (last) page. */
  href?: Parameters<typeof Link>[0]["href"];
};

/**
 * Breadcrumb for all story pages (#33). Always starts Home › Library, then
 * the page-specific trail. The last crumb is the current page (no link).
 *
 * `onImage` renders it as a glassy pill over the hero illustration (same look
 * as the old "back to library" button), instead of plain inline text.
 */
export function StoryBreadcrumb({
  trail,
  onImage = false,
}: {
  trail: Crumb[];
  onImage?: boolean;
}) {
  // useTranslations works in Server AND Client components — this component is
  // used from both (static story pages, client funnel browser).
  const t = useTranslations("nav");
  const tFunnel = useTranslations("funnel");

  const crumbs: Crumb[] = [
    { label: t("home"), href: "/" },
    { label: tFunnel("breadcrumbLibrary"), href: "/histoires" },
    ...trail,
  ];

  return (
    <nav
      aria-label="Fil d'ariane"
      className={cn(
        "text-xs",
        onImage
          ? // rounded-2xl, not rounded-full: once the trail wraps to two or
            // three lines the pill grows tall, and a fully round cap curves so
            // far in that the first word sits on top of the corner.
            "inline-flex max-w-full rounded-2xl bg-black/25 px-4 py-2 text-white backdrop-blur-sm"
          : "text-[var(--color-ink-400)]"
      )}
    >
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  className={cn("h-3 w-3", onImage ? "text-white/60" : "text-[var(--color-ink-300)]")}
                />
              )}
              {c.href && !last ? (
                <Link
                  href={c.href as never}
                  className={onImage ? "text-white/90 hover:text-white" : "hover:text-[var(--color-ink-700)]"}
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className={cn(
                    "truncate max-w-[12rem]",
                    onImage ? "text-white" : "text-[var(--color-ink-600)]"
                  )}
                >
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
