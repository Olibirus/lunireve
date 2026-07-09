import { createNavigation } from "next-intl/navigation";
import { createElement, forwardRef, type ComponentProps } from "react";
import { routing } from "./routing";

/**
 * Locale-aware navigation helpers.
 * Use these instead of next/link and next/navigation in client components
 * when you want automatic locale prefixing and pathname translation.
 */
const nav = createNavigation(routing);

export const { redirect, usePathname, useRouter, getPathname } = nav;

const BaseLink = nav.Link;

/**
 * Wrapped Link that defaults to `prefetch={false}`.
 *
 * Next prefetches every in-viewport <Link> by default; on link-dense pages
 * (story grids, footer, funnels) a single page view fired dozens of RSC
 * prefetch requests, each a Vercel function invocation — a primary cause of
 * the runaway-usage incident. Navigation still works, it just fetches on
 * hover/click instead of eagerly. Pass `prefetch` explicitly to opt a link
 * back in (e.g. a critical above-the-fold CTA).
 */
export const Link = forwardRef<
  HTMLAnchorElement,
  ComponentProps<typeof BaseLink>
>(function Link(props, ref) {
  return createElement(BaseLink, { prefetch: false, ...props, ref });
});
