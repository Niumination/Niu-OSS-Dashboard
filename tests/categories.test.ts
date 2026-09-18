import { describe, expect, it } from 'vitest';
import { CATEGORIES, CATEGORY_MAP, categorize, countByCategory } from '@/lib/categories';
import type { RepoLite } from '@/lib/types';

/** Fixture RepoLite dengan default — hanya field relevan untuk kategorisasi. */
function repo(partial: Partial<RepoLite>): RepoLite {
  return {
    name: 'repo-tes',
    fullName: 'Niumination/repo-tes',
    url: 'https://github.com/Niumination/repo-tes',
    description: null,
    language: null,
    stars: 0,
    forks: 0,
    watchers: 0,
    openIssues: 0,
    topics: [],
    homepage: null,
    fork: false,
    archived: false,
    license: null,
    size: 100,
    createdAt: '2026-01-01T00:00:00Z',
    pushedAt: '2026-01-01T00:00:00Z',
    ...partial,
  };
}

describe('categorize()', () => {
  it('mengenali dotfiles / system config dari nama', () => {
    expect(categorize(repo({ name: 'hyprland-config' }))).toBe('dotfiles');
    expect(categorize(repo({ name: 'dotfiles-utama' }))).toBe('dotfiles');
    expect(categorize(repo({ name: 'nix-iso-builder', description: 'iso builder sistem' }))).toBe('dotfiles');
  });

  it('mengenali CLI/terminal dari nama atau deskripsi', () => {
    expect(categorize(repo({ name: 'my-cli-tool' }))).toBe('cli');
    expect(categorize(repo({ name: 'x', description: 'terminal emulator ringan' }))).toBe('cli');
  });

  it('mengenali mobile (Kotlin/Java + android)', () => {
    expect(categorize(repo({ name: 'aplikasi-android', language: 'Kotlin' }))).toBe('mobile');
    expect(categorize(repo({ name: 'app', language: 'Java', description: 'android app' }))).toBe('mobile');
    // TypeScript "app" tidak otomatis mobile
    expect(categorize(repo({ name: 'web-app', language: 'TypeScript' }))).toBe('web');
  });

  it('mengenali web dari bahasa web', () => {
    expect(categorize(repo({ name: 'portal-warga', language: 'TypeScript' }))).toBe('web');
    expect(categorize(repo({ name: 'halaman', language: 'HTML' }))).toBe('web');
  });

  it('web dari homepage + petunjuk teks saat tanpa bahasa', () => {
    expect(
      categorize(repo({ name: 'profil', homepage: 'https://x.vercel.app', description: 'landing page' })),
    ).toBe('web');
  });

  it('utility untuk bahasa sistem (Python/Shell/Rust/Nix)', () => {
    expect(categorize(repo({ name: 'skrip-otomasi', language: 'Python' }))).toBe('utility');
    expect(categorize(repo({ name: 'setup', language: 'Shell' }))).toBe('utility');
    expect(categorize(repo({ name: 'alat-cepat', language: 'Rust' }))).toBe('utility');
  });

  it('docs sebagai kategori akhir', () => {
    expect(categorize(repo({ name: 'catatan-belajar' }))).toBe('docs');
  });

  it('prioritas: dotfiles > cli', () => {
    // nama mengandung keduanya -> dotfiles menang
    expect(categorize(repo({ name: 'dotfiles-cli' }))).toBe('dotfiles');
  });
});

describe('CATEGORIES & CATEGORY_MAP', () => {
  it('setiap kategori punya id, label, warna unik', () => {
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(6);
    expect(CATEGORIES[0].id).toBe('all');
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CATEGORIES) {
      expect(CATEGORY_MAP[c.id]).toBeDefined();
      expect(c.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('countByCategory()', () => {
  it('menghitung semua + per kategori', () => {
    const counts = countByCategory([
      repo({ name: 'a-dotfiles' }),
      repo({ name: 'b-dotfiles' }),
      repo({ name: 'c-web', language: 'TypeScript' }),
    ]);
    expect(counts.all).toBe(3);
    expect(counts.dotfiles).toBe(2);
    expect(counts.web).toBe(1);
  });
});
