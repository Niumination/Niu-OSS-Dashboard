import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * Parser CHANGELOG.md -> struktur data untuk halaman /changelog.
 *
 * Kenapa bukan marked+DOMPurify ala Readme.tsx? Isi CHANGELOG.md adalah
 * berkas repo sendiri yang di-commit (kepercayaan setara menulis JSX);
 * halaman ini statis murni — parsing ke React berarti TANPA
 * dangerouslySetInnerHTML sama sekali (permukaan XSS nol) dan tanpa JS
 * klien tambahan. README repo pihak-lain tetap lewat jalur sanitasi
 * browser (Readme.tsx) karena sumbernya tidak kita kendalikan.
 *
 * Format entri (Keep a Changelog, diadaptasi):
 *   ## [Versi] — Judul — YYYY-MM-DD     (judul opsional)
 *   ### Subseksi
 *   - butir (bisa berlanjut ke baris menjorok)
 */

export interface ChangelogSection {
  title: string;
  bullets: string[];
}

export interface ChangelogEntry {
  version: string;
  title: string;
  /** 'YYYY-MM-DD' */
  date: string;
  sections: ChangelogSection[];
}

const ENTRY_RE = /^## \[(.+?)\](.*)$/;
const DATE_RE = /\s*[—-]\s*(\d{4}-\d{2}-\d{2})\s*$/;

export function parseChangelog(md: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = md.split('\n');
  let cur: ChangelogEntry | null = null;
  let curSection: ChangelogSection | null = null;

  const flush = () => {
    cur = null;
    curSection = null;
  };

  for (const raw of lines) {
    const entry = ENTRY_RE.exec(raw);
    if (entry) {
      const version = entry[1].trim();
      let rest = entry[2];
      let date = '';
      const dm = DATE_RE.exec(rest);
      if (dm) {
        date = dm[1];
        rest = rest.slice(0, dm.index);
      }
      const title = rest.replace(/^\s*[—-]\s*/, '').trim();
      cur = { version, title, date, sections: [] };
      entries.push(cur);
      curSection = null;
      continue;
    }
    if (!cur) continue; // preamble sebelum entri pertama

    if (raw.startsWith('### ')) {
      curSection = { title: raw.slice(4).trim(), bullets: [] };
      cur.sections.push(curSection);
      continue;
    }

    const bullet = /^[-*] (.*)$/.exec(raw);
    if (bullet) {
      if (!curSection) {
        curSection = { title: '', bullets: [] };
        cur.sections.push(curSection);
      }
      curSection.bullets.push(bullet[1].trim());
      continue;
    }

    // Lanjutan butir multi-baris (menjorok, bukan bullet/judul baru)
    if (curSection && /^\s{2,}\S/.test(raw)) {
      curSection.bullets[curSection.bullets.length - 1] += ` ${raw.trim()}`;
      continue;
    }
    // Baris kosong / pemisah diabaikan
  }

  flush();
  return entries.filter((e) => e.sections.length > 0 || e.title || e.date);
}

/** Baca CHANGELOG.md dari repo saat build (konteks Node). */
export function getChangelog(): ChangelogEntry[] {
  try {
    const md = readFileSync(join(process.cwd(), 'CHANGELOG.md'), 'utf8');
    return parseChangelog(md);
  } catch {
    // Ekspor statis tanpa berkas (edge case) -> halaman kosong yang rapi.
    return [];
  }
}
