'use client';

import { useEffect, useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { useLocale } from './LocaleProvider';

/*
 * HintCard — onboarding halus (ROADMAP Fase 2): satu kartu kecil saat
 * kunjungan pertama, mengajarkan pintasan '/' dan Ctrl+K.
 * - localStorage 'niu-hint-done' = ditutup permanen.
 * - Pengguna yang menekan '/' atau Ctrl+K dianggap paham → auto-tutup.
 * - Render null di server; muncul via useEffect (aman hydration).
 */

const KEY = 'niu-hint-done';

export default function HintCard() {
  const [show, setShow] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) {
        const timer = setTimeout(() => setShow(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // mode privat: lewati hint, jangan error
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        dismiss();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* abaikan */
    }
  };

  if (!show) return null;

  return (
    <aside
      role="status"
      className="fixed bottom-4 right-4 z-[80] max-w-[280px] rounded-2xl border border-white/15 bg-ink-2/95 p-4 shadow-card backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        <Keyboard className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden />
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50">
            {t('hint.title')}
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-cream/75">
            <kbd className="rounded border border-white/20 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-cream">/</kbd>{' '}
            {t('hint.search')}
            <br />
            <kbd className="rounded border border-white/20 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-cream">Ctrl K</kbd>{' '}
            {t('hint.all')}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('hint.dismiss')}
          className="ml-auto shrink-0 rounded-lg p-1 text-cream/45 transition hover:bg-white/[0.06] hover:text-cream"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
    </aside>
  );
}
