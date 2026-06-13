"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Wand2 } from "lucide-react";

/** Generate a readable strong password (no ambiguous chars). */
function strongPassword(len = 16): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%?";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}

/**
 * Password input with show/hide toggle (#10) and an optional "suggest a
 * strong password" action (signup only). Controlled so the generated value
 * can be written back into the field.
 */
export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  withGenerator = false,
  hint,
  minLength,
  onGenerated,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  withGenerator?: boolean;
  hint?: string;
  /** Omit on login (temp accounts use 6 chars); set 8 on signup. */
  minLength?: number;
  /** Notified when the user generated a password (skip confirm field). */
  onGenerated?: (generated: boolean) => void;
}) {
  const t = useTranslations("auth");
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {withGenerator && (
          <button
            type="button"
            onClick={() => {
              setValue(strongPassword());
              setShow(true);
              onGenerated?.(true);
            }}
            className="inline-flex items-center gap-1 text-xs text-[var(--color-indigo-soft-600)] hover:text-[var(--color-ink-800)]"
          >
            <Wand2 className="h-3 w-3" />
            {t("suggestPassword")}
          </button>
        )}
      </div>
      <div className="relative mt-1.5">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onGenerated?.(false);
          }}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? t("hidePassword") : t("showPassword")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--color-ink-400)] hover:text-[var(--color-ink-800)]"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-[var(--color-ink-400)]">{hint}</p>}
    </div>
  );
}
