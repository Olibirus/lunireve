import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { AccountShell } from "@/components/account/AccountShell";

/**
 * Parent area — chrome lives in AccountShell (shared with /creer).
 * Admin accounts have no family profile: they are sent to the back-office
 * instead of a user area (each account only ever reaches its own profile;
 * per-user data is cookie-scoped server-side and account-scoped client-side).
 */
export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (session?.role === "admin") {
    redirect({ href: "/admin", locale });
  }

  return <AccountShell>{children}</AccountShell>;
}
