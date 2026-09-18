import { CATEGORIES } from '@/lib/categories';

/*
 * CategoryDonut — donat SVG distribusi kategori otomatis (RSC murni, tanpa JS).
 * Segmen digambar dengan stroke-dasharray pada lingkaran; legenda di samping.
 */

interface Props {
  counts: Record<string, number>;
  total: number;
}

const SIZE = 180;
const R = 70;
const STROKE = 26;
const CIRC = 2 * Math.PI * R;

export default function CategoryDonut({ counts, total }: Props) {
  const items = CATEGORIES.filter((c) => c.id !== 'all')
    .map((c) => ({ ...c, value: counts[c.id] ?? 0 }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  let acc = 0;
  const segments = items.map((c) => {
    const frac = total > 0 ? c.value / total : 0;
    const seg = { ...c, frac, offset: acc };
    acc += frac;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Distribusi kategori repositori"
        className="shrink-0"
      >
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {/* jalur latar */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="rgba(242,236,223,0.05)"
            strokeWidth={STROKE}
          />
          {segments.map((s) => (
            <circle
              key={s.id}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={STROKE}
              strokeDasharray={`${Math.max(0, s.frac * CIRC - 2)} ${CIRC}`}
              strokeDashoffset={-s.offset * CIRC}
              strokeLinecap="butt"
              opacity={0.85}
            >
              <title>{`${s.label}: ${s.value} (${Math.round(s.frac * 100)}%)`}</title>
            </circle>
          ))}
        </g>
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          fill="#f2ecdf"
          style={{ font: '700 30px var(--font-mono)', letterSpacing: '-1px' }}
        >
          {total}
        </text>
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          fill="rgba(242,236,223,0.45)"
          style={{ font: '500 9px var(--font-mono)', letterSpacing: '2px', textTransform: 'uppercase' }}
        >
          repositori
        </text>
      </svg>

      <ul className="grid w-full flex-1 grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
        {segments.map((s) => (
          <li key={s.id} className="flex items-center gap-2.5">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate text-[12px] text-cream/70">{s.label}</span>
            <span className="font-mono text-[11px] tabular-nums text-cream/45">
              {s.value}
              <span className="ml-1 text-cream/25">{Math.round(s.frac * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
