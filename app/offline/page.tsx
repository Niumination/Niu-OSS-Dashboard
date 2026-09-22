import type { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw, WifiOff } from 'lucide-react';
import T from '@/components/T';
import TitleSync from '@/components/TitleSync';
import OfflineCacheList from '@/components/OfflineCacheList';

export const metadata: Metadata = {
  title: 'Offline',
  description: 'Halaman fallback offline (PWA).',
  robots: { index: false, follow: false },
};

/**
 * Halaman offline PWA — di-precache service worker (public/sw.js) dan
 * disajikan saat navigasi gagal karena tidak ada koneksi.
 */
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
      <TitleSync k="title.offline" />
      <div className="grid size-16 place-items-center rounded-3xl border border-white/10 bg-white/[0.03]">
        <WifiOff className="size-7 text-ember" />
      </div>
      <div className="micro text-cream/45">
        <T k="offline.micro" />
      </div>
      <h1 className="font-display text-[42px] leading-tight tracking-tight md:text-[56px]">
        <T k="offline.title" />
      </h1>
      <p className="max-w-md text-[14px] leading-relaxed text-cream/60">
        <T k="offline.desc" />
      </p>
      <OfflineCacheList />
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="h-11 rounded-full bg-ember px-6 font-mono text-[11px] uppercase tracking-wider text-ink transition hover:bg-ember-soft"
          data-reload
        >
          <span className="flex items-center gap-2">
            <RotateCcw className="size-3.5" />
            <T k="offline.retry" />
          </span>
        </button>
        <Link
          href="/"
          className="flex h-11 items-center rounded-full border border-white/15 px-6 font-mono text-[11px] uppercase tracking-wider text-cream/75 transition hover:border-ember/50 hover:text-cream"
        >
          <T k="offline.home" />
        </Link>
      </div>
    </div>
  );
}
