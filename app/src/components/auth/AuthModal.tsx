"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { login, signup, type LoginState } from "@/app/actions/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordField } from "@/components/auth/PasswordField";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { FoxMark } from "@/components/brand/FoxCloud";
import { cn } from "@/lib/utils/cn";

/**
 * Single auth entry point (item #26): one button opens this modal with two
 * tabs, Connexion and Inscription. Login works with the temp dev accounts
 * AND Supabase email accounts; signup creates a Supabase account.
 */
export function AuthModal({
  open,
  onOpenChange,
  onLoggedIn,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoggedIn?: () => void;
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  // When the user generated a strong password, skip the confirm field (#10).
  const [pwGenerated, setPwGenerated] = useState(false);

  const [loginState, loginAction, loginPending] = useActionState<LoginState, FormData>(
    login,
    { ok: false }
  );
  const [signupState, signupAction, signupPending] = useActionState<LoginState, FormData>(
    signup,
    { ok: false }
  );

  useEffect(() => {
    const state = loginState.ok ? loginState : signupState.ok ? signupState : null;
    if (state) {
      onOpenChange(false);
      onLoggedIn?.();
      router.push(state.role === "admin" ? ("/admin" as never) : "/profils");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginState, signupState]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <FoxMark className="h-10 w-10" />
            <div>
              <DialogTitle>{t("modalTitle")}</DialogTitle>
              <DialogDescription>{t("modalSubtitle")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="grid grid-cols-2 rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-100)] p-1 text-sm">
          {(["login", "signup"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setTab(v)}
              className={cn(
                "rounded-lg px-3 py-2 transition-colors",
                tab === v
                  ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                  : "text-[var(--color-ink-600)] hover:text-[var(--color-ink-800)]"
              )}
            >
              {v === "login" ? t("tabLogin") : t("tabSignup")}
            </button>
          ))}
        </div>

        {tab === "login" ? (
          <form action={loginAction} className="space-y-4">
            <div>
              <Label htmlFor="auth-username">{t("usernameOrEmail")}</Label>
              <Input id="auth-username" name="username" autoComplete="username" required className="mt-1.5" />
            </div>
            <PasswordField
              id="auth-password"
              name="password"
              label={t("password")}
              autoComplete="current-password"
            />
            {/* no minLength on login — temp accounts use 6 chars */}
            <label className="flex items-center gap-2.5 text-sm text-[var(--color-ink-600)]">
              <Checkbox name="remember" defaultChecked value="1" />
              {t("rememberMe")}
            </label>
            {loginState.error && (
              <p role="alert" className="rounded-xl border border-[var(--color-fox-300)] bg-[var(--color-fox-300)]/15 px-4 py-2.5 text-sm text-[var(--color-fox-700)]">
                {loginState.message ?? t("error")}
              </p>
            )}
            <Button type="submit" variant="primary" size="lg" disabled={loginPending} className="w-full justify-center">
              {loginPending ? t("pending") : t("submit")}
            </Button>
            <OAuthButtons />
          </form>
        ) : (
          <form action={signupAction} className="space-y-4">
            <div>
              <Label htmlFor="signup-name">{t("displayName")}</Label>
              <Input id="signup-name" name="name" autoComplete="name" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="signup-email">{t("email")}</Label>
              <Input id="signup-email" name="email" type="email" autoComplete="email" required className="mt-1.5" />
            </div>
            <PasswordField
              id="signup-password"
              name="password"
              label={t("password")}
              autoComplete="new-password"
              withGenerator
              minLength={8}
              hint={t("passwordHint")}
              onGenerated={setPwGenerated}
            />
            {!pwGenerated && (
              <PasswordField
                id="signup-password-confirm"
                name="passwordConfirm"
                label={t("passwordConfirm")}
                autoComplete="new-password"
                minLength={8}
              />
            )}
            <label className="flex items-center gap-2.5 text-sm text-[var(--color-ink-600)]">
              <Checkbox name="remember" defaultChecked value="1" />
              {t("rememberMe")}
            </label>
            {signupState.error && (
              <p role="alert" className="rounded-xl border border-[var(--color-fox-300)] bg-[var(--color-fox-300)]/15 px-4 py-2.5 text-sm text-[var(--color-fox-700)]">
                {signupState.message ?? t("error")}
              </p>
            )}
            <Button type="submit" variant="mint" size="lg" disabled={signupPending} className="w-full justify-center">
              {signupPending ? t("pending") : t("signupSubmit")}
            </Button>
            <OAuthButtons />
            <p className="text-center text-xs text-[var(--color-ink-400)]">{t("gdprShort")}</p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
