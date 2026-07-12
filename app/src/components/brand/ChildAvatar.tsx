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
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/children/${avatarFile(color)}.png`}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      className={cn(
        "rounded-full object-cover border border-[var(--color-ink-100)] bg-[var(--color-cream-100)]",
        className
      )}
    />
  );
}
