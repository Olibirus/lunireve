"use client";

import { useSyncExternalStore } from "react";

/**
 * The page's query string, WITHOUT using `useSearchParams()`.
 *
 * Why this exists: the story-list pages are `force-static` (CDN-cached, no
 * function invocation per crawler hit). Calling `useSearchParams()` on a
 * statically rendered route makes Next bail out of prerendering the whole
 * Suspense boundary, so the served HTML shipped an EMPTY <main>: the list
 * only appeared after hydration, filters from a deep link never applied, and
 * crawlers saw a page with zero stories.
 *
 * Reading `window.location.search` instead keeps the page fully prerendered
 * (server snapshot = "" => the unfiltered list is in the HTML, great for SEO)
 * and applies the filters on the client. Reactivity to in-app navigation is
 * kept by listening to popstate AND to pushState/replaceState, which Next's
 * client router uses when a filter <Link> is clicked.
 */

const EVENT = "lunireve:urlchange";
let patched = false;

/** Patch history once so client-side navigations notify subscribers. */
function patchHistory() {
  if (patched || typeof window === "undefined") return;
  patched = true;
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method];
    history[method] = function patchedMethod(
      this: History,
      ...args: Parameters<History["pushState"]>
    ) {
      const result = original.apply(this, args);
      window.dispatchEvent(new Event(EVENT));
      return result;
    };
  }
}

function subscribe(onChange: () => void): () => void {
  patchHistory();
  window.addEventListener("popstate", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

const getSnapshot = () => window.location.search;
/** Server + first paint: no query, so the full unfiltered list prerenders. */
const getServerSnapshot = () => "";

export function useUrlQuery(): Record<string, string> {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return Object.fromEntries(new URLSearchParams(search).entries());
}
