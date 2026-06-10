import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Server-side locale loader for next-intl.
 * Called on every request to resolve the active locale and load translations.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Paris timezone for consistent date/time rendering on server & client.
    timeZone: "Europe/Paris",
  };
});
