"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Headphones, Loader2, Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { generateStoryAudio } from "@/app/actions/generateStoryAudio";
import type { AudioTier } from "@/lib/ai";

/**
 * FREE-tier audio player (brief §V1):
 * - play/pause, previous/next chapter, restart — nothing else
 * - modal can NOT be minimized; closing it STOPS the audio
 * - on close, the page scrolls to the chapter the audio stopped at, so the
 *   reader can pick up exactly where the voice left off
 *
 * Audio is generated at first listen then cached. If `audioUrl` is already
 * set (cached render) we stream it straight away. Otherwise, when a `storyId`
 * is provided, the first play triggers server-side generation (provider ->
 * Supabase Storage -> cached on the story row) and plays the returned URL.
 * With neither a URL nor a storyId the transport stays disabled (e.g. mock
 * library stories not yet in the DB).
 *
 * The paid player (minimize, speed, sleep timer, autoplay queue, ambient
 * sounds) ships in V2 as a separate component.
 */
export function AudioPlayer({
  title,
  audioUrl,
  chapterOffsets = [],
  storyId,
  tier = "library",
  round = false,
  language = "fr",
}: {
  title: string;
  audioUrl: string | null;
  /**
   * Where each chapter starts, as a fraction of the narration (0 = the very
   * beginning). Derived from the cumulative word count of the printed chapters
   * so a skip lands on the same break the reader sees on the page.
   *
   * Fewer than 3 entries means the story is too short to be worth chaptering:
   * the transport falls back to a plain 15-second skip and the "chapter x of y"
   * line disappears, instead of inventing chapters that do not exist.
   */
  chapterOffsets?: number[];
  /** When set, enables lazy first-listen generation for this story. */
  storyId?: string;
  /** Library = cheap bulk voice; personalized = warmer premium voice. */
  tier?: AudioTier;
  /** Render the trigger as a big round play button (story page toolbar). */
  round?: boolean;
  /** Story language: picks the matching pre-rendered outro track. */
  language?: "fr" | "en";
}) {
  const t = useTranslations("story");
  const hasChapters = chapterOffsets.length >= 3;
  const chapterCount = chapterOffsets.length;
  const SKIP_SECONDS = 15;
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [chapter, setChapter] = useState(0);
  // Resolved URL: starts from the cached prop, filled in after lazy generation.
  const [url, setUrl] = useState<string | null>(audioUrl);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  // After the narration ends, a short pre-rendered "thanks for listening"
  // track plays (public/audio/outro-<lang>.mp3), matching the story language.
  const [inOutro, setInOutro] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const outroRef = useRef<HTMLAudioElement>(null);
  const outroSrc = `/audio/outro-${language === "en" ? "en" : "fr"}.mp3`;

  useEffect(() => setUrl(audioUrl), [audioUrl]);

  const canPlay = Boolean(url) || (Boolean(storyId) && !error);

  // Closing the modal just stops playback (no page jump).
  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      audioRef.current?.pause();
      outroRef.current?.pause();
      setInOutro(false);
      setPlaying(false);
    }
  }

  function seek(value: number) {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrent(value);
    }
  }

  /** Move the playhead to a chapter start (this is what the arrows used to
   *  fail to do: they only changed the displayed number). */
  function goToChapter(index: number) {
    const clamped = Math.max(0, Math.min(chapterCount - 1, index));
    setChapter(clamped);
    const el = audioRef.current;
    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return;
    seek(chapterOffsets[clamped] * el.duration);
  }

  function skipBy(seconds: number) {
    const el = audioRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    seek(Math.max(0, Math.min(el.duration, el.currentTime + seconds)));
  }

  // Keep the displayed chapter in step with the playhead while it runs, so the
  // label tracks the narration instead of only the buttons.
  useEffect(() => {
    if (!hasChapters || !duration) return;
    const fraction = current / duration;
    let i = 0;
    while (i + 1 < chapterOffsets.length && chapterOffsets[i + 1] <= fraction) i++;
    setChapter(i);
  }, [current, duration, hasChapters, chapterOffsets]);

  /** Attempt playback; only mark as playing if the browser allowed it. */
  async function playNow(): Promise<void> {
    const el = audioRef.current;
    if (!el) return;
    try {
      await el.play();
      setPlaying(true);
    } catch {
      // Autoplay blocked (e.g. the user gesture expired while the narration
      // was generating). Stay paused — the next tap plays instantly.
      setPlaying(false);
    }
  }

  async function togglePlay() {
    if (playing) {
      (inOutro ? outroRef : audioRef).current?.pause();
      setPlaying(false);
      return;
    }

    // Resume the outro if that's where playback stopped.
    if (inOutro) {
      try {
        await outroRef.current?.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
      return;
    }

    // Lazy first listen: no cached URL yet, but we know which story to render.
    if (!url) {
      if (!storyId || generating) return;
      setGenerating(true);
      setError(false);
      try {
        const res = await generateStoryAudio({ storyId, tier });
        if (!res.ok) {
          setError(true);
          return;
        }
        setUrl(res.url);
        // The <audio> element mounts once `url` renders; try on the next tick.
        requestAnimationFrame(() => void playNow());
      } catch {
        setError(true);
      } finally {
        setGenerating(false);
      }
      return;
    }

    void playNow();
  }

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    // End of the narration -> gentle "thanks for listening" outro track.
    const onEnded = () => {
      const outro = outroRef.current;
      if (outro) {
        setInOutro(true);
        outro.currentTime = 0;
        outro.play().catch(() => {
          setInOutro(false);
          setPlaying(false);
        });
      } else {
        setPlaying(false);
      }
    };
    const onTime = () => setCurrent(el.currentTime);
    const onMeta = () => setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    el.addEventListener("ended", onEnded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
    };
  }, [open, url]);

  // Outro finished: back to a clean, ready-to-replay state.
  useEffect(() => {
    const outro = outroRef.current;
    if (!outro) return;
    const onEnded = () => {
      setInOutro(false);
      setPlaying(false);
    };
    outro.addEventListener("ended", onEnded);
    return () => outro.removeEventListener("ended", onEnded);
  }, [open]);

  const fmt = (s: number) => {
    if (!Number.isFinite(s) || s <= 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {round ? (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("listen")}
            title={t("listen")}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-ink-800)] text-[var(--color-cream-50)] shadow-[var(--shadow-card)] transition-transform hover:bg-[var(--color-ink-700)] hover:scale-105"
          >
            <Play className="h-7 w-7 translate-x-0.5" />
          </button>
          <span className="text-xs font-medium text-[var(--color-ink-600)]">{t("listen")}</span>
        </div>
      ) : (
        <Button variant="primary" size="md" className="w-full justify-start" onClick={() => setOpen(true)}>
          <Headphones className="h-4 w-4" />
          {t("listen")}
        </Button>
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
            <DialogDescription>
              {error
                ? t("playerError")
                : generating
                ? t("playerGenerating")
                : canPlay
                ? t("playerNote")
                : t("playerSoon")}
            </DialogDescription>
          </DialogHeader>

          {url && <audio ref={audioRef} src={url} preload="metadata" />}
          {/* Pre-rendered thank-you outro, chained after the narration */}
          <audio ref={outroRef} src={outroSrc} preload="none" />

          {hasChapters && (
            <p className="text-center text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
              {t("playerChapter", { current: chapter + 1, total: chapterCount })}
            </p>
          )}

          {/* Seek bar — click or drag to move through the audio */}
          <div className="px-1">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(current, duration || 0)}
              disabled={!url || !duration}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label={t("playerSeek")}
              className="audio-seek h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-cream-200)] disabled:opacity-50"
              style={{
                background: duration
                  ? `linear-gradient(to right, var(--color-ink-800) ${(current / duration) * 100}%, var(--color-cream-200) ${(current / duration) * 100}%)`
                  : undefined,
              }}
            />
            <div className="mt-1 flex justify-between text-[10px] tabular-nums text-[var(--color-ink-400)]">
              <span>{fmt(current)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 py-2">
            <button
              type="button"
              aria-label={hasChapters ? t("playerPrev") : t("playerBack15")}
              disabled={!url || !duration || (hasChapters && chapter === 0)}
              onClick={() => (hasChapters ? goToChapter(chapter - 1) : skipBy(-SKIP_SECONDS))}
              className="relative rounded-full border border-[var(--color-ink-100)] p-3 text-[var(--color-ink-600)] disabled:opacity-40 hover:bg-[var(--color-cream-100)]"
            >
              <SkipBack className="h-4 w-4" />
              {!hasChapters && (
                <span className="absolute inset-x-0 -bottom-4 text-[9px] tabular-nums text-[var(--color-ink-400)]">
                  {SKIP_SECONDS}s
                </span>
              )}
            </button>

            <button
              type="button"
              aria-label={playing ? t("playerPause") : t("playerPlay")}
              disabled={!canPlay || generating}
              onClick={togglePlay}
              className={cn(
                "rounded-full p-5 text-[var(--color-cream-50)] disabled:opacity-40",
                "bg-[var(--color-ink-800)] hover:bg-[var(--color-ink-700)] transition-colors"
              )}
            >
              {generating ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : playing ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              aria-label={hasChapters ? t("playerNext") : t("playerForward15")}
              disabled={!url || !duration || (hasChapters && chapter >= chapterCount - 1)}
              onClick={() => (hasChapters ? goToChapter(chapter + 1) : skipBy(SKIP_SECONDS))}
              className="relative rounded-full border border-[var(--color-ink-100)] p-3 text-[var(--color-ink-600)] disabled:opacity-40 hover:bg-[var(--color-cream-100)]"
            >
              <SkipForward className="h-4 w-4" />
              {!hasChapters && (
                <span className="absolute inset-x-0 -bottom-4 text-[9px] tabular-nums text-[var(--color-ink-400)]">
                  {SKIP_SECONDS}s
                </span>
              )}
            </button>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              disabled={!url}
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = 0;
                setChapter(0);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)] disabled:opacity-40"
            >
              <RotateCcw className="h-3 w-3" />
              {t("playerRestart")}
            </button>
          </div>

          {/* The note doubles as a close button: tapping it stops playback
              and dismisses the modal (via onOpenChange). */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-2 w-full rounded-xl bg-[var(--color-cream-100)] px-3 py-2 text-center text-xs text-[var(--color-ink-500)] hover:bg-[var(--color-cream-200)] hover:text-[var(--color-ink-700)] transition-colors"
          >
            {t("playerCloseNote")}
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
