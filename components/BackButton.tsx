'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from './LocaleProvider';

/*
 * Tombol "kembali" untuk 404 — history.back() via client (server tak
 * bisa). Kalau tidak ada riwayat (tab baru), kembali ke beranda.
 */
export default function BackButton() {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push('/');
      }}
      className="flex h-10 items-center gap-2 rounded-full border border-ember/40 bg-ember/10 px-5 font-mono text-[10.5px] uppercase tracking-wider text-ember transition hover:bg-ember/20"
    >
      <ArrowLeft className="size-3.5" />
      {t('nf.back')}
    </button>
  );
}
