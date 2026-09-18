'use client';

/*
 * LocaleProvider — konteks bahasa (id | en) untuk seluruh aplikasi.
 *
 * - Default 'id' (sesuai SSR) -> tidak ada hydration mismatch.
 * - Pilihan pengguna disimpan di localStorage('niu-locale') dan
 *   dipulihkan setelah mount.
 * - <html lang> diperbarui otomatis mengikuti locale aktif.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { translate, type Locale } from '@/lib/i18n';

export const LOCALE_STORAGE_KEY = 'niu-locale';

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<LocaleCtx>({
  locale: 'id',
  setLocale: () => {},
  t: (key, vars) => translate('id', key, vars),
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id');

  // Pulihkan preferensi tersimpan (hanya di client, pasca-mount).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved === 'en' || saved === 'id') setLocaleState(saved);
    } catch {
      // localStorage bisa tidak tersedia (private mode dsb.) — abaikan.
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      // abaikan
    }
  }, []);

  // Sinkronkan <html lang>.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  return useContext(Ctx);
}
