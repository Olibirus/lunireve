"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scopedKey, currentUser } from "@/lib/userScope";
import { Check, Mail, Pencil, X } from "lucide-react";

/**
 * Account settings — editable profile info (#29) + preferences.
 *
 * Email change follows the real double-confirmation pattern: the registered
 * address is read-only; "Modifier" opens a form (new + confirm), submitting
 * records a PENDING address and shows the confirmation-sent state with a
 * resend + cancel. The actual confirmation email ships with Brevo (V2); the
 * pending state survives reloads so the flow is already exactly right.
 */
export default function SettingsPage() {
  const t = useTranslations("account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  // Email-change flow state
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(scopedKey("lunireve:accountInfo")) ?? "{}");
      setName(p.name ?? "");
      // Registered address: saved one first, else the login identifier when
      // it is an email (real Supabase accounts sign in with their email).
      const user = currentUser();
      setEmail(p.email || (user.includes("@") ? user : ""));
      setPendingEmail(localStorage.getItem(scopedKey("lunireve:pendingEmail")) || null);
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

  function submitEmailChange() {
    const next = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) {
      setEmailError("emailInvalid");
      return;
    }
    if (next !== confirmEmail.trim().toLowerCase()) {
      setEmailError("emailMismatch");
      return;
    }
    if (next === email.toLowerCase()) {
      setEmailError("emailSame");
      return;
    }
    setEmailError(null);
    setPendingEmail(next);
    try {
      localStorage.setItem(scopedKey("lunireve:pendingEmail"), next);
    } catch {
      /* ignore */
    }
    setEditingEmail(false);
    setNewEmail("");
    setConfirmEmail("");
  }

  function cancelEmailChange() {
    setPendingEmail(null);
    try {
      localStorage.removeItem(scopedKey("lunireve:pendingEmail"));
    } catch {
      /* ignore */
    }
  }

  function resendConfirmation() {
    // Brevo hook lands here in V2; for now acknowledge the action.
    setResent(true);
    setTimeout(() => setResent(false), 2500);
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

      {/* Email address — registered address + guarded change flow */}
      <div className="mt-6 max-w-xl space-y-4 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6">
        <h2 className="font-serif text-lg tracking-tight">{t("email")}</h2>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--color-cream-100)] px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-[var(--color-ink-700)]">
            <Mail className="h-4 w-4 text-[var(--color-indigo-soft-500)]" />
            {email || t("emailNone")}
          </span>
          {!editingEmail && !pendingEmail && (
            <Button variant="outline" size="sm" onClick={() => setEditingEmail(true)}>
              <Pencil className="h-3.5 w-3.5" />
              {t("emailChange")}
            </Button>
          )}
        </div>

        {/* Pending confirmation state */}
        {pendingEmail && (
          <div className="rounded-xl border border-[var(--color-mint-300)] bg-[var(--color-mint-50)] p-4">
            <p className="text-sm text-[var(--color-ink-700)]">
              {t("emailPending", { email: pendingEmail })}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={resendConfirmation}>
                <Mail className="h-3.5 w-3.5" />
                {t("emailResend")}
              </Button>
              <Button variant="ghost" size="sm" onClick={cancelEmailChange}>
                <X className="h-3.5 w-3.5" />
                {t("emailCancelChange")}
              </Button>
              {resent && (
                <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-mint-700)]">
                  <Check className="h-4 w-4" />
                  {t("emailResent")}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Change form */}
        {editingEmail && !pendingEmail && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="new-email">{t("emailNew")}</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1.5"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="confirm-email">{t("emailConfirm")}</Label>
              <Input
                id="confirm-email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            {emailError && (
              <p className="text-sm text-[var(--color-fox-700)]">{t(emailError)}</p>
            )}
            <p className="text-xs text-[var(--color-ink-400)]">{t("emailChangeNote")}</p>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={submitEmailChange}>
                {t("emailSubmit")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingEmail(false);
                  setEmailError(null);
                }}
              >
                {t("emailCancelEdit")}
              </Button>
            </div>
          </div>
        )}
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
