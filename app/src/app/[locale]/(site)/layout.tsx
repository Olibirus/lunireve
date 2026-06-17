import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StarField } from "@/components/marketing/StarField";

/**
 * Public site chrome. The (app) group (profile selector, child bubble,
 * parent area) and (admin) group ship their own top bars instead.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StarField />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
