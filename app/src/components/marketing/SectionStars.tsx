/**
 * Per-section star background (dark mode only). Dropped inside a section that is
 * `relative isolate overflow-hidden`; sits BEHIND the section content (negative
 * z) so stars decorate the background and scroll with the section instead of
 * floating over the whole screen. Deterministic positions (SSR-safe).
 */
const STARS = [
  { top: "10%", left: "8%", dur: "3s", delay: "0s", big: true },
  { top: "18%", left: "82%", dur: "3.6s", delay: "0.6s" },
  { top: "8%", left: "48%", dur: "2.8s", delay: "1.1s" },
  { top: "30%", left: "26%", dur: "4s", delay: "0.3s" },
  { top: "26%", left: "92%", dur: "3.2s", delay: "1.6s", big: true },
  { top: "44%", left: "62%", dur: "4.4s", delay: "0.9s" },
  { top: "52%", left: "14%", dur: "3.4s", delay: "1.9s" },
  { top: "60%", left: "88%", dur: "3s", delay: "0.5s" },
  { top: "68%", left: "40%", dur: "4.6s", delay: "2.2s", big: true },
  { top: "74%", left: "70%", dur: "3.3s", delay: "1.3s" },
  { top: "82%", left: "20%", dur: "3.8s", delay: "0.8s" },
  { top: "88%", left: "56%", dur: "3.1s", delay: "2s" },
  { top: "38%", left: "78%", dur: "4.2s", delay: "1.5s" },
  { top: "16%", left: "34%", dur: "2.9s", delay: "2.4s" },
];

export function SectionStars({ offset = 0 }: { offset?: number }) {
  // Rotate the array per section so adjacent sections don't line up.
  const stars = [...STARS.slice(offset % STARS.length), ...STARS.slice(0, offset % STARS.length)];
  return (
    <div aria-hidden className="star-field pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {stars.map((s, i) => (
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
