import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

/**
 * Locale detection policy (on top of next-intl's middleware):
 * - FIRST visit to the root: francophone browsers (any fr-*) stay on French
 *   (the default locale), every other browser language starts on English.
 * - LATER visits follow the NEXT_LOCALE cookie, which next-intl keeps in
 *   sync with the language the user actually browses (so the language
 *   switcher choice sticks across sessions).
 * - Deep links keep their own language: a shared French story URL opens in
 *   French even for an anglophone first-timer (that is the link's content).
 */
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/" && !req.cookies.has("NEXT_LOCALE")) {
    const accept = req.headers.get("accept-language") ?? "";
    const prefersFrench = /(^|[,;\s])fr(-[a-zA-Z]+)?\b/i.test(accept);
    if (accept && !prefersFrench) {
      const url = req.nextUrl.clone();
      url.pathname = "/en";
      const res = NextResponse.redirect(url);
      res.cookies.set("NEXT_LOCALE", "en", {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
      return res;
    }
  }
  return intl(req);
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (static assets)
  // - Files with extensions (images, etc.)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
