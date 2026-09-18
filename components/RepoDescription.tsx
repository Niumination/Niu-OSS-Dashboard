'use client';

/*
 * RepoDescription — deskripsi repositori yang sadar-locale.
 * Dipakai di halaman detail repo (server page): SSR memakai bahasa
 * default (id), lalu ikut berganti saat pengguna memilih EN.
 */

import { useLocale } from './LocaleProvider';
import { localizedDescription, type DescribableRepo } from '@/lib/repo-i18n';

export default function RepoDescription({ repo }: { repo: DescribableRepo }) {
  const { t, locale } = useLocale();
  const description = localizedDescription(repo, locale);
  return <>{description ?? t('rd.nodesc')}</>;
}
