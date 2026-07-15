"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * Invisible overlay on top of the story hero: clicking it opens the cover
 * illustration in a fullscreen lightbox. Escape or the close button dismisses.
 * Kept as a thin overlay so we don't fight the existing hero styling.
 */
export function HeroImageZoom({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  /** Accessible name for the click target (e.g. "Open illustration"). */
  label: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // Lock BOTH scroll roots: html is the actual scroller in most browsers,
    // so locking body alone still let the page scroll behind the lightbox.
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        className="absolute inset-0 z-10 cursor-zoom-in"
      />

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          // top-20 keeps the sticky navbar (h-20) visible above the lightbox;
          // z-[60] puts it above every other layer (audio dialog is z-50), so
          // nothing floats in front of the image.
          className="fixed inset-x-0 bottom-0 top-20 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full cursor-zoom-out rounded-2xl object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}
