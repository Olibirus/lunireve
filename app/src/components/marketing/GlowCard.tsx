"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Silver edge-glow card (adapted from React Bits' BorderGlow, silver-only).
 * A white-silver light traces the card border on the side facing the cursor,
 * appearing only when the pointer is close to an edge. Pure CSS rendering
 * (see .glow-card in globals.css); this component just feeds two CSS vars:
 * --edge-proximity (0-100) and --cursor-angle.
 */
export function GlowCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    // Edge proximity: 0 at the center, 1 on the border (per axis, max wins).
    const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
    const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    // Angle of the cursor around the center (0deg = up), drives the cone mask.
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    el.style.setProperty("--edge-proximity", (edge * 100).toFixed(2));
    el.style.setProperty("--cursor-angle", `${angle.toFixed(2)}deg`);
  }, []);

  const onPointerLeave = useCallback(() => {
    ref.current?.style.setProperty("--edge-proximity", "0");
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("glow-card", className)}
    >
      <span aria-hidden className="glow-card-light" />
      {children}
    </div>
  );
}
