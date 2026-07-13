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
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
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
          // top-20 + z-30: the lightbox opens BELOW the sticky navbar (h-20,
          // z-40) so the header stays visible and usable above it.
          className="fixed inset-x-0 bottom-0 top-20 z-30 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
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
