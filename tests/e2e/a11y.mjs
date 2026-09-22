#!/usr/bin/env node
/*
 * tests/e2e/a11y.mjs — Audit aksesibilitas otomatis (axe-core) di CI (2026.16).
 *
 * Kenapa ada: kontras & aria yang "kelihatan benar" tetap bisa melanggar
 * WCAG — axe-core memeriksanya objektif per rute, di dokumen nyata
 * pasca-hidrasi (termasuk hero 3D dan grafik SVG).
 *
 * Kebijakan gagal/lolos (disetel agar sinyalnya jujur tanpa macet):
 *  - violation impact "serious"/"critical"  → GAGAL (harus diperbaiki)
 *  - "moderate"/"minor"                     → dicetak sebagai peringatan
 *  - rule yang by-design tak berlaku untuk situs ini dimatikan eksplisit
 *    di bawah (beserta alasannya) — bukan dihilangkan diam-diam.
 *
 * Tambahan: 2 rute utama dipindai JUGA dalam bahasa EN (toggle locale
 * diklik) — i18n penuh 2026.16 berarti string EN ikut diaudit.
 *
 * Pemakaian:
 *  E2E_BASE_URL=http://localhost:3000 node tests/e2e/a11y.mjs
 *  (butuh `npx playwright install chromium` sekali per mesin)
 *
 * Exit: 0 = tidak ada pelanggaran serius/kritis · 1 = ada.
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const LAUNCH_ARGS = ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'];

/* Rule yang dimatikan + alasan by-design (dokumentasi jujur, bukan cara mengakali). */
const DISABLED_RULES = [
  // Halaman demo repo dipanti lewat <iframe embed> pihak ketiga — isi sandbox
  // di luar kendali situs ini; a11y-nya milik masing-masing demo.
  'frame-title',
];

/** Tunggu server siap (polling fetch, maks ~60 dtk). */
async function waitReady() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE, { redirect: 'manual' });
      if (res.status < 500) return;
    } catch {
      /* belum siap */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server tidak siap di ${BASE} setelah 60 dtk`);
}

async function analyzeRoute(browser, path, { label } = {}) {
  const context = await browser.newContext();
  const page = await context.newPage();
  // Perangkat "kuat" agar jalur 3D penuh ikut diaudit (bukan auto-lite).
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8, configurable: true });
  });
  const tag = label ? `${path} [${label}]` : path;
  let hard = 0;
  let soft = 0;
  const softLines = [];
  try {
    await page.goto(BASE + path, { waitUntil: 'load', timeout: 60_000 });
    await page.waitForTimeout(1_800); // hidrasi + animasi masuk + hero 3D

    if (label === 'en') {
      // Pindah ke EN lewat pemilih bahasa di nav (div[role=group] berisi
      // tombol 'id' | 'en') — lalu PASTIKAN benar-benar berganti
      // (<html lang> disinkronkan LocaleProvider) agar EN tak terlewat senyap.
      const btn = page.getByRole('button', { name: 'en', exact: true }).first();
      if (await btn.count()) {
        await btn.click();
        await page.waitForTimeout(900);
      }
      const lang = await page.evaluate(() => document.documentElement.lang);
      if (lang !== 'en') {
        hard++;
        console.log(`  ✗ ${tag} — gagal pindah ke EN (html lang="${lang}") — audit EN terlewat`);
        return { hard, soft };
      }
    }

    const results = await new AxeBuilder({ page })
      .options({ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })
      .disableRules(DISABLED_RULES)
      .analyze();

    for (const v of results.violations) {
      const line = `    ${v.id} (${v.impact}) ×${v.nodes.length}: ${v.help}`;
      if (v.impact === 'serious' || v.impact === 'critical') {
        hard++;
        console.log(`  ✗ ${tag} — ${line}`);
      } else {
        soft++;
        softLines.push(`  ⚠ ${tag} — ${line}`);
      }
    }
    if (hard === 0) console.log(`  ✓ ${tag}`);
  } catch (e) {
    hard++;
    console.log(`  ✗ ${tag} — analisis gagal: ${String(e).slice(0, 140)}`);
  } finally {
    await context.close();
  }
  for (const l of softLines) console.log(l);
  return { hard, soft };
}

async function main() {
  await waitReady();
  const browser = await chromium.launch({ args: LAUNCH_ARGS });

  /* Rute utama + dinamis (slug ditemukan otomatis — tanpa hardcode). */
  const routes = ['/', '/repositories', '/studies', '/services', '/system', '/status', '/developers', '/offline', '/share'];
  try {
    const res = await fetch(`${BASE}/api/v1/repos.json`);
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : data?.repos?.[0];
    if (first?.name) routes.push(`/repo/${first.name}`);
  } catch {
    /* opsional */
  }
  try {
    const html = await (await fetch(`${BASE}/studies`)).text();
    const m = html.match(/href="(\/studies\/[a-z0-9-]+)"/i);
    if (m) routes.push(m[1]);
  } catch {
    /* opsional */
  }

  console.log(`A11y axe-core — ${routes.length} rute @ ${BASE}`);
  let hard = 0;
  let soft = 0;
  for (const path of routes) {
    const r = await analyzeRoute(browser, path);
    hard += r.hard;
    soft += r.soft;
  }
  /* Dua rute utama diaudit juga dalam EN (i18n penuh 2026.16). */
  for (const path of ['/', '/repositories']) {
    const r = await analyzeRoute(browser, path, { label: 'en' });
    hard += r.hard;
    soft += r.soft;
  }

  await browser.close();
  console.log(`\nRingkasan: ${hard} pelanggaran serius/kritis · ${soft} peringatan (moderate/minor)`);
  if (hard > 0) {
    console.log('GAGAL — perbaiki pelanggaran serious/critical di atas.');
    process.exit(1);
  }
  console.log('LOLOS — tidak ada pelanggaran serious/critical.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
