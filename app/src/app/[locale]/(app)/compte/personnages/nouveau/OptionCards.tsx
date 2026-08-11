"use client";

import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Visual building blocks for the character wizard. Every image option renders
 * a mini placeholder slot (dashed box + icon) carrying data-image-slot: the
 * future illustration lands at /public/illustrations/<slotId>.png and swaps in
 * one pass, same convention as FoxImagePlaceholder.
 */

export function MiniSlot({ slotId, className }: { slotId: string; className?: string }) {
  return (
    <span
      data-image-slot={slotId}
      title={slotId}
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-xl border-2 border-dashed",
        "border-[var(--color-ink-200)] bg-[var(--color-cream-100)] text-[var(--color-ink-300)]",
        className
      )}
    >
      <ImageIcon className="h-5 w-5" />
    </span>
  );
}

/**
 * Card option with an image placeholder. Three sizes: "lg" for the primary
 * choices (type, animal family), "md" for major appearance picks (skin, hair
 * style, gender), "sm" for dense grids (glasses, accessories...).
 */
export function OptionCard({
  selected,
  onClick,
  label,
  sublabel,
  slotId,
  size = "md",
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sublabel?: string;
  slotId: string;
  size?: "lg" | "md" | "sm";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border-2 text-center transition-colors",
        size === "lg" && "p-5",
        size === "md" && "p-3.5",
        size === "sm" && "p-2.5",
        selected
          ? "border-[var(--color-mint-500)] bg-[var(--color-mint-50)]"
          : "border-[var(--color-ink-100)] bg-[var(--color-cream-50)] hover:border-[var(--color-ink-200)] hover:bg-[var(--color-cream-100)]"
      )}
    >
      <MiniSlot
        slotId={slotId}
        className={cn(
          "w-full",
          size === "lg" && "aspect-[4/3]",
          size === "md" && "aspect-square max-h-24",
          size === "sm" && "aspect-square max-h-16"
        )}
      />
      <span
        className={cn(
          "font-medium leading-tight text-[var(--color-ink-800)]",
          size === "lg" ? "text-sm md:text-base" : size === "md" ? "text-sm" : "text-xs"
        )}
      >
        {label}
      </span>
      {sublabel && (
        <span className="text-xs leading-tight text-[var(--color-ink-500)]">{sublabel}</span>
      )}
    </button>
  );
}

/** Text chip, optionally with a color dot (hair, eyes, coat colors). */
export function Chip({
  selected,
  onClick,
  children,
  dot,
  disabled = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dot?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        selected
          ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
          : "border-[var(--color-ink-100)] bg-[var(--color-cream-50)] text-[var(--color-ink-700)] hover:bg-[var(--color-cream-100)]",
        disabled && !selected && "cursor-not-allowed opacity-40"
      )}
    >
      {dot && (
        <span
          aria-hidden
          className="h-3 w-3 shrink-0 rounded-full border border-black/10"
          style={{ backgroundColor: dot }}
        />
      )}
      {children}
    </button>
  );
}

/**
 * "Surprenez-moi" — fills the current step with a random but coherent set.
 * Everything it picks stays editable, so it is a starting point, not a lock.
 */
export function SurpriseButton({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        "border-[var(--color-mint-500)] bg-[var(--color-mint-50)] text-[var(--color-ink-800)]",
        "hover:bg-[var(--color-mint-100)]"
      )}
    >
      <span aria-hidden>🎲</span>
      {label}
    </button>
  );
}

/** Titled section with an optional hint line. */
export function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-serif text-lg tracking-tight">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-[var(--color-ink-400)]">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}
