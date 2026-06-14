"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scopedKey } from "@/lib/userScope";
import { Check } from "lucide-react";

/** Account settings — editable profile info (#29) + preferences. */
export default function SettingsPage() {
  const t = useTranslations("account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(scopedKey("lunireve:accountInfo")) ?? "{}");
      setName(p.name ?? "");
      setEmail(p.email ?? "");
    } catch {
      /* ignore */
    }
  }, []);

  function save() {
    try {
      localStorage.setItem(scopedKey("lunireve:accountInfo"), JSON.stringify({ name, email }));
    } catch {
      /* ignore */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight">{t("settings")}</h1>

      {/* Editable account info (#29) */}
      <div className="mt-6 max-w-xl space-y-4 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6">
        <h2 className="font-serif text-lg tracking-tight">{t("myInfo")}</h2>
        <div>
          <Label htmlFor="acc-name">{t("displayName")}</Label>
          <Input id="acc-name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="acc-email">{t("email")}</Label>
          <Input id="acc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
          <p className="mt-1 text-xs text-[var(--color-ink-400)]">{t("emailNote")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="md" onClick={save}>{t("saveInfo")}</Button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-mint-700)]">
              <Check className="h-4 w-4" />
              {t("infoSaved")}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 max-w-xl divide-y divide-[var(--color-ink-100)] rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm">{t("darkMode")}</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm">{t("newsletter")}</span>
          <span className="rounded-full bg-[var(--color-cream-200)] px-2.5 py-0.5 text-xs text-[var(--color-ink-500)]">
            {t("soon")}
          </span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-[var(--color-fox-700)]">{t("deleteAccount")}</span>
          <span className="rounded-full bg-[var(--color-cream-200)] px-2.5 py-0.5 text-xs text-[var(--color-ink-500)]">
            {t("soon")}
          </span>
        </div>
      </div>
      <p className="mt-3 max-w-xl text-xs text-[var(--color-ink-400)]">{t("gdprNote")}</p>
    </div>
  );
}
