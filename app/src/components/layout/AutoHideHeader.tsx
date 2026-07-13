"use client";

import { useEffect } from "react";

/**
 * Story-page chrome behavior: the sticky site header slides out of the way
 * while scrolling DOWN (immersive reading) and reappears the instant the
 * reader scrolls UP, so theme toggle and navigation stay one flick away.
 * Renders nothing; it decorates the page's existing <header> element.
 */
export function AutoHideHeader() {
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    header.style.transition = "transform 0.25s ease";
    let lastY = window.scrollY;
    let hidden = false;

    // No rAF deferral: scroll events are already coalesced per frame, and
    // this must keep working even when the tab is throttled.
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY + 2;
      const goingUp = y < lastY - 2;
      if (goingDown && y > 120 && !hidden) {
        hidden = true;
        header.style.transform = "translateY(-100%)";
      } else if ((goingUp || y <= 120) && hidden) {
        hidden = false;
        header.style.transform = "";
      }
      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      header.style.transform = "";
      header.style.transition = "";
    };
  }, []);

  return null;
}
