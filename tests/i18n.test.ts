import { describe, expect, it } from 'vitest';
import { dictionaries, translate } from '@/lib/i18n';
import { CASE_STUDIES, getAdjacent, getStudy, localizedStudy } from '@/lib/case-studies';
import { localizedDescription, descriptionEn } from '@/lib/repo-i18n';
import rawRepos from '../data/repos.json';

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
  it('ada 10 studi dengan slug unik', () => {
    expect(CASE_STUDIES).toHaveLength(10);
    expect(new Set(CASE_STUDIES.map((c) => c.slug)).size).toBe(10);
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
    expect(getAdjacent('ai-first-os').next?.slug).toBe('niu-gayo-agroclimate');
    const last = getAdjacent('niu-oss-dashboard');
    expect(last.next).toBeUndefined();
    // studi baru (2026.12): terangkai setelah empat studi lama
    expect(getAdjacent('niu-gayo-agroclimate').next?.slug).toBe('kms-spbe');
    expect(getAdjacent('niu-dash').next?.slug).toBe('niu-oss-dashboard');
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

describe('repo-i18n — overlay deskripsi EN', () => {
  const repos = rawRepos as Array<{ name: string; description: string | null }>;
  const byName = new Map(repos.map((r) => [r.name, r]));

  it('setiap entri overlay menunjuk repo yang ada & nilainya tidak kosong', () => {
    // ambil map EN lewat descriptionEn pada seluruh repo
    const overlays = repos.filter((r) => descriptionEn(r) !== null);
    expect(overlays.length).toBeGreaterThanOrEqual(10);
    for (const r of overlays) {
      expect(descriptionEn(r)).toBeTruthy();
    }
  });

  it('locale id mengembalikan deskripsi sumber; en memakai overlay bila ada', () => {
    const pemdi = byName.get('PemdiAcehTengah')!;
    expect(localizedDescription(pemdi, 'id')).toBe(pemdi.description);
    const en = localizedDescription(pemdi, 'en');
    expect(en).toBeTruthy();
    expect(en).not.toBe(pemdi.description);
    // repo ber-desripsi EN tidak berubah
    const flame = byName.get('Flame-ADE')!;
    expect(localizedDescription(flame, 'en')).toBe(flame.description);
  });

  it('repo tanpa deskripsi tetap null di kedua locale', () => {
    const bare = repos.find((r) => !r.description)!;
    expect(localizedDescription(bare, 'id')).toBeNull();
    expect(localizedDescription(bare, 'en')).toBeNull();
  });
});
