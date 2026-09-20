#!/usr/bin/env node
/*
 * tests/e2e/hydration.mjs — E2E hidrasi & jalur 3D adaptif (Playwright).
 *
 * Kenapa ada: hydration mismatch React #418 hanya muncul di dokumen nyata
 * (SSR vs klien) — unit test tidak bisa menangkapnya. Skrip ini membuka
 * tiap rute di Chromium headless (SwiftShader untuk WebGL) dan memastikan
 * 0 error halaman + 0 error konsol (kecuali kegagalan jaringan eksternal
 * yang memang data status, mis. ping demo live di /system).
 *
 * Skenario:
 *  1. Hidrasi semua rute utama + rute dinamis (slug ditemukan otomatis
 *     dari API statis & HTML — tanpa hardcode).
 *  2. WebGL gagal total → hero harus degrade ke mode lite (bukan crash).
 *  3. Pintasan "/" memfokuskan pencarian di /repositories; Esc mengosongkan.
 *
 * Pemakaian:
 *  E2E_BASE_URL=http://localhost:3000 node tests/e2e/hydration.mjs
 *  (butuh `npx playwright install chromium` sekali per mesin)
 *
 * Exit: 0 = semua lolos · 1 = ada kegagalan (dengan rincian).
 */
import { chromium } from 'playwright';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const LAUNCH_ARGS = ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'];

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

/** Kumpulkan error halaman/konsol sebuah tab. */
function attachErrorCollectors(page, errs) {
  page.on('pageerror', (e) => errs.push(`pageerror: ${String(e).slice(0, 140)}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    // Kegagalan resource eksternal (ping demo live di /system) = data status,
    // bukan bug halaman — dilewati.
    if (text.includes('Failed to load resource')) return;
    errs.push(`console: ${text.slice(0, 140)}`);
  });
}

async function main() {
  await waitReady();
  const browser = await chromium.launch({ args: LAUNCH_ARGS });

  let failures = 0;

  /* ---------- 1. Temukan rute dinamis tanpa hardcode ---------- */
  const routes = ['/', '/repositories', '/developers', '/status', '/studies', '/services', '/system', '/offline'];
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

  /* ---------- 2. Hidrasi semua rute ---------- */
  console.log(`E2E hidrasi — ${routes.length} rute @ ${BASE}`);
  for (const path of routes) {
    const page = await browser.newPage();
    // Perangkat "kuat" agar jalur 3D penuh diuji (bukan auto-lite).
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8, configurable: true });
    });
    const errs = [];
    attachErrorCollectors(page, errs);
    try {
      await page.goto(BASE + path, { waitUntil: 'load', timeout: 60_000 });
      await page.waitForTimeout(2_500);
    } catch (e) {
      errs.push(`navigasi gagal: ${String(e).slice(0, 120)}`);
    }
    if (errs.length > 0) {
      failures++;
      console.log(`  ✗ ${path} — ${errs.length} error`);
      for (const e of errs.slice(0, 3)) console.log(`      ${e}`);
    } else {
      console.log(`  ✓ ${path}`);
    }
    await page.close();
  }

  /* ---------- 3. WebGL gagal → degrade lite ---------- */
  {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8, configurable: true });
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
          throw new Error('simulasi: WebGL tidak tersedia');
        }
        return orig.call(this, type, ...rest);
      };
    });
    const errs = [];
    attachErrorCollectors(page, errs);
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 60_000 });
    await page.waitForTimeout(5_000);
    const badge = (await page.textContent('[class*="right-4"].rounded-full').catch(() => '')) ?? '';
    const lite = /lite/i.test(badge);
    if (lite && errs.length === 0) {
      console.log('  ✓ WebGL gagal → hero degrade ke lite, halaman selamat');
    } else {
      failures++;
      console.log(`  ✗ WebGL gagal → badge "${badge.trim()}" (lite: ${lite}), error: ${errs.length}`);
      for (const e of errs.slice(0, 3)) console.log(`      ${e}`);
    }
    await page.close();
  }

  /* ---------- 4. Pintasan "/" di /repositories ---------- */
  {
    const page = await browser.newPage();
    await page.goto(BASE + '/repositories', { waitUntil: 'load', timeout: 60_000 });
    await page.waitForTimeout(1_200);
    await page.keyboard.press('/');
    const focusedIsSearch = await page.evaluate(() => {
      const el = document.activeElement;
      return el instanceof HTMLInputElement && el.type === 'search';
    });
    await page.keyboard.type('pemdi');
    await page.waitForTimeout(400);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const cleared = await page.evaluate(() => {
      const el = document.activeElement;
      return el instanceof HTMLInputElement ? el.value === '' : null;
    });
    if (focusedIsSearch && cleared === true) {
      console.log('  ✓ pintasan "/" fokus pencarian; Esc mengosongkan');
    } else {
      failures++;
      console.log(`  ✗ pintasan "/" (fokus input search: ${focusedIsSearch}, esc-clear: ${cleared})`);
    }
    await page.close();
  }

  await browser.close();

  if (failures > 0) {
    console.error(`\n✗ E2E GAGAL: ${failures} skenario bermasalah.`);
    process.exit(1);
  }
  console.log('\n✓ E2E hidrasi lolos penuh.');
}

main().catch((e) => {
  console.error(`✗ E2E error fatal: ${e}`);
  process.exit(1);
});
