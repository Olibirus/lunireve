import { cn } from "@/lib/utils/cn";
import { ImageIcon } from "lucide-react";

/**
 * Empty placeholder for every illustration slot on the site.
 *
 * Harry generates all fox-themed images himself in a later pass. Each
 * placeholder carries:
 *  - slotId  → unique key; the generated file will be saved as
 *              /public/illustrations/<slotId>.png and swapped in
 *  - prompt  → the brief to feed the image generator (kept visible in dev
 *              so it can be copy-pasted straight into the tool)
 *  - aspect  → enforced ratio so the layout doesn't shift when real
 *              images land
 *
 * Swap procedure (one pass, later): replace <FoxImagePlaceholder /> with
 * <Image src={`/illustrations/${slotId}.png`} ... /> — same dimensions.
 */

const ASPECTS = {
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "3:4": "aspect-[3/4]",
  "4:5": "aspect-[4/5]",
  "16:9": "aspect-[16/9]",
  "21:9": "aspect-[21/9]",
  "3:1": "aspect-[3/1]",
} as const;

export type FoxImageSlot = {
  slotId: string;
  prompt: string;
  aspect?: keyof typeof ASPECTS;
};

export function FoxImagePlaceholder({
  slotId,
  prompt,
  aspect = "4:3",
  className,
  showPrompt = true,
}: FoxImageSlot & { className?: string; showPrompt?: boolean }) {
  return (
    <figure
      data-image-slot={slotId}
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 border-dashed",
        "border-[var(--color-ink-200)] bg-[var(--color-cream-100)]",
        "flex flex-col items-center justify-center gap-3 p-6 text-center",
        ASPECTS[aspect],
        className
      )}
    >
      <span className="rounded-2xl bg-[var(--color-cream-50)] p-3 text-[var(--color-ink-300)]">
        <ImageIcon className="h-6 w-6" aria-hidden />
      </span>
      <figcaption className="space-y-1.5 max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-ink-400)]">
          {slotId} · {aspect}
        </p>
        {showPrompt && (
          <p className="text-xs leading-relaxed text-[var(--color-ink-500)] line-clamp-4">
            {prompt}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
