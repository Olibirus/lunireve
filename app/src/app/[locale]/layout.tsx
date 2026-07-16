import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

/**
 * Fraunces — the soul of the brand. Variable serif with `opsz`, `SOFT`, `WONK`
 * axes so headings can be dialed in per size. Used for display + body reading.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

/**
 * Geist Sans — the body voice. Unfussy, honest, great for French UI labels.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Locale-aware defaults: keyword-tuned title/description per language. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://lunireve.com"),
    title: {
      default: t("defaultTitle"),
      template: "%s · Lunireve",
    },
    description: t("defaultDescription"),
    icons: {
      icon: [
        { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      shortcut: "/favicon.ico",
      apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    },
    manifest: "/site.webmanifest",
    openGraph: {
      title: "Lunireve",
      description: t("ogDescription"),
      type: "website",
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme set before paint to avoid a light flash in dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("lunireve-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* locale MUST be passed explicitly: without it, client components on
            statically-rendered pages fall back to the default locale for
            useLocale()/Link, producing French hrefs (or /en/en doubles) all
            over the English site while the texts stay English. */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
