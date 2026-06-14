"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Link } from "@/i18n/navigation";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

/**
 * Story action row: favorite, share, report.
 *
 * Favorites are per-account scoped + tier-capped via lib/favorites (free tier
 * caps at 30). Batch 5 swaps the store for the DB API without UI changes.
 */

export function FavoriteButton({ slug }: { slug: string }) {
  const t = useTranslations("story");
  const [fav, setFav] = useState(false);
  const [capped, setCapped] = useState(false);

  useEffect(() => {
    setFav(isFavorite(slug));
  }, [slug]);

  function toggle() {
    const { active, blocked } = toggleFavorite(slug);
    setFav(active);
    setCapped(blocked);
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <Button variant="ghost" size="sm" onClick={toggle} aria-pressed={fav}>
        <Heart
          className={cn(
            "h-4 w-4",
            fav && "fill-[var(--color-fox-500)] text-[var(--color-fox-500)]"
          )}
        />
        {fav ? t("favorited") : t("favorite")}
      </Button>
      {capped && (
        <span className="text-xs text-[var(--color-ink-500)]">
          {t.rich("favoritesCapped", {
            upgrade: (chunks) => (
              <Link href="/tarifs" className="underline hover:text-[var(--color-ink-800)]">
                {chunks}
              </Link>
            ),
          })}
        </span>
      )}
    </div>
  );
}

export function ShareButton() {
  const t = useTranslations("story");
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: document.title });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled the share sheet */
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={share}>
      <Share2 className="h-4 w-4" />
      {copied ? t("shareCopied") : t("share")}
    </Button>
  );
}

const REPORT_REASONS = ["inappropriate", "error", "quality", "other"] as const;

export function ReportDialog({ slug }: { slug: string }) {
  const t = useTranslations("story");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"story" | "image">("story");
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>("inappropriate");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Phase 2: POST /api/reports → admin moderation queue (reports table).
    console.info("[Lunireve] report (stub)", { slug, type, reason, comment });
    setSent(true);
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSent(false);
      setComment("");
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Flag className="h-4 w-4" />
        {t("report")}
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{t("reportTitle")}</DialogTitle>
            <DialogDescription>{t("reportSubtitle")}</DialogDescription>
          </DialogHeader>

          {sent ? (
            <p className="rounded-2xl bg-[var(--color-mint-100)] px-4 py-6 text-center text-sm text-[var(--color-ink-700)]">
              {t("reportThanks")}
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {(["story", "image"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setType(v)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm transition-colors",
                      type === v
                        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                        : "border-[var(--color-ink-100)] text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {v === "story" ? t("reportStory") : t("reportImage")}
                  </button>
                ))}
              </div>

              <div>
                <Label htmlFor="report-reason">{t("reportReason")}</Label>
                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as typeof reason)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-400)]/40"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {t(`reportReason_${r}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="report-comment">{t("reportComment")}</Label>
                <Textarea
                  id="report-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="mt-1.5"
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full justify-center">
                {t("reportSubmit")}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
