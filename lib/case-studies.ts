/*
 * Studi kasus — konten in-repo (tanpa CMS), berbasis fakta repositori nyata.
 * Sumber tunggal: data/studies.json — dipakai UI (studies-ui.tsx) DAN API
 * publik v1 (scripts/gen-api.mjs). Struktur: masalah -> pendekatan -> hasil.
 *
 * Field `en` = varian bahasa Inggris (overlay di atas basis Indonesia);
 * dipilih sesuai locale aktif lewat localizedStudy().
 */

import raw from '@/data/studies.json';
import type { Locale } from '@/lib/i18n';

export interface StudyApproach {
  title: string;
  text: string;
}

export interface StudyMetric {
  label: string;
  value: string;
}

/** Terjemahan EN — overlay di atas field basis yang tidak diterjemahkan. */
export interface CaseStudyEn {
  tagline: string;
  metrics?: StudyMetric[];
  problem: string;
  approach: StudyApproach[];
  outcome: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  tagline: string;
  kind: string;
  year: string;
  repo: string;
  demo?: string;
  stack: string[];
  metrics: StudyMetric[];
  problem: string;
  approach: StudyApproach[];
  outcome: string;
  accent: string;
  en?: CaseStudyEn;
}

export const CASE_STUDIES = raw as CaseStudy[];

export function getStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}

/** Studi sebelum & sesudah `slug` (untuk navigasi bawah halaman detail). */
export function getAdjacent(slug: string): {
  prev: CaseStudy | undefined;
  next: CaseStudy | undefined;
} {
  const idx = CASE_STUDIES.findIndex((x) => x.slug === slug);
  return { prev: CASE_STUDIES[idx - 1], next: CASE_STUDIES[idx + 1] };
}

/**
 * Varian bahasa dari sebuah studi: locale 'en' + ada field `en` ->
 * overlay EN di atas basis ID; selain itu basis ID dikembalikan apa adanya.
 */
export function localizedStudy(c: CaseStudy, locale: Locale): CaseStudy {
  if (locale !== 'en' || !c.en) return c;
  return {
    ...c,
    tagline: c.en.tagline,
    metrics: c.en.metrics ?? c.metrics,
    problem: c.en.problem,
    approach: c.en.approach,
    outcome: c.en.outcome,
  };
}
