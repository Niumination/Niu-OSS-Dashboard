'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { useLocale } from './LocaleProvider';

/*
 * OfflineCacheList — jantung "halaman offline kaya" (Fase 2): membaca
 * Cache API langsung dari browser dan menampilkan halaman apa saja yang
 * benar-benar tersimpan — bukan daftar statis yang bisa bohong.
 * Fallback: daftar halaman inti yang selalu di-precache service worker.
 */

const LABELS: Record<string, string> = {
  '/': 'Beranda',
  '/repositories': 'Repositori',
  '/studies': 'Studi Kasus',
  '/now': 'Sekarang',
  '/changelog': 'Catatan Rilis',
  '/status': 'Halaman Status',
  '/system': 'Sistem & Metrik',
  '/services': 'Jasa',
  '/developers': 'API Publik',
};

const CORE_FALLBACK = ['/', '/repositories', '/studies', '/now', '/changelog', '/status'];

function labelFor(path: string): string {
  if (LABELS[path]) return LABELS[path];
  const m = /^\/(repo|studies)\/([^/]+)/.exec(path);
  if (m) return `${m[2]} (${m[1] === 'repo' ? 'repo' : 'studi'})`;
  return path;
}

export default function OfflineCacheList() {
  const [pages, setPages] = useState<string[] | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!('caches' in self)) {
          if (alive) setPages(CORE_FALLBACK);
          return;
        }
        const names = await caches.keys();
        const urls = new Set<string>();
        for (const name of names) {
          const cache = await caches.open(name);
          for (const req of await cache.keys()) {
            const url = new URL(req.url);
            if (url.origin !== self.location.origin) continue;
            if (url.pathname.includes('/_next/') || url.pathname.includes('.')) continue;
            if (url.pathname === '/offline') continue;
            urls.add(url.pathname);
          }
        }
        const list = [...urls].sort();
        if (alive) setPages(list.length > 0 ? list : CORE_FALLBACK);
      } catch {
        if (alive) setPages(CORE_FALLBACK);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="mt-8 w-full max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50">
        <BookOpen className="size-3.5 text-ember" aria-hidden />
        {t('offline.list.title')}
      </p>
      {pages === null ? (
        <p className="mt-3 font-mono text-[11px] text-cream/40">{t('offline.list.checking')}</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {pages.slice(0, 12).map((p) => (
            <li key={p}>
              <Link
                href={p}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-cream/70 transition hover:bg-white/[0.05] hover:text-cream"
              >
                <CheckCircle2 className="size-3.5 shrink-0 text-success/70" aria-hidden />
                <span className="truncate group-hover:text-cream">{labelFor(p)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {pages !== null && pages.length > 12 && (
        <p className="mt-2 px-2 font-mono text-[10px] text-cream/35">
          {t('offline.list.more', { n: pages.length - 12 })}
        </p>
      )}
    </section>
  );
}
