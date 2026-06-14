import { formatEur, type RevenuePoint } from "@/data/mock-admin";

/**
 * Revenue graph — stacked monthly bars (recurring subscriptions + one-off book
 * printing) with a total line on top. Forecast months are drawn dashed/faded
 * and separated by a "Prévision" divider, so past / present / future read at a
 * glance. Pure SVG (no chart lib); native <title> tooltips per bar.
 */
export function RevenueChart({
  history,
  forecast,
}: {
  history: RevenuePoint[];
  forecast: RevenuePoint[];
}) {
  const points = [...history, ...forecast];
  const totals = points.map((p) => p.recurring + p.oneOff);
  const rawMax = Math.max(...totals, 1);
  // Round the axis max up to a tidy step.
  const step = rawMax > 1500 ? 500 : rawMax > 600 ? 250 : 100;
  const max = Math.ceil(rawMax / step) * step;

  const W = 760;
  const H = 300;
  const padL = 52;
  const padR = 16;
  const padT = 16;
  const padB = 44;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const n = points.length;
  const slot = plotW / n;
  const barW = Math.min(34, slot * 0.56);
  const x = (i: number) => padL + slot * i + slot / 2;
  const y = (v: number) => padT + plotH * (1 - v / max);

  const gridValues = Array.from({ length: 5 }, (_, k) => (max / 4) * k);
  const firstForecast = history.length;

  // Total line path (solid for history, dashed for forecast).
  const linePts = totals.map((t, i) => `${x(i)},${y(t)}`);
  const histLine = linePts.slice(0, history.length).join(" ");
  const foreLine = linePts.slice(history.length - 1).join(" "); // overlap 1 to connect

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[640px]" role="img" aria-label="Revenu mensuel">
        {/* gridlines + y labels */}
        {gridValues.map((v, k) => (
          <g key={k}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--color-ink-100)"
              strokeWidth={1}
            />
            <text x={padL - 8} y={y(v) + 3} textAnchor="end" fontSize={10} fill="var(--color-ink-400)">
              {v >= 1000 ? `${v / 1000}k` : v} €
            </text>
          </g>
        ))}

        {/* forecast divider */}
        {forecast.length > 0 && (
          <g>
            <line
              x1={padL + slot * firstForecast}
              x2={padL + slot * firstForecast}
              y1={padT}
              y2={padT + plotH}
              stroke="var(--color-ink-200)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text
              x={padL + slot * firstForecast + 6}
              y={padT + 11}
              fontSize={9}
              fill="var(--color-ink-400)"
              className="uppercase"
              letterSpacing={1}
            >
              Prévision
            </text>
          </g>
        )}

        {/* bars */}
        {points.map((p, i) => {
          const total = p.recurring + p.oneOff;
          const recH = plotH * (p.recurring / max);
          const oneH = plotH * (p.oneOff / max);
          const baseY = padT + plotH;
          const op = p.projected ? 0.45 : 1;
          return (
            <g key={p.month} opacity={op}>
              <title>
                {p.label} {p.month.slice(0, 4)} — Récurrent {formatEur(p.recurring)} · Ponctuel{" "}
                {formatEur(p.oneOff)} · Total {formatEur(total)}
                {p.projected ? " (prévision)" : ""}
              </title>
              {/* recurring */}
              <rect
                x={x(i) - barW / 2}
                y={baseY - recH}
                width={barW}
                height={recH}
                rx={2}
                fill="var(--color-indigo-soft-400)"
              />
              {/* one-off stacked on top */}
              <rect
                x={x(i) - barW / 2}
                y={baseY - recH - oneH}
                width={barW}
                height={oneH}
                rx={2}
                fill="var(--color-mint-500)"
              />
              {/* x label */}
              <text x={x(i)} y={H - 26} textAnchor="middle" fontSize={10} fill="var(--color-ink-400)">
                {p.label}
              </text>
            </g>
          );
        })}

        {/* total line */}
        <polyline
          points={histLine}
          fill="none"
          stroke="var(--color-fox-500)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {forecast.length > 0 && (
          <polyline
            points={foreLine}
            fill="none"
            stroke="var(--color-fox-500)"
            strokeWidth={2}
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
          />
        )}
        {totals.map((t, i) => (
          <circle key={i} cx={x(i)} cy={y(t)} r={2.5} fill="var(--color-fox-500)" opacity={points[i].projected ? 0.6 : 1} />
        ))}
      </svg>

      {/* legend */}
      <div className="mt-2 flex flex-wrap items-center gap-4 px-1 text-xs text-[var(--color-ink-500)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-indigo-soft-400)]" />
          Abonnements (récurrent)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-mint-500)]" />
          Impression de livres (ponctuel)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-[var(--color-fox-500)]" />
          Total
        </span>
      </div>
    </div>
  );
}
