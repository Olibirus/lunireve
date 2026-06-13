"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Compact favorite toggle for story cards (#18) — sits next to the audio
 * icon on the cover. Lives inside a Link, so clicks must not navigate.
 * Same localStorage store as the story-page FavoriteButton.
 */
export function FavoriteHeart({ slug }: { slug: string }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem("lunireve:favorites") ?? "[]") as string[];
      setFav(list.includes(slug));
    } catch {
      /* ignore */
    }
  }, [slug]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const list = JSON.parse(localStorage.getItem("lunireve:favorites") ?? "[]") as string[];
      const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
      localStorage.setItem("lunireve:favorites", JSON.stringify(next));
      setFav(next.includes(slug));
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={fav}
      aria-label={fav ? "Retirer des favorites" : "Ajouter aux favorites"}
      className="rounded-full bg-white/20 backdrop-blur-sm p-1.5 text-white/95 hover:bg-white/35 transition-colors"
    >
      <Heart className={cn("h-3.5 w-3.5", fav && "fill-[var(--color-fox-500)] text-[var(--color-fox-500)]")} />
    </button>
  );
}
