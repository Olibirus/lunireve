import { cn } from "@/lib/utils/cn";
import type { FoxColor } from "./FoxCloud";

/**
 * Child profile avatar — the fox portrait PNGs in /public/children/<color>.png
 * (9 variants). Legacy profiles saved with the old "orange" mark fall back to
 * the golden fox. Round crop; size via className.
 */

export const AVATAR_COLORS = [
  "blue",
  "mint",
  "pink",
  "golden",
  "grey",
  "kaki",
  "lavender",
  "red",
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
  // Round card with generous inner padding: the source PNGs are edge-to-edge
  // fox faces, so the image must fit fully INSIDE the circle (a square only
  // fits a circle at ~70% of the diameter). Fixed light backdrop keeps the
  // fox readable in dark mode too.
  return (
    <span
      aria-hidden={alt === "" ? true : undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "border border-[var(--color-ink-100)] bg-[#fdf8ef] p-[14%]",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/children/${avatarFile(color)}.png`}
        alt={alt}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
