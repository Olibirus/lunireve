import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * FoxCloud — mascot placeholder.
 *
 * User will drop a final PNG at /public/logo.png and we'll swap to <Image />.
 * Meanwhile this is a stylistic stand-in: orange curled fox on a soft cloud,
 * drawn in our palette so the brand feels consistent right now.
 *
 * Size is controlled by the wrapper — SVG uses viewBox + currentColor for tint,
 * so you can size it via className.
 */
export function FoxCloud({
  className,
  ariaLabel = "Un renard endormi sur un nuage, lisant un livre",
}: {
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 320"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={cn("select-none", className)}
    >
      <defs>
        <radialGradient id="fc-cloud" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#fcfaf6" />
          <stop offset="70%" stopColor="#e8ecf4" />
          <stop offset="100%" stopColor="#c6cbe1" />
        </radialGradient>
        <linearGradient id="fc-fox" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8b487" />
          <stop offset="55%" stopColor="#f4894a" />
          <stop offset="100%" stopColor="#c96a2e" />
        </linearGradient>
        <linearGradient id="fc-book" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#343f67" />
          <stop offset="100%" stopColor="#1f2d52" />
        </linearGradient>
      </defs>

      {/* Cloud */}
      <g>
        <ellipse cx="200" cy="230" rx="170" ry="54" fill="url(#fc-cloud)" />
        <circle cx="90" cy="210" r="42" fill="url(#fc-cloud)" />
        <circle cx="135" cy="180" r="38" fill="url(#fc-cloud)" />
        <circle cx="200" cy="168" r="48" fill="url(#fc-cloud)" />
        <circle cx="270" cy="180" r="40" fill="url(#fc-cloud)" />
        <circle cx="320" cy="208" r="38" fill="url(#fc-cloud)" />
        <path
          d="M 50 240 Q 200 280 350 240"
          stroke="#aab1c6"
          strokeWidth="2"
          fill="none"
          opacity="0.35"
        />
      </g>

      {/* Fox body — curled */}
      <g transform="translate(120 100)">
        {/* Tail curled behind */}
        <path
          d="M 175 85 Q 215 70 210 115 Q 200 140 160 130 Z"
          fill="url(#fc-fox)"
          stroke="#1f2d52"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 196 105 Q 210 100 208 120 Q 200 125 192 118 Z"
          fill="#fcfaf6"
        />

        {/* Body */}
        <ellipse cx="95" cy="100" rx="85" ry="52" fill="url(#fc-fox)" stroke="#1f2d52" strokeWidth="3" />

        {/* Belly */}
        <ellipse cx="95" cy="118" rx="55" ry="28" fill="#fcfaf6" opacity="0.9" />

        {/* Head */}
        <g>
          <path
            d="M 30 78 Q 28 45 48 35 Q 58 55 54 72 Z"
            fill="url(#fc-fox)"
            stroke="#1f2d52"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M 36 58 Q 42 48 48 58 Q 44 64 40 62 Z" fill="#c96a2e" />
          <path
            d="M 78 78 Q 80 45 60 35 Q 50 55 54 72 Z"
            fill="url(#fc-fox)"
            stroke="#1f2d52"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M 72 58 Q 66 48 60 58 Q 64 64 68 62 Z" fill="#c96a2e" />

          <ellipse cx="54" cy="82" rx="42" ry="34" fill="url(#fc-fox)" stroke="#1f2d52" strokeWidth="3" />
          <ellipse cx="54" cy="95" rx="30" ry="22" fill="#fcfaf6" />

          {/* Sleepy closed eye (one visible, in profile) */}
          <path
            d="M 40 82 Q 48 78 56 82"
            stroke="#1f2d52"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Nose tip */}
          <ellipse cx="20" cy="94" rx="5" ry="3.5" fill="#1f2d52" />
          {/* Mouth */}
          <path
            d="M 20 99 Q 24 104 30 101"
            stroke="#1f2d52"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Book held in arms */}
        <g transform="translate(60 110)">
          <rect x="0" y="0" width="72" height="44" rx="3" fill="url(#fc-book)" stroke="#0f1735" strokeWidth="2" />
          <rect x="34" y="0" width="4" height="44" fill="#0f1735" />
          <line x1="8" y1="12" x2="30" y2="12" stroke="#858fc1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="18" x2="26" y2="18" stroke="#858fc1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="24" x2="28" y2="24" stroke="#858fc1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="42" y1="12" x2="64" y2="12" stroke="#858fc1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="42" y1="18" x2="60" y2="18" stroke="#858fc1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="42" y1="24" x2="62" y2="24" stroke="#858fc1" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Paw peeking out from under book */}
        <ellipse cx="62" cy="148" rx="14" ry="8" fill="#f8b487" stroke="#1f2d52" strokeWidth="2.5" />
        <ellipse cx="128" cy="148" rx="14" ry="8" fill="#f8b487" stroke="#1f2d52" strokeWidth="2.5" />
      </g>

      {/* Small sparkles around */}
      <g fill="#858fc1" opacity="0.6">
        <path d="M 360 80 l 3 10 l 10 3 l -10 3 l -3 10 l -3 -10 l -10 -3 l 10 -3 z" />
        <path d="M 50 110 l 2 6 l 6 2 l -6 2 l -2 6 l -2 -6 l -6 -2 l 6 -2 z" />
        <circle cx="330" cy="140" r="2.5" />
        <circle cx="60" cy="60" r="2" />
      </g>
    </svg>
  );
}

/**
 * FoxMark — the small square logo for the header. Just the fox head + book.
 */
/**
 * Avatar fur colors — the 9 child-profile variants (matching the portraits in
 * /public/children/<color>.png) plus the legacy brand orange. Each entry is
 * the [light, dark] pair of the fur gradient, used by FoxMark fallbacks
 * (chips, badges) when the photo avatar would be too small.
 */
export const FOX_COLORS = {
  orange: ["#f8b487", "#c96a2e"],
  blue: ["#9bc0e8", "#4a7fb5"],
  mint: ["#9dd1b6", "#4d9973"],
  pink: ["#f4afc5", "#d36a8e"],
  golden: ["#f2cd7c", "#c99a3a"],
  grey: ["#c4c9d4", "#8a93a5"],
  kaki: ["#b8bd8a", "#7c8452"],
  lavender: ["#bfb3e0", "#8a78c0"],
  red: ["#ee9a8a", "#c04f3a"],
  sand: ["#e3cda0", "#b08d52"],
} as const;
export type FoxColor = keyof typeof FOX_COLORS;

export function FoxMark({
  className,
  color = "orange",
}: {
  className?: string;
  color?: FoxColor;
}) {
  const [from, to] = FOX_COLORS[color];
  const gid = `fm-fox-${color}`;
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("select-none", className)}
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#1f2d52" />
      <g transform="translate(10 12)">
        <path d="M 6 14 Q 4 4 14 0 Q 18 8 16 14 Z" fill={`url(#${gid})`} />
        <path d="M 38 14 Q 40 4 30 0 Q 26 8 28 14 Z" fill={`url(#${gid})`} />
        <ellipse cx="22" cy="22" rx="18" ry="16" fill={`url(#${gid})`} />
        <ellipse cx="22" cy="28" rx="11" ry="9" fill="#fcfaf6" />
        <path d="M 14 22 Q 18 19 22 22" stroke="#1f2d52" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 26 22 Q 30 19 34 22" stroke="#1f2d52" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="22" cy="30" rx="2.5" ry="2" fill="#1f2d52" />
      </g>
    </svg>
  );
}
