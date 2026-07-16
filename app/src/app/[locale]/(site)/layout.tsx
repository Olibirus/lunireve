import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

/**
 * Public site chrome. The (app) group (profile selector, child bubble,
 * parent area) and (admin) group ship their own top bars instead.
 * Stars now live per-section (SectionStars) in the background, not as a
 * single overlay floating over every page.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Static rendering: every segment must pin the request locale itself,
  // otherwise the server-rendered Footer/Header links fall back to French
  // on the English site.
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      {/* Site-wide structured data: who we are + sitelinks search box */}
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd(locale)} />
      <SmoothScroll />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
