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
import { Headphones, Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * FREE-tier audio player (brief §V1):
 * - play/pause, previous/next chapter, restart — nothing else
 * - modal can NOT be minimized; closing it STOPS the audio
 * - on close, the page scrolls to the chapter the audio stopped at, so the
 *   reader can pick up exactly where the voice left off
 *
 * Audio files are generated at first listen then cached (audioUrl). While
 * audioUrl is null (no n8n pipeline yet) the transport renders disabled with
 * a "first listen generates the audio" note — the UI contract is final.
 *
 * The paid player (minimize, speed, sleep timer, autoplay queue, ambient
 * sounds) ships in V2 as a separate component.
 */
export function AudioPlayer({
  title,
  audioUrl,
  chapterCount,
}: {
  title: string;
  audioUrl: string | null;
  chapterCount: number;
}) {
  const t = useTranslations("story");
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [chapter, setChapter] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Closing the modal stops playback and scrolls to the active chapter.
  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      audioRef.current?.pause();
      setPlaying(false);
      document
        .getElementById(`chapitre-${chapter + 1}`)
        ?.scrollIntoView({ block: "start" });
    }
  }

  function togglePlay() {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    if (playing) {
      el.pause();
    } else {
      void el.play();
    }
    setPlaying(!playing);
  }

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => setPlaying(false);
    el.addEventListener("ended", onEnded);
    return () => el.removeEventListener("ended", onEnded);
  }, [open]);

  return (
    <>
      <Button variant="primary" size="md" className="w-full justify-start" onClick={() => setOpen(true)}>
        <Headphones className="h-4 w-4" />
        {t("listen")}
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
            <DialogDescription>
              {audioUrl ? t("playerNote") : t("playerSoon")}
            </DialogDescription>
          </DialogHeader>

          {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

          <p className="text-center text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
            {t("playerChapter", { current: chapter + 1, total: chapterCount })}
          </p>

          <div className="flex items-center justify-center gap-3 py-2">
            <button
              type="button"
              aria-label={t("playerPrev")}
              disabled={!audioUrl || chapter === 0}
              onClick={() => setChapter((c) => Math.max(0, c - 1))}
              className="rounded-full border border-[var(--color-ink-100)] p-3 text-[var(--color-ink-600)] disabled:opacity-40 hover:bg-[var(--color-cream-100)]"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label={playing ? t("playerPause") : t("playerPlay")}
              disabled={!audioUrl}
              onClick={togglePlay}
              className={cn(
                "rounded-full p-5 text-[var(--color-cream-50)] disabled:opacity-40",
                "bg-[var(--color-ink-800)] hover:bg-[var(--color-ink-700)] transition-colors"
              )}
            >
              {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
            </button>

            <button
              type="button"
              aria-label={t("playerNext")}
              disabled={!audioUrl || chapter >= chapterCount - 1}
              onClick={() => setChapter((c) => Math.min(chapterCount - 1, c + 1))}
              className="rounded-full border border-[var(--color-ink-100)] p-3 text-[var(--color-ink-600)] disabled:opacity-40 hover:bg-[var(--color-cream-100)]"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              disabled={!audioUrl}
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
