"use client";

import { useEffect } from "react";

/**
 * Premium smooth scrolling: wheel input is eased toward its target with a
 * gentle lerp, so the page keeps gliding briefly after the user stops
 * scrolling ("slow release"). Native scrolling is preserved (we drive
 * window.scrollTo), so position: fixed, bg-attachment and anchors keep
 * working. Desktop-wheel only; touch, keyboard and scrollbars stay native.
 * Disabled for prefers-reduced-motion. Wheel events over an inner scrollable
 * element (dropdowns, search results) are left alone.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Skip coarse pointers (phones/tablets): native momentum is already good.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let target = window.scrollY;
    let raf = 0;
    let running = false;

    const maxScroll = () =>
      document.documentElement.scrollHeight - window.innerHeight;

    function loop() {
      const current = window.scrollY;
      const diff = target - current;
      if (Math.abs(diff) < 0.5) {
        running = false;
        return;
      }
      // 0.11 = easing strength: quick to respond, slow to settle.
      window.scrollTo({ top: current + diff * 0.11, behavior: "auto" });
      raf = requestAnimationFrame(loop);
    }

    function insideScrollable(el: EventTarget | null): boolean {
      let node = el instanceof Element ? el : null;
      while (node && node !== document.body) {
        const style = getComputedStyle(node);
        if (
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          node.scrollHeight > node.clientHeight
        ) {
          return true;
        }
        node = node.parentElement;
      }
      return false;
    }

    function onWheel(e: WheelEvent) {
      if (e.ctrlKey || e.defaultPrevented) return; // pinch-zoom etc.
      if (insideScrollable(e.target)) return;
      e.preventDefault();
      if (!running) target = window.scrollY; // resync after native jumps
      const step = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      target = Math.max(0, Math.min(maxScroll(), target + step));
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
