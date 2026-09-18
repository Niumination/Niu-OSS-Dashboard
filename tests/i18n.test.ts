import { describe, expect, it } from 'vitest';
import { dictionaries, translate } from '@/lib/i18n';
import { CASE_STUDIES, getAdjacent, getStudy, localizedStudy } from '@/lib/case-studies';

describe('i18n — kamus', () => {
  const idKeys = Object.keys(dictionaries.id).sort();
  const enKeys = Object.keys(dictionaries.en).sort();

  it('setiap kunci id ada di en (dan sebaliknya)', () => {
    expect(enKeys).toEqual(idKeys);
  });

  it('tidak ada nilai kosong di kedua bahasa', () => {
    for (const [k, v] of Object.entries(dictionaries.id)) expect(v, `id.${k}`).toBeTruthy();
    for (const [k, v] of Object.entries(dictionaries.en)) expect(v, `en.${k}`).toBeTruthy();
  });

  it('teks id dan en benar-benar berbeda (bukan salinan)', () => {
    let identik = 0;
    for (const k of idKeys) {
      if (dictionaries.id[k] === dictionaries.en[k]) identik += 1;
    }
    // Brand/istilah teknis boleh sama, tapi mayoritas harusnya berbeda.
    expect(identik).toBeLessThan(idKeys.length * 0.1);
  });

  it('interpolasi {var} diganti', () => {
    expect(translate('id', 'footer.data', { date: '17 Sep' })).toContain('17 Sep');
    expect(translate('en', 'status.badge', { up: 9, sites: 10 })).toBe('9/10 operational');
    expect(translate('id', 'status.badge', { up: 9, sites: 10 })).toBe('9/10 operasional');
  });

  it('fallback: kunci tak dikenal -> kunci itu sendiri', () => {
    expect(translate('en', 'tidak.ada')).toBe('tidak.ada');
  });

  it('translate en memakai kamus en', () => {
    expect(translate('en', 'nav.home')).toBe('Home');
    expect(translate('id', 'nav.home')).toBe('Beranda');
  });
});

describe('studi kasus — data & lokalizasi', () => {
  it('ada 3 studi dengan slug unik', () => {
    expect(CASE_STUDIES).toHaveLength(3);
    expect(new Set(CASE_STUDIES.map((c) => c.slug)).size).toBe(3);
  });

  it('semua studi punya terjemahan en lengkap', () => {
    for (const c of CASE_STUDIES) {
      expect(c.en, `${c.slug}.en`).toBeTruthy();
      expect(c.en!.tagline).toBeTruthy();
      expect(c.en!.problem).toBeTruthy();
      expect(c.en!.outcome).toBeTruthy();
      expect(c.en!.approach).toHaveLength(3);
    }
  });

  it('getStudy + getAdjacent konsisten', () => {
    expect(getStudy('pemdi-aceh-tengah')?.title).toBe('Pemdi Aceh Tengah');
    const first = getAdjacent('pemdi-aceh-tengah');
    expect(first.prev).toBeUndefined();
    expect(first.next?.slug).toBe('flame-ade');
    const last = getAdjacent('ai-first-os');
    expect(last.next).toBeUndefined();
  });

  it('localizedStudy: en overlay, id apa adanya', () => {
    const c = getStudy('flame-ade')!;
    const en = localizedStudy(c, 'en');
    expect(en.problem).toBe(c.en!.problem);
    expect(en.title).toBe(c.title); // title tak diterjemahkan (nama proyek)
    expect(en.metrics).toEqual(c.en!.metrics);
    const id = localizedStudy(c, 'id');
    expect(id.problem).toBe(c.problem);
    expect(id.metrics).toEqual(c.metrics);
  });
});
