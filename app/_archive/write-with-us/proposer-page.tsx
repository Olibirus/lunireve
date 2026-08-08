"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AGE_RANGES, ageLabel } from "@/data/mock-stories";
import { submitStory } from "@/app/actions/submissions";
import { Check, PenLine, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Story submission — lands in the admin moderation queue as a real DB row
 * (draft status = never public until an admin approves it).
 *
 * The rights grant is explicit and blocking: the submit button stays disabled
 * until the author ticks the consent box, and the accepted terms version is
 * recorded server-side with the row.
 */
export default function SubmitStoryPage() {
  const t = useTranslations("submit");
  const locale = useLocale();
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [ageRange, setAgeRange] = useState<string>("5-6");
  const [body, setBody] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const bodyTooShort = body.trim().length < 200;
  const canSend = accepted && !bodyTooShort && title.trim().length >= 2 && !sending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) {
      setError("termsRequired");
      return;
    }
    if (bodyTooShort) return;
    setSending(true);
    setError(null);
    const res = await submitStory({
      title,
      body,
      ageRange,
      language: locale === "en" ? "en" : "fr",
      authorName,
      acceptedTerms: accepted,
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
      return;
    }
    setError(res.error === "auth" ? "authRequired" : "submitError");
  }

  if (sent) {
    return (
      <div className="max-w-xl rounded-3xl border border-[var(--color-mint-300)] bg-[var(--color-mint-100)] p-8 text-center">
        <Check className="mx-auto h-8 w-8 text-[var(--color-mint-700)]" />
        <h1 className="mt-4 font-serif text-2xl tracking-tight">{t("thanksTitle")}</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-600)] leading-relaxed">{t("thanksBody")}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-500)]">{t("subtitle")}</p>

      <form onSubmit={submit} className="mt-6 max-w-xl space-y-5">
        <div>
          <Label htmlFor="sub-title">{t("storyTitle")}</Label>
          <Input
            id="sub-title"
            value={title}
            maxLength={80}
            required
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="sub-author">{t("authorName")}</Label>
          <Input
            id="sub-author"
            value={authorName}
            maxLength={60}
            onChange={(e) => setAuthorName(e.target.value)}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-[var(--color-ink-400)]">{t("authorNameHint")}</p>
        </div>
        <div>
          <Label>{t("ageRange")}</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {AGE_RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setAgeRange(r)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-sm",
                  ageRange === r
                    ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                    : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                )}
              >
                {ageLabel(r)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="sub-body">{t("storyBody")}</Label>
          <Textarea
            id="sub-body"
            value={body}
            rows={12}
            required
            minLength={200}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1.5"
          />
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-[var(--color-ink-400)]">{t("bodyHint")}</p>
            <p
              className={cn(
                "text-xs tabular-nums",
                bodyTooShort ? "text-red-600 font-medium" : "text-[var(--color-mint-700)]"
              )}
            >
              {bodyTooShort
                ? t("charCountMin", { count: body.length })
                : t("charCount", { count: body.length })}
            </p>
          </div>
        </div>

        {/* Rights grant: spelled out, then ticked. No tick, no submission. */}
        <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-100)] p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg tracking-tight">
            <ShieldCheck className="h-4 w-4 text-[var(--color-indigo-soft-600)]" />
            {t("termsTitle")}
          </h2>
          <p className="mt-2 text-xs text-[var(--color-ink-500)]">{t("termsIntro")}</p>
          <ul className="mt-3 space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <li
                key={n}
                className="flex gap-2 text-xs leading-relaxed text-[var(--color-ink-700)]"
              >
                <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-ink-300)]" />
                {t(`terms${n}`)}
              </li>
            ))}
          </ul>
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-3.5">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => {
                setAccepted(e.target.checked);
                if (e.target.checked) setError(null);
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-mint-500)]"
            />
            <span className="text-xs leading-relaxed text-[var(--color-ink-700)]">
              {t("termsCheckbox")}
            </span>
          </label>
        </div>

        {error && <p className="text-sm text-[var(--color-fox-700)]">{t(error)}</p>}

        <Button type="submit" variant="primary" size="lg" disabled={!canSend}>
          <PenLine className="h-4 w-4" />
          {t("cta")}
        </Button>
        <p className="text-xs text-[var(--color-ink-400)]">{t("note")}</p>
      </form>
    </div>
  );
}
