#!/usr/bin/env node
/*
 * check-static.mjs — guard arsitektur #418 (jalankan setelah `next build`).
 *
 * Aturan: SEMUA rute halaman (bukan /api/*) harus statis murni —
 * `initialRevalidateSeconds === false` di .next/prerender-manifest.json.
 * Rute halaman dengan angka revalidate = ISR = risiko dokumen campur
 * generasi di Vercel (React #418) → CI GAGAL dengan daftar pelanggar.
 *
 * Route API `/api/github/*` justru HARUS ISR (live, 300 dtk) — dicetak
 * sebagai info (bukan kegagalan) agar perubahan tak sengaja terlihat.
 *
 * Pemakaian: node scripts/check-static.mjs  (exit 0 = lolos, 1 = gagal)
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const manifestPath = resolve(process.cwd(), '.next/prerender-manifest.json');
let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch {
  console.error(`✗ guard #418: tidak bisa membaca ${manifestPath}`);
  console.error('  Jalankan `next build` terlebih dulu.');
  process.exit(1);
}

/** Rute halaman = bukan API, bukan aset metadata. */
const isPage = (route) =>
  !route.startsWith('/api/') &&
  !/\.(xml|txt|json|png|svg|ico|webmanifest)$/.test(route) &&
  route !== '/_not-found';

const offenders = [];
const sections = [
  ['routes', manifest.routes ?? {}],
  ['dynamicRoutes', manifest.dynamicRoutes ?? {}],
];

for (const [name, table] of sections) {
  for (const [route, info] of Object.entries(table)) {
    if (!isPage(route)) continue;
    const revalidate = info?.initialRevalidateSeconds;
    // false = statis eksplisit; undefined = tanpa timer regenerasi
    // (dynamicRoutes ber-fallback blocking — sekali render per dokumen).
    // Angka = ISR terjadwal = risiko #418 → gagal.
    if (typeof revalidate === 'number') {
      offenders.push(`  ${name}  ${route}  → initialRevalidateSeconds = ${revalidate}`);
    }
  }
}

// Info (bukan kegagalan): kesehatan ISR route API live.
const apiRoutes = Object.entries(manifest.routes ?? {})
  .filter(([r]) => r.startsWith('/api/github/'))
  .map(([r, info]) => `  ${r} → ${info?.initialRevalidateSeconds ?? '?'} dtk`);

console.log('Guard #418 — halaman wajib statis murni (per-deploy):');
console.log(`  rute diperiksa: ${Object.keys(manifest.routes ?? {}).length + Object.keys(manifest.dynamicRoutes ?? {}).length}`);
if (apiRoutes.length) {
  console.log('Route API live (ISR, diharapkan):');
  console.log(apiRoutes.join('\n'));
}

if (offenders.length > 0) {
  console.error('\n✗ GAGAL — rute HALAMAN berikut punya revalidate (ISR):');
  console.error(offenders.join('\n'));
  console.error('\nPelajaran #418: revalidate (halaman ATAU fetch) membuat Vercel');
  console.error('meregenerasi halaman → dokumen cache bisa campur generasi → hydration');
  console.error('mismatch. Lihat AGENTS.md "Pitfall ISR + hydration".');
  process.exit(1);
}

console.log('✓ Lolos: semua halaman statis murni (tanpa ISR).');
