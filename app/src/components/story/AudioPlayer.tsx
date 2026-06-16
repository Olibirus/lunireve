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
  chapterCount,
  storyId,
  tier = "library",
  round = false,
}: {
  title: string;
  audioUrl: string | null;
  chapterCount: number;
  /** When set, enables lazy first-listen generation for this story. */
  storyId?: string;
  /** Library = cheap bulk voice; personalized = warmer premium voice. */
  tier?: AudioTier;
  /** Render the trigger as a big round play button (story page toolbar). */
  round?: boolean;
}) {
  const t = useTranslations("story");
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [chapter, setChapter] = useState(0);
  // Resolved URL: starts from the cached prop, filled in after lazy generation.
  const [url, setUrl] = useState<string | null>(audioUrl);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => setUrl(audioUrl), [audioUrl]);

  const canPlay = Boolean(url) || (Boolean(storyId) && !error);

  // Closing the modal just stops playback (no page jump).
  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      audioRef.current?.pause();
      setPlaying(false);
    }
  }

  function seek(value: number) {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrent(value);
    }
  }

  async function togglePlay() {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
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
        // The <audio> element mounts once `url` is set; play on the next tick.
        requestAnimationFrame(() => {
          void audioRef.current?.play();
          setPlaying(true);
        });
      } catch {
        setError(true);
      } finally {
        setGenerating(false);
      }
      return;
    }

    void audioRef.current?.play();
    setPlaying(true);
  }

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => setPlaying(false);
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

          <p className="text-center text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
            {t("playerChapter", { current: chapter + 1, total: chapterCount })}
          </p>

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
              aria-label={t("playerPrev")}
              disabled={!url || chapter === 0}
              onClick={() => setChapter((c) => Math.max(0, c - 1))}
              className="rounded-full border border-[var(--color-ink-100)] p-3 text-[var(--color-ink-600)] disabled:opacity-40 hover:bg-[var(--color-cream-100)]"
            >
              <SkipBack className="h-4 w-4" />
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
              aria-label={t("playerNext")}
              disabled={!url || chapter >= chapterCount - 1}
              onClick={() => setChapter((c) => Math.min(chapterCount - 1, c + 1))}
              className="rounded-full border border-[var(--color-ink-100)] p-3 text-[var(--color-ink-600)] disabled:opacity-40 hover:bg-[var(--color-cream-100)]"
            >
              <SkipForward className="h-4 w-4" />
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

          <p className="mt-2 rounded-xl bg-[var(--color-cream-100)] px-3 py-2 text-center text-xs text-[var(--color-ink-500)]">
            {t("playerCloseNote")}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
