import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseChangelog } from '@/lib/changelog';

const MD = readFileSync('CHANGELOG.md', 'utf8');

describe('lib/changelog — parser', () => {
  it('format dasar: versi + judul + tanggal', () => {
    const out = parseChangelog('## [v1] — Judul entri — 2026-09-22\n\n### Bagian\n- butir satu\n- butir dua\n');
    expect(out).toHaveLength(1);
    expect(out[0].version).toBe('v1');
    expect(out[0].title).toBe('Judul entri');
    expect(out[0].date).toBe('2026-09-22');
    expect(out[0].sections[0].bullets).toEqual(['butir satu', 'butir dua']);
  });

  it('entri tanpa judul (hanya versi + tanggal)', () => {
    const out = parseChangelog('## [Lokalisasi] — 2026-09-17\n\n- satu\n');
    expect(out[0].title).toBe('');
    expect(out[0].date).toBe('2026-09-17');
  });

  it('butir multi-baris menyatu (menjorok)', () => {
    const out = parseChangelog('## [v2] — t — 2026-09-22\n\n### S\n- awal baris\n  lanjutan baris\n- berikutnya\n');
    expect(out[0].sections[0].bullets).toEqual(['awal baris lanjutan baris', 'berikutnya']);
  });

  it('butir sebelum subseksi pertama masuk seksi tanpa judul', () => {
    const out = parseChangelog('## [v3] — t — 2026-09-22\n\n- langsung butir\n\n### Baru\n- x\n');
    expect(out[0].sections[0].title).toBe('');
    expect(out[0].sections[0].bullets).toEqual(['langsung butir']);
    expect(out[0].sections[1].title).toBe('Baru');
  });

  it('CHANGELOG.md asli: >= 20 entri, semua bertanggal, terbaru duluan', () => {
    const out = parseChangelog(MD);
    expect(out.length).toBeGreaterThanOrEqual(20);
    for (const e of out) expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (let i = 1; i < out.length; i++) {
      expect(out[i - 1].date >= out[i].date).toBe(true);
    }
    // entri terbaru yang dikenal
    expect(out[0].version).toContain('2026.11');
    // setiap entri punya minimal satu seksi dengan isi
    for (const e of out) {
      expect(e.sections.length).toBeGreaterThanOrEqual(1);
    }
  });
});
