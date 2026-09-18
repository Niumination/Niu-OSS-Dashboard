'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Fuse from 'fuse.js';
import { AlertTriangle, SearchX } from 'lucide-react';
import RepoCard from './RepoCard';
import { CATEGORIES, categorize, countByCategory } from '@/lib/categories';
import type { RepoLite } from '@/lib/types';
import { cx, formatDate } from '@/lib/utils';
import { useLocale } from './LocaleProvider';

type SortKey = 'pushed' | 'stars' | 'name';
type ForkFilter = 'all' | 'original' | 'fork';

interface Props {
  repos: RepoLite[];
  /** true saat data berasal dari fallback snapshot (rate-limit / offline). */
  offline?: boolean;
  offlineDate?: string;
}



/**
 * Aggregator repositori: pencarian real-time, pengelompokan kategori otomatis
 * (berbasis language/topik/nama), filter fork, dan pengurutan.
 */
export default function RepoGrid({ repos, offline = false, offlineDate }: Props) {
  const { t } = useLocale();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<SortKey>('pushed');
  const [forkF, setForkF] = useState<ForkFilter>('all');
  // Deferral: input tetap 60fps meski 90+ kartu harus difilter ulang.
  const dq = useDeferredValue(q);
  const reduceMotion = useReducedMotion() === true;

  // Query dari URL (?q=… — dipakai SearchAction SEO & tautan eksternal)
  // dibaca saat hydration agar halaman tetap bisa dirender statis.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('q');
    if (fromUrl) setQ(fromUrl);
  }, []);

  const counts = useMemo(() => countByCategory(repos), [repos]);

  // Indeks fuzzy (Fuse.js): salah ketik tetap menemukan ("pemdi" ~ "PemdiAcehTengah").
  const fuse = useMemo(
    () =>
      new Fuse(repos, {
        keys: [
          { name: 'name', weight: 0.55 },
          { name: 'description', weight: 0.3 },
          { name: 'topics', weight: 0.1 },
          { name: 'language', weight: 0.05 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [repos],
  );

  const filtered = useMemo(() => {
    const needle = dq.trim();
    // Hasil pencarian dulu (fuzzy, terurut skor) — lalu saring kategori/fork.
    const base = needle
      ? fuse.search(needle, { limit: 60 }).map((r) => r.item)
      : repos;
    const list = base.filter((r) => {
      if (forkF === 'original' && r.fork) return false;
      if (forkF === 'fork' && !r.fork) return false;
      if (cat !== 'all' && categorize(r) !== cat) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sort === 'stars') return b.stars - a.stars || +new Date(b.pushedAt) - +new Date(a.pushedAt);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return +new Date(b.pushedAt) - +new Date(a.pushedAt);
    });
    return list;
  }, [repos, dq, cat, sort, forkF, fuse]);

  return (
    <div>
      {offline && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-warn/25 bg-warn/[0.07] px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
          <p className="text-[12.5px] leading-relaxed text-warn/90">
            {t('rg.offline.a')}{' '}
            <strong>{t('rg.offline.b')}</strong>{' '}
            {t('rg.offline.c', { date: formatDate(offlineDate ?? new Date().toISOString()) })}
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
            placeholder={t('rg.search.ph')}
            aria-label={t('rg.search.aria')}
            className="h-11 w-full rounded-full border border-white/10 bg-ink/60 pl-11 pr-4 font-sans text-[13.5px] text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-ember/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-white/10 bg-ink/60 p-0.5" role="group" aria-label={t('rg.fork.aria')}>
            {(
              [
                ['all', t('rg.fork.all')],
                ['original', t('rg.fork.original')],
                ['fork', t('rg.fork.fork')],
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
            aria-label={t('rg.sort.aria')}
            className="h-11 cursor-pointer rounded-full border border-white/10 bg-ink/60 px-4 font-mono text-[10.5px] uppercase tracking-wider text-cream/75 outline-none transition-colors focus:border-ember/50"
          >
            <option value="pushed">{t('rg.sort.pushed.opt')}</option>
            <option value="stars">{t('rg.sort.stars.opt')}</option>
            <option value="name">{t('rg.sort.name.opt')}</option>
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
              title={t(`cat.hint.${c.id}`)}
              className={cx(
                'flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all',
                active
                  ? 'border-ember/60 bg-ember/15 text-cream shadow-glow'
                  : 'border-white/10 bg-white/[0.02] text-cream/55 hover:border-white/25 hover:text-cream',
              )}
            >
              <span className="size-1.5 rounded-full" style={{ background: c.color }} />
              {t(`cat.${c.id}.label`)}
              <span className={active ? 'text-cream/70' : 'text-cream/30'}>{counts[c.id] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <div
        aria-live="polite"
        className="mt-5 mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40"
      >
        <span>{t('rg.count', { n: filtered.length })}</span>
        <span>{t('rg.sorted', { label: t(`rg.sort.${sort}`) })}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <SearchX className="size-8 text-cream/30" />
          <p className="mt-4 text-[14px] text-cream/60">
            {t('rg.empty', { q })}
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
            {t('rg.reset')}
          </button>
        </div>
      ) : (
        <motion.div layout={!reduceMotion} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((r, i) => (
              <RepoCard key={r.name} repo={r} index={i} instant={reduceMotion} />
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
