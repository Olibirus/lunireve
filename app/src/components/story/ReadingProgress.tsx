"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, X } from "lucide-react";

/**
 * Resume reading — for EVERYONE, account or not (brief decision).
 *
 * Tracks scroll progress through the story body (#story-body) and stores it
 * per story in localStorage. On return, if progress > 10% and < 90%, shows a
 * "resume" banner that scrolls back to the saved position. At ≥90% the story
 * is marked completed (streak hook for Batch 5).
 *
 * With accounts (Batch 5), the key gains a profile prefix and history syncs
 * to the DB — this component's logic doesn't change.
 */
export function ReadingProgress({ slug }: { slug: string }) {
  const t = useTranslations("story");
  const key = `lunireve:progress:${slug}`;
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  const [live, setLive] = useState(0);

  // Restore: offer resume if meaningful progress was saved.
  useEffect(() => {
    const stored = Number(localStorage.getItem(key) ?? "0");
    if (stored > 10 && stored < 90) setResumeAt(stored);
  }, [key]);

  // Track: save scroll % through the story body, throttled via rAF.
  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const body = document.getElementById("story-body");
        if (!body) return;
        const rect = body.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0% when the top of the story first enters the viewport (rect.top = vh),
        // 100% when the last line reaches mid-viewport (rect.bottom = vh/2).
        const range = vh / 2 + rect.height;
        if (range <= 0) return;
        const progress = Math.min(100, Math.max(0, ((vh - rect.top) / range) * 100));
        setLive(progress);
        if (progress > 0) {
          try {
            localStorage.setItem(key, String(Math.round(progress)));
          } catch {
            /* non-fatal */
          }
        }
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [key]);

  function resume() {
    const body = document.getElementById("story-body");
    if (!body || resumeAt === null) return;
    const rect = body.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    window.scrollTo({
      top: window.scrollY + rect.top + (total * resumeAt) / 100,
    });
    setResumeAt(null);
  }

  return (
    <>
      {/* Reading progress line pinned just under the navbar (item #6). The
          header is h-20 (80px), so anchor at top-20 with a faint track so the
          bar is always visible, not hidden behind the navbar. */}
      <div
        aria-hidden
        className="fixed left-0 top-20 z-30 h-1 w-full bg-[var(--color-ink-100)]/60"
      >
        <div
          className="h-full bg-[var(--color-fox-500)] transition-[width] duration-150"
          style={{ width: `${live}%` }}
        />
      </div>

      {resumeAt !== null && (
    <div className="sticky top-20 z-20 mx-auto max-w-3xl px-5">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-mint-300)] bg-[var(--color-mint-100)] px-4 py-3 shadow-[var(--shadow-soft)]">
        <p className="flex items-center gap-2 text-sm text-[var(--color-ink-700)]">
          <BookOpen className="h-4 w-4 shrink-0" />
          {t("resumeTitle", { progress: resumeAt })}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={resume}
            className="rounded-full bg-[var(--color-ink-800)] px-3 py-1.5 text-xs text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)]"
          >
            {t("resumeCta")}
          </button>
          <button
            type="button"
            aria-label={t("resumeDismiss")}
            onClick={() => setResumeAt(null)}
            className="rounded-full p-1.5 text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
      )}
    </>
  );
}
