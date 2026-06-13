"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AGE_RANGES, ageLabel } from "@/data/mock-stories";
import { Check, PenLine } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Story submission — lands in the admin moderation queue. Stored locally
 * until the DB lands; the form shape mirrors the submissions table.
 */
export default function SubmitStoryPage() {
  const t = useTranslations("submit");
  const [title, setTitle] = useState("");
  const [ageRange, setAgeRange] = useState<string>("5-6");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const list = JSON.parse(localStorage.getItem("lunireve:submissions") ?? "[]") as unknown[];
      list.push({ title, ageRange, body, submittedAt: new Date().toISOString(), status: "pending" });
      localStorage.setItem("lunireve:submissions", JSON.stringify(list));
    } catch {
      /* ignore */
    }
    setSent(true);
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
          <p className="mt-1 text-xs text-[var(--color-ink-400)]">{t("bodyHint")}</p>
        </div>
        <Button type="submit" variant="primary" size="lg">
          <PenLine className="h-4 w-4" />
          {t("cta")}
        </Button>
        <p className="text-xs text-[var(--color-ink-400)]">{t("note")}</p>
      </form>
    </div>
  );
}
