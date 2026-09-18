import type { RepoLite } from './types';

export interface CategoryDef {
  id: string;
  label: string;
  hint: string;
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'all', label: 'Semua', hint: 'Semua repositori', color: '#f2ecdf' },
  { id: 'web', label: 'Aplikasi Web', hint: 'Aplikasi web, dashboard, portal', color: '#00e5ff' },
  { id: 'dotfiles', label: 'Konfigurasi Sistem', hint: 'Dotfiles, desktop, sistem', color: '#e05a1e' },
  { id: 'cli', label: 'CLI & Terminal', hint: 'CLI, TUI, emulator, terminal', color: '#a78bfa' },
  { id: 'mobile', label: 'Mobile', hint: 'Aplikasi Android / mobile', color: '#3ddc97' },
  { id: 'utility', label: 'Utilitas', hint: 'Script, tooling, automation', color: '#f5c518' },
  { id: 'docs', label: 'Dokumentasi & Lainnya', hint: 'Dokumentasi & lainnya', color: '#8b949e' },
];

export const CATEGORY_MAP: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

const WEB_LANGS = new Set([
  'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Svelte', 'Vue', 'Astro', 'React',
]);
const SYS_LANGS = new Set(['Python', 'Shell', 'Rust', 'C++', 'Go', 'Nix', 'C', 'Ruby']);

const DOTFILES_RE =
  /dotfile|hypr|ryu\b|ryuland|zaryu|kaizen|sddm|waybar|alacritty|sway|dwm|i3-|kanshi|rice|desktop|hyde|desktop environment|system config|iso builder|nixpacks/i;
const CLI_RE =
  /\bcli\b|terminal|emulator|\btui\b|shell|wrapper|console app|\bade\b/i;
const MOBILE_RE = /android|mobile|\bapp\b.*phone|sd card/i;
const WEB_HINT_RE = /dashboard|portal|startpage|web\s?app|website|search engine|landing|profile readme/i;

/**
 * Klasifikasi repositori ke kategori berdasarkan language, nama, deskripsi
 * dan topik. Prioritas: dotfiles > cli > mobile > web > utility > docs.
 */
export function categorize(repo: RepoLite): string {
  const name = repo.name.toLowerCase();
  const text = `${repo.name} ${repo.description ?? ''} ${(repo.topics ?? []).join(' ')}`;

  if (DOTFILES_RE.test(name) || DOTFILES_RE.test(text)) return 'dotfiles';
  if (CLI_RE.test(name) || CLI_RE.test(text)) return 'cli';
  if (
    (repo.language === 'Kotlin' || repo.language === 'Java') &&
    (MOBILE_RE.test(text) || /android/i.test(name))
  ) {
    return 'mobile';
  }
  if (
    (repo.language && WEB_LANGS.has(repo.language)) ||
    (!repo.language && repo.homepage && (WEB_HINT_RE.test(text) || /vercel.app|github.io/.test(repo.homepage)))
  ) {
    return 'web';
  }
  if (repo.language && SYS_LANGS.has(repo.language)) return 'utility';
  return 'docs';
}

export function categorizeAll(repos: RepoLite[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const r of repos) out.set(r.name, categorize(r));
  return out;
}

export function countByCategory(repos: RepoLite[]): Record<string, number> {
  const counts: Record<string, number> = { all: repos.length };
  for (const r of repos) {
    const id = categorize(r);
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}
