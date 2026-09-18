import { describe, expect, it } from 'vitest';
import { cx, formatDate, formatIDR, formatNumber, hostOf, langColor, timeAgo } from '@/lib/utils';

describe('formatIDR()', () => {
  it('memformat rupiah dengan pemisah ribuan id-ID', () => {
    expect(formatIDR(750_000)).toContain('750.000');
    expect(formatIDR(2_500_000)).toContain('2.500.000');
  });

  it('tanpa desimal', () => {
    expect(formatIDR(50_000)).not.toContain(',');
    expect(formatIDR(50_000)).not.toContain('.50');
  });
});

describe('formatNumber()', () => {
  it('memformat angka gaya Indonesia', () => {
    expect(formatNumber(91)).toBe('91');
    expect(formatNumber(12_345)).toBe('12.345');
  });
});

describe('formatDate()', () => {
  it('memformat tanggal pendek id-ID', () => {
    expect(formatDate('2026-09-17T00:00:00Z')).toContain('2026');
  });
  it('aman untuk input kosong/invalid', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('bukan-tanggal')).toBe('—');
  });
});

describe('timeAgo()', () => {
  const now = Date.now();
  const ago = (detik: number) => new Date(now - detik * 1000).toISOString();

  it('relatif waktu dalam Bahasa Indonesia', () => {
    expect(timeAgo(ago(10))).toBe('baru saja');
    expect(timeAgo(ago(5 * 60))).toBe('5 mnt lalu');
    expect(timeAgo(ago(3 * 3600))).toBe('3 jam lalu');
    expect(timeAgo(ago(2 * 86400))).toBe('2 hari lalu');
  });

  it('aman untuk input kosong/invalid', () => {
    expect(timeAgo(null)).toBe('—');
    expect(timeAgo(undefined)).toBe('—');
    expect(timeAgo('invalid')).toBe('—');
  });
});

describe('hostOf()', () => {
  it('mengambil host dari URL', () => {
    expect(hostOf('https://pemdi.vercel.app/path')).toBe('pemdi.vercel.app');
  });
  it('mengembalikan apa adanya untuk input invalid/kosong', () => {
    expect(hostOf(null)).toBe('');
    expect(hostOf('bukan-url')).toBe('bukan-url');
  });
});

describe('langColor()', () => {
  it('warna bahasa dikenal & fallback abu-abu', () => {
    expect(langColor('TypeScript')).toBe('#3178c6');
    expect(langColor(null)).toBe('#8b949e');
    expect(langColor('BahasaMisterius')).toBe('#8b949e');
  });
});

describe('cx()', () => {
  it('menggabungkan class truthy', () => {
    expect(cx('a', false, 'b', undefined, 'c')).toBe('a b c');
    expect(cx()).toBe('');
  });
});
