import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { FoxMark } from "@/components/brand/FoxCloud";

/**
 * Admin placeholder — Batch 7 replaces this with the full back-office
 * (stories CRUD, moderation, users, blog, full analytics).
 */
export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect({ href: "/connexion", locale });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <FoxMark className="h-14 w-14" />
      <h1 className="font-serif text-3xl tracking-tight">Admin Lunireve</h1>
      <p className="max-w-sm text-sm text-[var(--color-ink-500)]">
        Le back-office complet (histoires, modération, utilisateurs, blog,
        analytics) arrive dans le prochain lot de développement.
      </p>
    </main>
  );
}
