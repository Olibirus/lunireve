"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Premium smooth scrolling: wheel input is eased toward a target with a gentle
 * lerp, so the page keeps gliding briefly after the user stops ("slow
 * release"). Everything else stays native, and control is handed back the
 * instant the user scrolls another way (scrollbar drag, middle-click
 * autoscroll, keyboard). Re-initialised on every route change so a new page
 * never inherits the previous page's scroll target (which used to jump to the
 * footer). Disabled for reduced-motion and coarse pointers (touch).
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let target = window.scrollY;
    let raf = 0;
    let running = false;
    // Ring buffer of the scroll positions WE set, so async scroll events from
    // our own animation aren't mistaken for user input.
    const recent: number[] = [];
    const remember = (v: number) => {
      recent.push(v);
      if (recent.length > 6) recent.shift();
    };

    const maxScroll = () =>
      document.documentElement.scrollHeight - window.innerHeight;

    function loop() {
      const current = window.scrollY;
      const diff = target - current;
      if (Math.abs(diff) < 0.5) {
        running = false;
        return;
      }
      const next = current + diff * 0.12; // easing: quick to respond, slow to settle
      remember(next);
      window.scrollTo(0, next);
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
      if (!running) target = window.scrollY; // resync after a native jump
      const step = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      target = Math.max(0, Math.min(maxScroll(), target + step));
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    }

    // Any scroll we did NOT drive (scrollbar drag, autoscroll, keys, browser
    // restoration) cancels the animation and resyncs, so it never fights back.
    function onScroll() {
      if (recent.some((v) => Math.abs(v - window.scrollY) < 3)) return;
      running = false;
      cancelAnimationFrame(raf);
      target = window.scrollY;
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
