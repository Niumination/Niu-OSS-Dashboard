'use client';

/*
 * <T k="key" vars={{ n: 3 }} /> — terjemahan untuk komponen server.
 *
 * Dirender SSR dalam bahasa default (id); setelah hydration ikut berganti
 * mengikuti locale aktif di LocaleProvider.
 */

import { useLocale } from './LocaleProvider';

export default function T({
  k,
  vars,
}: {
  k: string;
  vars?: Record<string, string | number>;
}) {
  const { t } = useLocale();
  return <>{t(k, vars)}</>;
}
