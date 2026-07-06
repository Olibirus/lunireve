import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

/**
 * Public site chrome. The (app) group (profile selector, child bubble,
 * parent area) and (admin) group ship their own top bars instead.
 * Stars now live per-section (SectionStars) in the background, not as a
 * single overlay floating over every page.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
