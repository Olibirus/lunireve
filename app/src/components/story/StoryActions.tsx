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

/**
 * Share menu: main social networks + copy link, in a small popover. The
 * native share sheet is offered too when the browser supports it (mobile).
 */
export function ShareButton() {
  const t = useTranslations("story");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => setCanNative(typeof navigator !== "undefined" && !!navigator.share), []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    // Close on any outside click (popover buttons stopPropagation).
    const id = setTimeout(() => document.addEventListener("click", close), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", close);
    };
  }, [open]);

  function popup(shareUrl: string) {
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=640,height=560");
    setOpen(false);
  }

  function networks() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    return [
      { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
      { name: "X (Twitter)", href: `https://twitter.com/intent/tweet?url=${url}&text=${title}` },
      { name: "WhatsApp", href: `https://api.whatsapp.com/send?text=${title}%20${url}` },
      { name: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${url}&description=${title}` },
      { name: "E-mail", href: `mailto:?subject=${title}&body=${url}` },
    ];
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1200);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ url: window.location.href, title: document.title });
      setOpen(false);
    } catch {
      /* user cancelled */
    }
  }

  return (
    <span className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <Share2 className="h-4 w-4" />
        {t("share")}
      </Button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-1.5 shadow-[var(--shadow-float)]"
        >
          {canNative && (
            <button
              type="button"
              onClick={nativeShare}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-[var(--color-ink-700)] hover:bg-[var(--color-cream-100)]"
            >
              {t("shareNative")}
            </button>
          )}
          {typeof window !== "undefined" &&
            networks().map((n) => (
              <button
                key={n.name}
                type="button"
                onClick={() => popup(n.href)}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm text-[var(--color-ink-700)] hover:bg-[var(--color-cream-100)]"
              >
                {n.name}
              </button>
            ))}
          <button
            type="button"
            onClick={copyLink}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-[var(--color-indigo-soft-600)] hover:bg-[var(--color-cream-100)]"
          >
            {copied ? t("shareCopied") : t("shareCopy")}
          </button>
        </div>
      )}
    </span>
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
