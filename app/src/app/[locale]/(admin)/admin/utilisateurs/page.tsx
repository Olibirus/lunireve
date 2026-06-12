import { mockUsers } from "@/data/mock-admin";
import { StatusPill } from "@/components/admin/AdminShell";

/** Users table — list/view/disable lands with Supabase Auth. */
export default function AdminUsersPage() {
  return (
    <>
      <h1 className="font-serif text-3xl tracking-tight">Utilisateurs</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-500)]">
        {mockUsers.length} comptes · tous gratuits en V1
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ink-100)] text-left text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Formule</th>
              <th className="px-4 py-3 font-medium">Enfants</th>
              <th className="px-4 py-3 font-medium">Histoires créées</th>
              <th className="px-4 py-3 font-medium">Inscription</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-ink-100)]/60">
            {mockUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-[var(--color-ink-400)]">
                  Aucun compte pour l'instant. Les inscriptions apparaîtront ici.
                </td>
              </tr>
            )}
            {mockUsers.map((u) => (
              <tr key={u.id} className="hover:bg-[var(--color-cream-100)]/60">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-[var(--color-ink-600)]">{u.email}</td>
                <td className="px-4 py-3">Gratuit</td>
                <td className="px-4 py-3">{u.children}</td>
                <td className="px-4 py-3">{u.customStories}</td>
                <td className="px-4 py-3 text-[var(--color-ink-500)]">{u.signedUpAt}</td>
                <td className="px-4 py-3">
                  <StatusPill tone={u.status === "active" ? "green" : "red"}>
                    {u.status === "active" ? "Actif" : "Désactivé"}
                  </StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
