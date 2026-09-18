/*
 * repo-i18n — overlay terjemahan EN untuk deskripsi repositori.
 *
 * Deskripsi sumber datang dari GitHub API (bahasa campuran, mayoritas ID
 * atau EN apa adanya). Repo yang deskripsinya berbahasa Indonesia punya
 * padanan EN di data/repo-descriptions.en.json; sisanya pass-through.
 *
 * Dipakai: RepoCard, halaman detail repo, dan API publik v1
 * (scripts/gen-api.mjs -> field descriptionEn).
 */

import enDescriptions from '@/data/repo-descriptions.en.json';
import type { Locale } from '@/lib/i18n';

const EN_MAP = enDescriptions as Record<string, string>;

export interface DescribableRepo {
  name: string;
  description: string | null;
}

/** Deskripsi repo menurut locale (en = overlay bila ada, selain itu sumber). */
export function localizedDescription(repo: DescribableRepo, locale: Locale): string | null {
  if (locale === 'en') return EN_MAP[repo.name] ?? repo.description;
  return repo.description;
}

/** Padanan EN murni (dipakai gen-api untuk field descriptionEn). */
export function descriptionEn(repo: DescribableRepo): string | null {
  return EN_MAP[repo.name] ?? null;
}
