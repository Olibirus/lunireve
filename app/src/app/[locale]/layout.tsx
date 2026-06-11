import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
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

export const metadata: Metadata = {
  title: {
    default: "Lunireve · Des histoires qui grandissent avec vos enfants",
    template: "%s · Lunireve",
  },
  description:
    "Une bibliothèque d'histoires pour enfants à lire, écouter et personnaliser. De 3 à 11 ans. En français et en anglais.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Lunireve",
    description: "Des histoires qui grandissent avec vos enfants.",
    type: "website",
    locale: "fr_FR",
  },
};

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
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
