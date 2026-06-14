"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

/**
 * Compact favorite toggle for story cards (#18) — sits next to the audio
 * icon on the cover. Lives inside a Link, so clicks must not navigate.
 * Per-account scoped + tier-capped via lib/favorites.
 */
export function FavoriteHeart({ slug }: { slug: string }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(slug));
  }, [slug]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const { active } = toggleFavorite(slug);
    setFav(active);
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
