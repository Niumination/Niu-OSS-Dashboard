'use client';

/*
 * ServiceWorkerRegister — mendaftarkan /sw.js di production.
 * Gagal mendaftar (konteks tidak mendukung, dev mode) diabaikan senyap.
 */

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // diam — PWA bersifat progresif
      });
    };

    // Tombol [data-reload] (mis. halaman offline) -> muat ulang halaman.
    const onDocClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.('[data-reload]');
      if (el) window.location.reload();
    };
    document.addEventListener('click', onDocClick);

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
      return () => {
        window.removeEventListener('load', register);
        document.removeEventListener('click', onDocClick);
      };
    }
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return null;
}
