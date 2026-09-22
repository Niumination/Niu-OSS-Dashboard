'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Command, Heart } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import { useUi } from './ui-context';
import { useLocale } from './LocaleProvider';
import { formatNumber } from '@/lib/utils';
import SceneLite from './hero/SceneLite';

/*
 * Hero3D — hero section interaktif dengan performance-aware:
 *  1. Device check saat mount (UA mobile + deviceMemory ≤ 4 GB / layar kecil
 *     / prefers-reduced-motion) -> langsung mode LITE (CSS glow + canvas 2D).
 *  2. Scene 3D (Three.js/R3F) di-load secara dinamis (ssr: false).
 *  3. Frame-rate monitor di dalam scene: <45 fps selama 2 dtk (pasca warm-up)
 *     -> degrade otomatis ke mode LITE agar tetap 60 fps.
 */

const Scene3D = dynamic(() => import('./hero/Scene3D'), {
  ssr: false,
  loading: () => <ScenePlaceholder />,
});

function detectLite(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;
  const coarseSmall =
    window.matchMedia('(pointer: coarse)').matches &&
    Math.min(window.innerWidth, window.innerHeight) < 720;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduced || lowMemory || (mobileUA && coarseSmall);
}

function ScenePlaceholder() {
  const { t } = useLocale();
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-10 rounded-full border-2 border-ember/40 border-t-ember animate-spin" />
        <span className="micro text-cream/40">{t('hero.scene.loading')}</span>
      </div>
    </div>
  );
}

interface HeroStats {
  repos: number;
  stars: number;
  forks: number;
  followers: number;
}

export default function Hero3D({ stats }: { stats: HeroStats }) {
  const [mode, setMode] = useState<'3d' | 'lite' | null>(null);
  const [fps, setFps] = useState<number | null>(null);
  const degradeRef = useRef(false);
  const { openCommand, openPayment } = useUi();
  const { t } = useLocale();

  useEffect(() => {
    setMode(detectLite() ? 'lite' : '3d');
  }, []);

  const handleFps = useCallback((v: number) => setFps(v), []);
  const handleDegrade = useCallback(() => {
    if (!degradeRef.current) {
      degradeRef.current = true;
      setFps(null);
      setMode('lite');
    }
  }, []);
  // Error/kegagalan WebGL pada Scene3D → degrade permanen ke lite (bukan
  // spinner selamanya). resetKeys={[mode]} menyembuhkan boundary → SceneLite
  // langsung merender menggantikan scene yang gagal.
  const handleSceneError = useCallback(() => handleDegrade(), [handleDegrade]);

  const chips: Array<[string, number]> = [
    [t('hero.chip.repos'), stats.repos],
    [t('hero.chip.stars'), stats.stars],
    [t('hero.chip.forks'), stats.forks],
    [t('hero.chip.followers'), stats.followers],
  ];

  return (
    <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-ink-2 shadow-card">
      <div className="pointer-events-none absolute -top-28 -right-20 size-96 rounded-full bg-ember/15 blur-3xl animate-float-orb" />
      <div
        className="pointer-events-none absolute -bottom-28 -left-20 size-96 rounded-full bg-spotlight/[0.07] blur-3xl animate-float-orb"
        style={{ animationDelay: '-7s' }}
      />
      <div className="dotgrid pointer-events-none absolute inset-0 text-cream opacity-[0.05]" />

      <div className="relative grid gap-8 p-6 md:p-10 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col justify-center lg:col-span-7">
            {/* Animasi masuk cepat (0,35 dtk): elemen ini adalah LCP — animasi
                panjang menunda paint terbesar halaman (audit Lighthouse). */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
            <div className="micro flex items-center gap-2.5 text-cream/60">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-ember" />
              </span>
              ~/niumination — aceh tengah, id
            </div>

            <h1 className="mt-4 font-display text-[42px] leading-[0.98] tracking-tight text-cream sm:text-[54px] md:text-[64px]">
              {t('hero.h1a')}
              <br />
              {t('hero.h1b')} <span className="grad-text">{t('hero.h1c')}</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/70 md:text-[15px]">
              {t('hero.p', { repos: stats.repos })}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/repositories"
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-ember px-6 font-mono text-[11px] uppercase tracking-wider text-ink transition hover:bg-ember-soft hover:shadow-glow"
              >
                {t('hero.cta.repos')}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                type="button"
                onClick={() => openPayment('oss')}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 font-mono text-[11px] uppercase tracking-wider text-cream transition hover:border-ember/50 hover:bg-white/10"
              >
                <Heart className="size-3.5 text-ember" />
                {t('hero.cta.donate')}
              </button>
              <button
                type="button"
                onClick={openCommand}
                className="hidden h-11 items-center gap-2 rounded-full border border-white/10 px-4 font-mono text-[11px] uppercase tracking-wider text-cream/60 transition hover:text-cream sm:inline-flex"
                title="Command palette (Ctrl+K)"
              >
                <Command className="size-3.5" />
                Ctrl K
              </button>
            </div>

            <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {chips.map(([label, value], i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5"
                >
                  <div className="font-display text-[26px] leading-none tabular-nums text-cream">
                    {formatNumber(value)}
                  </div>
                  <div className="micro mt-1.5 text-cream/50">{label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-ink/70 md:min-h-[430px]">
            <ErrorBoundary label="hero-3d" resetKeys={[mode]} onError={handleSceneError}>
              {mode === '3d' ? (
                <Scene3D onFps={handleFps} onDegrade={handleDegrade} />
              ) : mode === 'lite' ? (
                <SceneLite />
              ) : (
                <ScenePlaceholder />
              )}
            </ErrorBoundary>

            <div className="pointer-events-none absolute top-3 left-4 micro text-cream/40">
              {t('hero.scene.label')}
            </div>
            <div className="pointer-events-none absolute top-3 right-4 rounded-full border border-white/10 bg-ink/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-cream/70 backdrop-blur">
              {mode === '3d' ? `3d · ${fps ?? '—'} fps` : mode === 'lite' ? t('hero.scene.lite') : t('hero.scene.boot')}
            </div>
            <div className="pointer-events-none absolute bottom-3 left-4 font-mono text-[9px] uppercase tracking-[0.2em] text-cream/40">
              {t('hero.scene.hint')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
