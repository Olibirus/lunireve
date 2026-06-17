"use client";

import { usePathname } from "next/navigation";

/**
 * Dark-mode only: a quiet field of slowly twinkling stars across the whole
 * viewport, each on its own rhythm so it feels alive. A light touch of night
 * magic. Hidden in light mode (CSS) and on the story reading/library pages
 * where it would distract. pointer-events-none so it never blocks the UI.
 */
const STARS = [
  { top: "8%", left: "12%", dur: "6s", delay: "0s", big: true },
  { top: "14%", left: "78%", dur: "7.5s", delay: "1.1s" },
  { top: "6%", left: "46%", dur: "5.5s", delay: "2.3s" },
  { top: "22%", left: "30%", dur: "8s", delay: "0.6s" },
  { top: "26%", left: "88%", dur: "6.5s", delay: "3.1s", big: true },
  { top: "34%", left: "60%", dur: "9s", delay: "1.7s" },
  { top: "40%", left: "16%", dur: "7s", delay: "2.8s" },
  { top: "46%", left: "92%", dur: "6s", delay: "0.4s" },
  { top: "52%", left: "40%", dur: "10s", delay: "3.6s" },
  { top: "58%", left: "72%", dur: "6.8s", delay: "1.3s", big: true },
  { top: "63%", left: "22%", dur: "8.5s", delay: "4.2s" },
  { top: "70%", left: "54%", dur: "7.2s", delay: "2.1s" },
  { top: "76%", left: "86%", dur: "9.5s", delay: "0.9s" },
  { top: "82%", left: "34%", dur: "6.3s", delay: "3.4s" },
  { top: "88%", left: "66%", dur: "8s", delay: "1.9s", big: true },
  { top: "92%", left: "14%", dur: "7s", delay: "4.7s" },
  { top: "18%", left: "58%", dur: "11s", delay: "5.2s" },
  { top: "48%", left: "8%", dur: "6.6s", delay: "2.5s" },
];

export function StarField() {
  const pathname = usePathname();
  // Skip story reading + library/funnel pages (both locales).
  if (/\/(histoires|stories)(\/|$)/.test(pathname)) return null;

  return (
    <div aria-hidden className="star-field pointer-events-none fixed inset-0 z-[5]">
      {STARS.map((s, i) => (
        <span
          key={i}
          className={s.big ? "star big" : "star"}
          style={
            {
              top: s.top,
              left: s.left,
              "--dur": s.dur,
              "--delay": s.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
