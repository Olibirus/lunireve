import { cn } from "@/lib/utils/cn";
import type { FoxColor } from "./FoxCloud";

/**
 * Child profile avatar — the fox portrait PNGs in /public/children/<color>.png
 * (9 variants). Legacy profiles saved with the old "orange" mark fall back to
 * the golden fox. Round crop; size via className.
 */

export const AVATAR_COLORS = [
  "red",
  "blue",
  "mint",
  "pink",
  "golden",
  "grey",
  "kaki",
  "lavender",
  "sand",
] as const satisfies readonly FoxColor[];

function avatarFile(color: FoxColor): string {
  return (AVATAR_COLORS as readonly string[]).includes(color) ? color : "golden";
}

export function ChildAvatar({
  color,
  className,
  alt = "",
}: {
  color: FoxColor;
  className?: string;
  alt?: string;
}) {
  // Round card with the fox INSIDE the circle: the source PNGs are
  // edge-to-edge faces, and a square only fits a circle at ~70% of the
  // diameter. The inset is absolute (relative to the avatar itself): a
  // percentage PADDING would resolve against the PARENT's width and crush
  // the image to nothing in wide containers (the "empty avatars" bug).
  return (
    <span
      aria-hidden={alt === "" ? true : undefined}
      className={cn(
        "relative inline-block shrink-0 overflow-hidden rounded-full",
        "border border-[var(--color-ink-100)] bg-[#fdf8ef]",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/children/${avatarFile(color)}.webp`}
        alt={alt}
        className="absolute inset-[14%] h-[72%] w-[72%] object-contain"
      />
    </span>
  );
}
