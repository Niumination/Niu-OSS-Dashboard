'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, SearchX } from 'lucide-react';
import RepoCard from './RepoCard';
import { CATEGORIES, categorize, countByCategory } from '@/lib/categories';
import type { RepoLite } from '@/lib/types';
import { cx, formatDate } from '@/lib/utils';

type SortKey = 'pushed' | 'stars' | 'name';
type ForkFilter = 'all' | 'original' | 'fork';

interface Props {
  repos: RepoLite[];
  /** true saat data berasal dari fallback snapshot (rate-limit / offline). */
  offline?: boolean;
  offlineDate?: string;
}

const SORT_LABEL: Record<SortKey, string> = {
  pushed: 'terbaru diperbarui',
  stars: 'stars terbanyak',
  name: 'nama a–z',
};

/**
 * Aggregator repositori: pencarian real-time, pengelompokan kategori otomatis
 * (berbasis language/topik/nama), filter fork, dan pengurutan.
 */
export default function RepoGrid({ repos, offline = false, offlineDate }: Props) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<SortKey>('pushed');
  const [forkF, setForkF] = useState<ForkFilter>('all');

  const counts = useMemo(() => countByCategory(repos), [repos]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = repos.filter((r) => {
      if (forkF === 'original' && r.fork) return false;
      if (forkF === 'fork' && !r.fork) return false;
      if (cat !== 'all' && categorize(r) !== cat) return false;
      if (!needle) return true;
      const hay = `${r.name} ${r.description ?? ''} ${(r.topics ?? []).join(' ')} ${r.language ?? ''}`.toLowerCase();
      return hay.includes(needle);
    });
    list.sort((a, b) => {
      if (sort === 'stars') return b.stars - a.stars || +new Date(b.pushedAt) - +new Date(a.pushedAt);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return +new Date(b.pushedAt) - +new Date(a.pushedAt);
    });
    return list;
  }, [repos, q, cat, sort, forkF]);

  return (
    <div>
      {offline && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-warn/25 bg-warn/[0.07] px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
          <p className="text-[12.5px] leading-relaxed text-warn/90">
            GitHub API sedang rate-limited atau tidak terjangkau — menampilkan{' '}
            <strong>snapshot fallback</strong> ({formatDate(offlineDate ?? new Date().toISOString())}).
            Data akan kembali otomatis saat API pulih (cache ISR 5 menit).
          </p>
        </div>
      )}

      {/* Toolbar: pencarian real-time + filter + sortir */}
      <div className="glass flex flex-col gap-3 rounded-3xl p-4 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <SearchPlaceholder />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, deskripsi, topik, bahasa… (real-time)"
            aria-label="Cari repositori"
            className="h-11 w-full rounded-full border border-white/10 bg-ink/60 pl-11 pr-4 font-sans text-[13.5px] text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-ember/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-white/10 bg-ink/60 p-0.5" role="group" aria-label="Filter fork">
            {(
              [
                ['all', 'Semua'],
                ['original', 'Original'],
                ['fork', 'Forks'],
              ] as Array<[ForkFilter, string]>
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setForkF(k)}
                aria-pressed={forkF === k}
                className={cx(
                  'rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
                  forkF === k ? 'bg-ember text-ink' : 'text-cream/55 hover:text-cream',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Pengurutan"
            className="h-11 cursor-pointer rounded-full border border-white/10 bg-ink/60 px-4 font-mono text-[10.5px] uppercase tracking-wider text-cream/75 outline-none transition-colors focus:border-ember/50"
          >
            <option value="pushed">Terbaru diperbarui</option>
            <option value="stars">Stars terbanyak</option>
            <option value="name">Nama A–Z</option>
          </select>
        </div>
      </div>

      {/* Chips kategori */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              aria-pressed={active}
              title={c.hint}
              className={cx(
                'flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all',
                active
                  ? 'border-ember/60 bg-ember/15 text-cream shadow-glow'
                  : 'border-white/10 bg-white/[0.02] text-cream/55 hover:border-white/25 hover:text-cream',
              )}
            >
              <span className="size-1.5 rounded-full" style={{ background: c.color }} />
              {c.label}
              <span className={active ? 'text-cream/70' : 'text-cream/30'}>{counts[c.id] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40">
        <span>{filtered.length} repositori</span>
        <span>urut: {SORT_LABEL[sort]}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <SearchX className="size-8 text-cream/30" />
          <p className="mt-4 text-[14px] text-cream/60">
            Tidak ada repositori yang cocok dengan <span className="font-mono text-cream/85">“{q}”</span>.
          </p>
          <button
            type="button"
            onClick={() => {
              setQ('');
              setCat('all');
              setForkF('all');
            }}
            className="mt-4 h-9 rounded-full border border-white/15 px-4 font-mono text-[10px] uppercase tracking-wider text-cream/70 transition hover:border-ember/50 hover:text-cream"
          >
            Reset filter
          </button>
        </div>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((r, i) => (
              <RepoCard key={r.name} repo={r} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function SearchPlaceholder() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cream/40"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
