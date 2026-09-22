'use client';

/*
 * TitleSync — menjaga document.title mengikuti locale aktif (2026.16).
 *
 * Halaman statis hanya punya SATU metadata <title> hasil prerender (id).
 * Komponen ini menimpanya di klien saat pengguna memilih EN, dan
 * mengembalikannya saat kembali ke ID — nilai ID kamus identik dengan
 * metadata prerender, jadi tidak ada kedipan.
 *
 * Pemakaian: <TitleSync k="title.studies" />
 * Dengan interpolasi: <TitleSync k="title.study" vars={{ name: c.title }} varsEn={{ name: c.en.title }} />
 */

import { useEffect } from 'react';
import { useLocale } from './LocaleProvider';

export default function TitleSync({
  k,
  vars,
  varsEn,
}: {
  k: string;
  vars?: Record<string, string | number>;
  varsEn?: Record<string, string | number>;
}) {
  const { locale, t } = useLocale();

  useEffect(() => {
    document.title = t(k, locale === 'en' ? (varsEn ?? vars) : vars);
  }, [locale, k, t, vars, varsEn]);

  return null;
}
