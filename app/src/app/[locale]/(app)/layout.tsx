import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";

/**
 * Authenticated family area (profile selector, child bubble, parent
 * dashboard). No public Header/Footer — each surface ships its own top bar.
 * Unauthenticated visitors are sent to the login page.
 */
export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) {
    redirect({ href: "/connexion", locale });
  }

  return <main className="flex-1">{children}</main>;
}
