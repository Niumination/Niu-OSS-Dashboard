<div align="center">

**niumination** — OSS Dashboard
Landing page + dashboard interaktif untuk <a href="https://github.com/niumination">github.com/niumination</a>

`Next.js 16` · `React 19` · `TypeScript` · `React Three Fiber` · `Tailwind` · `Framer Motion` · `cmdk` · `next/og` · `qrcode`

Bahasa: **ID** (default) / **EN** — toggle di navbar · PWA-ready · API publik v1

Produksi: **[niumination.web.id](https://niumination.web.id)** — Vercel · domain .web.id (idwebhost), NS → Vercel DNS · **live 21 Sep 2026**

</div>

---

## Daftar isi

1. [Apa ini?](#-apa-ini)
2. [Status & jejak fase](#-status--jejak-fase)
3. [Fitur](#-fitur)
4. [Struktur direktori](#-struktur-direktori)
5. [Persiapan & jalankan lokal](#-persiapan--jalankan-lokal)
6. [Environment variables](#-environment-variables)
7. [Arsitektur data & alur GitOps](#-arsitektur-data--alur-gitops)
8. [API publik v1](#-api-publik-v1)
9. [i18n (id/en)](#-i18n-iden)
10. [PWA](#-pwa)
11. [Observabilitas](#-observabilitas)
12. [Pengujian](#-pengujian)
13. [CI/CD (GitHub Actions)](#-cicd-github-actions)
14. [Deployment](#-deployment)
15. [Audit & hardening](#-audit--hardening)
16. [Kontribusi / kustomisasi cepat](#-kontribusi--kustomisasi-cepat)
17. [Rencana pengembangan](#-rencana-pengembangan)

---

## ✦ Apa ini?

Satu situs, dua wajah:

1. **Landing page** — hero 3D interaktif (tech-core + network node graph) dengan
   *frame-rate monitor*: perangkat low-end otomatis jatuh ke visual CSS/Canvas ringan (60 fps).
2. **Dashboard** — agregator 90 repositori publik (pencarian real-time, kategori otomatis,
   filter, sortir), metrik aktivitas GitHub (heatmap commit, bahasa, grafik 30 hari),
   pola kontribusi ala OSS Insight, monitor status deployment live, halaman status
   GitOps, studi kasus, command palette `Ctrl+K`, dan sistem monetisasi
   (donasi OSS + booking jasa).

Tema visual mengadaptasi template *ink / cream / ember + spotlight cyan* dengan
aesthetic dark-mode glassmorphism: tipografi **Instrument Serif** (display), **Inter** (UI),
**JetBrains Mono** (micro-label & angka).

## ✦ Status & jejak fase

Setiap fase punya entri [CHANGELOG.md](./CHANGELOG.md) + commit yang bisa diaudit.

| Fase | Cakupan | Commit | Status |
|------|---------|--------|:------:|
| Rilis awal | Landing + dashboard + SEO/OG (91 halaman) | `c7f6dfd` | ✅ |
| Audit & hardening | Header keamanan, timeout, a11y | `a1468a5` | ✅ |
| Lokalisasi & polesan | Bahasa Indonesia penuh, detail repo | `5aa0d6d` | ✅ |
| Fase 1 | Pembayaran Midtrans/Stripe + webhook, feed & RSS, Fuse.js, CI/test/Docker | `81a91b5` | ✅ |
| Fase 2 | Status GitOps (/status), pola kontribusi, studi kasus, observabilitas | `3159eed` | ✅ |
| Fase 3 | i18n id/en, PWA, API publik v1, QR share | `ab0737f` | ✅ |
| Fase 3.1 | i18n dashboard penuh, /developers, deskripsi repo EN | `48727b1` | ✅ |
| Fase 3.2 | Persiapan produksi Vercel + domain web.id, ID penuh, ROADMAP | `36a8847` | ✅ |
| Fix #418 (ISR) | Halaman statis murni, force-cache fetch, TimeAgo aman-hidrasi | `a601112` | ✅ |
| Audit 2026.2–3 | 4 bug laten hidrasi, hardening 3D, keamanan jalur-error, sw.js v2 | `578e2b8`·`e326695` | ✅ |
| Stack 2026 | Next 16.3.5 · React 19.2.8 · TS 7 · Vitest 5 (CVE tertutup) | `513c468` | ✅ |
| Fase 0 | E2E hidrasi di CI, guard #418, budget Lighthouse, dependabot | `2c0b572` | ✅ |
| Fix #418 final | Akar: env non-`NEXT_PUBLIC_` di SITE → mismatch klien/server | `c902d1b` | ✅ |
| Audit 2026.5 | BreadcrumbList, avatar `next/image`, peta penyempurnaan T1–T8 | `c60387f` | ✅ |
| Produksi 2026.6 | **Domain live** + uptime `niumination.web.id` permanen | `628f77a` | ✅ |
| Stack 2026.7 | CSP report-only + `SoftwareSourceCode` + audit bundel | `1ad946c` | ✅ |
| PPR | Partial Prerendering | — | ⏸ ditunda (target deploy statis; ukur p50/p95 dari `/api/vitals` dulu bila pindah ke Vercel) |

## ✦ Fitur

| # | Fitur | Detail |
|---|-------|--------|
| 1 | **Agregator repositori dinamis** | GitHub REST API via `fetch` — diambil saat build (halaman statis per deploy; API live `/api/github/*` tetap ISR `revalidate: 300`). Pencarian fuzzy real-time (Fuse.js), kategori otomatis berbasis language/topik/nama, badge tech stack, stars/forks, sortir, filter fork. |
| 2 | **Hero 3D performance-aware** | `@react-three/fiber` + `drei`. Deteksi device saat mount + FPS monitor in-scene (<45 fps 2 dtk pasca warm-up → **auto-degrade** ke SceneLite: CSS glow orbs + canvas 2D). |
| 3 | **Command Palette (Ctrl+K)** | `cmdk`: cari repo, lompat antar seksi, buka tautan sosial, salin email, picu modal pembayaran — full keyboard. |
| 4 | **Master dashboard** (`/system`) | 6 stat cards, commit heatmap 26 minggu, distribusi bahasa, grafik aktivitas 30 hari, **pola kontribusi 12 bulan** (GraphQL/fallback), donat kategori, feed event, StatusMonitor live. |
| 5 | **Status publik GitOps** (`/status`) | Riwayat uptime 30 hari ala Upptime — diperiksa tiap 15 menit oleh Actions, di-commit ke repo (auditabel), tanpa server monitoring. |
| 6 | **Studi kasus** (`/studies`) | 4 proyek unggulan: masalah → pendekatan → hasil + metrik; bilingual (id/en) via `data/studies.json`. |
| 7 | **Monetisasi** | Modal 2 tab: *Dukung OSS* (Midtrans SNAP QRIS/VA, Stripe, Sponsors, BMAC) dan *Sewa Jasa* (3 paket, deposit 50%, mailto + WhatsApp checkout). Kunci rahasia hanya di server; webhook SHA-512. |
| 8 | **i18n id/en** | Toggle **ID \| EN** di navbar (localStorage). Kerangka situs, beranda, dashboard internal, status, studi kasus, command palette — semua bilingual. |
| 9 | **PWA** | Manifest + service worker (network-first navigasi, stale-while-revalidate aset) + halaman `/offline`. |
| 10 | **API publik v1** | 101 file JSON statis ala GitOps (`public/api/v1/`), CORS terbuka — lihat [/developers](#-api-publik-v1). |
| 11 | **QR share** | QR SVG di detail repo & studi kasus + unduh SVG (tanpa JS tambahan). |
| 12 | **SEO & OG image** | Metadata + JSON-LD Person/WebSite, `sitemap.ts`, `robots.ts`, dynamic OG satori (home + per repo). |

## ✦ Struktur direktori

```
niumination/
├── app/
│   ├── layout.tsx                  # Fonts, metadata, JSON-LD, LocaleProvider, SW register, WebVitals
│   ├── page.tsx                    # Beranda — hero3D + featured + studi kasus + rilisan + jasa + aktivitas
│   ├── repositories/page.tsx       # Agregator semua repo (RepoGrid)
│   ├── services/page.tsx           # Jasa & komisi (3 paket + proses + metode bayar)
│   ├── system/page.tsx             # Sistem & metrik (DashboardMetrics + InsightsPanel + StatusMonitor)
│   ├── status/page.tsx             # Halaman status publik (GitOps ala Upptime)
│   ├── studies/                    # Studi kasus — index + [slug] (bilingual)
│   ├── developers/page.tsx         # Dokumentasi API publik v1
│   ├── repo/[slug]/                # Detail repo: stats, README, QR, related (+opengraph-image)
│   ├── offline/page.tsx            # Fallback PWA offline
│   ├── manifest.ts                 # PWA manifest (force-static)
│   ├── api/
│   │   ├── github/*                # Proxy GitHub (user/repos/summary)
│   │   ├── og/[...slug]/           # Dynamic OG image (satori)
│   │   ├── pay/*                   # Midtrans Snap + Stripe + webhook + config
│   │   ├── v1/[...resource]/       # Mirror server API publik v1
│   │   └── vitals/                 # Penerima laporan Core Web Vitals
│   ├── feed.xml/route.ts           # RSS 2.0
│   └── sitemap.ts · robots.ts · error.tsx · not-found.tsx · loadings
├── components/
│   ├── AppShell.tsx · ui-context.ts          # Shell + useUi()
│   ├── LocaleProvider.tsx · T.tsx            # i18n context + <T k> (server pattern)
│   ├── NavBar.tsx (toggle ID|EN) · Footer.tsx · SectionHead.tsx
│   ├── Hero3D.tsx · hero/Scene3D · hero/SceneLite
│   ├── RepoGrid.tsx · RepoCard.tsx · RepoDescription.tsx · CloneBox.tsx · Readme.tsx
│   ├── DashboardMetrics.tsx · StatusMonitor.tsx · InsightsPanel.tsx · CategoryDonut.tsx
│   ├── studies-ui.tsx             # Teaser + grid + detail studi (sadar-locale)
│   ├── CommandMenu.tsx · PaymentModal.tsx · ServicesCtas.tsx
│   ├── QrCard.tsx · WebVitals.tsx · ServiceWorkerRegister.tsx
│   └── Skeletons · ErrorBoundary
├── lib/
│   ├── i18n.ts                    # Kamus id/en (SINGLE SOURCE — paritas ditegakkan test)
│   ├── repo-i18n.ts               # Overlay deskripsi repo EN
│   ├── case-studies.ts            # Akses data/studies.json (+ localizedStudy)
│   ├── github.ts · summary.ts · categories.ts · insights.ts
│   ├── uptime.ts · uptime-data.ts # Helper + data (AUTO-GENERATED — jangan edit manual)
│   ├── site.config.ts             # ⚙️ Identitas, link, harga, repo unggulan
│   ├── env.ts · types.ts · utils.ts · mock-data.ts (generated)
├── data/                           # Snapshot GitOps (di-commit)
│   ├── repos.json · events.json · user.json     # Snapshot GitHub (mingguan)
│   ├── uptime.json                              # Riwayat uptime (tiap 15 menit)
│   ├── studies.json                             # Konten studi kasus (id + en)
│   └── repo-descriptions.en.json                # Overlay deskripsi EN
├── public/
│   ├── api/v1/                    # API publik (AUTO-GENERATED oleh gen-api.mjs)
│   ├── sw.js · icons/             # Service worker + ikon PWA
├── scripts/
│   ├── gen-mock.mjs               # Snapshot fallback (--fresh = paksa API)
│   ├── gen-api.mjs                # API publik v1 → public/api/v1/
│   ├── gen-icons.mjs              # apple-icon + ikon PWA (PNG manual, tanpa deps)
│   ├── uptime-check.mjs           # Pemeriksa uptime (dipanggil uptime.yml)
│   └── export-static.mjs          # Build output:'export' untuk GitHub Pages
├── tests/                         # 41 unit test (vitest)
├── .github/workflows/             # ci · refresh-data · uptime · lighthouse
├── CHANGELOG.md                   # Kronologi per fase + commit
├── lighthouserc.json · Dockerfile · .env.example
└── next.config.ts · tailwind.config.ts · tsconfig.json
```

> File bertanda **(generated)** jangan diedit manual — jalankan ulang scriptnya.

## ✦ Persiapan & jalankan lokal

```bash
git clone git@github.com:Niumination/Niu-OSS-Dashboard.git
cd Niu-OSS-Dashboard

npm install
cp .env.example .env.local   # isi sesuai kebutuhan (lihat bagian Environment)

npm run dev                  # http://localhost:3000
```

| Skrip | Fungsi |
|-------|--------|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Build produksi + serve (mode server penuh) |
| `npm run export:static` | Build statis → `out/` (GitHub Pages) |
| `npm test` / `test:watch` | Vitest (41 test) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run gen:mock` / `gen:mock:fresh` | Regenerasi snapshot fallback |
| `npm run gen:api` | Regenerasi API publik v1 |
| `npm run gen:icons` | Regenerasi semua ikon PNG |

> Tanpa `GITHUB_TOKEN` pun situs berfungsi (limit 60 req/jam per IP).
> Saat limit habis → **fallback snapshot otomatis** + banner peringatan;
> halaman tidak pernah blank.

## ✦ Environment variables

| Var | Wajib | Fungsi |
|-----|:---:|--------|
| `SITE_URL` | ✓ | URL publik — metadataBase, sitemap, OG image, QR. Produksi: `https://niumination.web.id`. |
| `GITHUB_OWNER` | – | Default `Niumination`. |
| `GITHUB_TOKEN` | – | Token GitHub; limit 60 → **5000 req/jam**; mengaktifkan feed rilis GraphQL + kalender kontribusi 12 bulan. |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | – | Client key Midtrans SNAP (public) → tombol checkout Midtrans aktif. |
| `MIDTRANS_SERVER_KEY` | – | **Rahasia** — Snap API + verifikasi webhook SHA-512. |
| `STRIPE_SECRET_KEY` | – | **Rahasia** — Checkout Session (IDR zero-decimal). |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | – | Stripe hosted link (alternatif tanpa server). |
| `NEXT_PUBLIC_CONTACT_EMAIL` | – | Tujuan form booking jasa — **wajib prefix `NEXT_PUBLIC_`** (dibaca komponen klien; string kosong → fallback default). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | – | Nomor WA `62…` untuk tombol chat — **wajib prefix `NEXT_PUBLIC_`**. |
| `SENTRY_DSN` | – | Opsional — catatan Sentry untuk error tracking. |

⚠️ **Pitfall #418 (20 Sep 2026):** env kontak tanpa prefix `NEXT_PUBLIC_`
di-inline sebagai `undefined` di bundel klien — server (mis.
`CONTACT_EMAIL=""` di Vercel) merender nilai kosong sementara klien memakai
fallback → hydration mismatch React #418 → seluruh halaman diregenerasi
klien. Pola aman: `NEXT_PUBLIC_*` + `?.trim() || fallback` (lihat
`lib/site.config.ts`). Var lama `CONTACT_EMAIL`/`WHATSAPP_NUMBER` sudah
**tidak dibaca** kode — hapus dari Vercel bila masih ada.

## ✦ Arsitektur data & alur GitOps

```
                    ┌─ build time (render halaman) ──┐
GitHub API ──fetch──▶ lib/github.ts (force-cache)    │
   │                 │  403/429/error → FALLBACK     │
   │                 └──▶ halaman statis per deploy  │
   │                 ┌─ runtime (route API live) ────┐
   │                 └──▶ /api/github/* (ISR 300)    │
   │
   │  ┌─ build time / terjadwal (GitOps) ───────────────────────┐
   ├──▶ scripts/gen-mock.mjs      → data/*.json + lib/mock-data.ts (mingguan, refresh-data.yml)
   ├──▶ scripts/uptime-check.mjs  → data/uptime.json + lib/uptime-data.ts (15 mnt, uptime.yml)
   ├──▶ scripts/gen-api.mjs       → public/api/v1/*.json (101 file; ikut refresh & export)
   └──▶ scripts/export-static.mjs → out/ (semua halaman + OG + API dibekukan)
```

- **Fallback = snapshot nyata** (bukan dummy) — situs tetap utuh saat rate-limit.
- Setiap artefak generated membawa stempel waktu → usia data selalu bisa diaudit.
- `data/` dan `public/api/v1/` **di-commit** — inilah yang membuat semuanya
  traceable: `git log data/uptime.json` = riwayat insiden, `git log public/api/v1/`
  = riwayat data API.

## ✦ API publik v1

> Dokumentasi interaktif: **`/developers`** di situs. Discovery: `/api/v1/index.json`.

Seluruh data situs tersedia sebagai JSON read-only — gratis, tanpa kunci, CORS terbuka
(`Access-Control-Allow-Origin: *`):

| Endpoint | Isi |
|----------|-----|
| `/api/v1/index.json` | Dokumen discovery (daftar endpoint) |
| `/api/v1/user.json` | Profil GitHub publik |
| `/api/v1/repos.json` | Semua repo (urut push terbaru) + `descriptionEn` |
| `/api/v1/repos/{name}.json` | Detail satu repo |
| `/api/v1/events.json` | 100 event publik terakhir |
| `/api/v1/summary.json` | Agregat + bahasa/topik teratas |
| `/api/v1/uptime.json` | Uptime per situs (7 & 30 hari) |
| `/api/v1/studies.json` · `/studies/{slug}.json` | Studi kasus (id + en) |

- **Statis ala GitOps**: `npm run gen:api` menulis file dari `data/*.json`;
  diperbarui mingguan (refresh-data), endpoint uptime tiap 15 menit, dan setiap
  `export:static`.
- **Server mode**: route `app/api/v1/[...resource]` menyajikan file yang sama
  (fallback 503 informatif bila belum digenerate).
- Contoh:

```bash
curl https://niumination.web.id/api/v1/summary.json
```

## ✦ i18n (id/en)

- Kamus tunggal: `lib/i18n.ts` — `id` sumber, `en` lengkap.
  **Paritas kunci ditegakkan otomatis** `tests/i18n.test.ts` (tidak mungkin bolong).
- Pola pemakaian:
  - Komponen server → `<T k="nav.home" vars={{ n: 3 }} />`
  - Komponen client → `const { t, locale, setLocale } = useLocale()`
- Preferensi bahasa: localStorage `niu-locale`; `<html lang>` ikut berubah.
  SSR selalu bahasa default (`id`) — aman dari hydration mismatch.
- Konten bilingual per-data:
  - Studi kasus: field `en` di `data/studies.json`.
  - Deskripsi repo: overlay `data/repo-descriptions.en.json`
    (repo ber-deskripsi Indonesia) → `lib/repo-i18n.ts` + field `descriptionEn` di API.
- **Cakupan saat ini**: seluruh UI kecuali `PaymentModal` (alur pembayaran lokal:
  QRIS/VA/denominasi IDR; klien internasional dilayani Stripe link berbahasa Inggris).

## ✦ PWA

- `app/manifest.ts` → `/manifest.webmanifest` (force-static, valid di export).
- `public/sw.js`: precache shell (`/`, `/offline`, manifest, ikon) — navigasi
  *network-first* dengan fallback `/offline`, aset *stale-while-revalidate*.
- Ikon 192/512/maskable digenerate tanpa dependensi: `npm run gen:icons`.
- Registrasi hanya di production (`ServiceWorkerRegister`).
- Catatan Pages: situs dilayani dari root → scope `/` valid.

## ✦ Observabilitas

- **Core Web Vitals**: `<WebVitals/>` melaporkan LCP/INP/CLS/TTFB/FCP ke
  `POST /api/vitals` (log Functions / `npm start` log — contoh nyata terlihat
  di log server preview).
- **Uptime**: cron 15 menit (`uptime.yml`) — `niumination.web.id` selalu
  baris pertama yang dipantau (sejak 2026.6) + 9 situs repo turunan;
  riwayat 30 hari dipublikasikan di `/status`.
- **CSP (fase report-only)**: header `Content-Security-Policy-Report-Only`
  + `POST /api/csp-report` → pelanggaran terekam di log Vercel. Prosedur
  menuju enforcement: `docs/PANDUAN-OPS.md` §C.
- **Lighthouse CI** mingguan: `lighthouse.yml` + `lighthouserc.json`
  (perf ≥ 0.8, a11y ≥ 0.95, best-practices/SEO ≥ 0.9, LCP < 3,8 s —
  warn < 2,5 s, CLS < 0.05).
- **Sentry** opsional via `SENTRY_DSN`.

## ✦ Pengujian

```bash
npm test           # 52 unit test, < 2 dtk

# E2E hidrasi (Playwright) — 10 rute + degrade WebGL + pintasan keyboard:
E2E_BASE_URL=https://niumination.web.id node tests/e2e/hydration.mjs
```

| Berkas | Cakupan |
|--------|---------|
| `tests/i18n.test.ts` | Paritas kamus id↔en, interpolasi `{var}`, fallback, overlay studi & deskripsi repo EN |
| `tests/categories.test.ts` | Kategorisasi otomatis repo |
| `tests/utils.test.ts` | `langColor`, `timeAgo`, `formatNumber`, dll |
| `tests/summary.test.ts` + `tests/uptime.test.ts` | Ringkasan snapshot, uptime helpers |
| `tests/e2e/hydration.mjs` | E2E hidrasi 10 rute + WebGL + pintasan (dipakai CI & verifikasi live) |

## ✦ CI/CD (GitHub Actions)

| Workflow | Jadwal | Tugas |
|----------|--------|-------|
| `ci.yml` | push/PR | job 1: vitest → typecheck → build → guard route-table (#418); job 2: **E2E hidrasi Playwright** (build → Chromium → `next start` → skrip E2E) |
| `refresh-data.yml` | Senin 03:00 UTC | `gen:mock --fresh` + `gen:api` → commit snapshot & API |
| `uptime.yml` | tiap 15 menit | `uptime-check.mjs` + segarkan API uptime → commit |
| `lighthouse.yml` | Senin 05:00 UTC | Audit build statis dengan budget di `lighthouserc.json` |

## ✦ Deployment

### A. Vercel (utama — domain niumination.web.id) — ✅ LIVE 21 Sep 2026

Status: **sudah berjalan produksi**. Project Vercel `niu-oss` terhubung ke
repo GitHub `Niumination/Niu-OSS-Dashboard` (auto-deploy tiap push `main`).

1. Environment produksi: `SITE_URL=https://niumination.web.id`, kunci
   Midtrans/Stripe sesuai kebutuhan. `GITHUB_TOKEN` disarankan agar data
   segar per deploy — panduan langkah-demi-langkah: **`docs/PANDUAN-OPS.md` §A**.
2. DNS: domain dibeli di **idwebhost**, nameserver dialihkan ke **Vercel DNS**
   (`ns1/ns2.vercel-dns.com`, diverifikasi 2 resolver 21 Sep 2026) — zona DNS
   dikelola penuh dari dashboard Vercel (A apex `216.198.79.1` +
   `64.29.17.1`, dikelola otomatis Vercel). Domain Verified; HTTP→HTTPS 308
   otomatis + HSTS. Varian `www`: record ada tapi sertifikat belum mencakup —
   aktifkan via dashboard (PANDUAN-OPS §B). *Catatan koreksi: catatan lama
   yang menyebut "DNS via Cloudflare" keliru — tidak ada Cloudflare di
   arsitektur ini.*
3. Verifikasi pasca-deploy (ritual):
   ```bash
   E2E_BASE_URL=https://niumination.web.id node tests/e2e/hydration.mjs
   # ekspektasi 12/12 ✓ — lalu cek /sitemap.xml, /robots.txt, /status, /api/v1/index.json
   ```

Keuntungan: halaman statis murni per deploy (data GitHub diambil saat build —
satu dokumen HTML+flight atomik, hidrasi konsisten), dynamic OG di Node runtime,
`/api/pay/*` + `/api/v1/*` live (route mem-bundle JSON saat build — aman di
lambda), `/api/vitals` aktif.

Syarat runtime: **Node.js ≥ 20.9** (Next 16; default Vercel = Node 22 ✓).
Build Vercel memakai **Turbopack** (default Next 16). Untuk lingkungan RAM
kecil tersedia jalur webpack: `npm run build:webpack`.

```bash
npm i -g vercel && vercel && vercel prod   # alternatif CLI
```

### B. GitHub Pages (tanpa server)

```bash
npm run export:static    # hasil di out/
```

Script: regenerasi snapshot → `gen:api` → tulis config `output:'export'` →
pindahkan `app/api` → `next build --webpack` (hemat memori) → **memulihkan
semua file**. Semua halaman + OG image + API JSON dibekukan saat build.

Contoh workflow deploy (`.github/workflows/pages.yml`):

```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run export:static
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/upload-pages-artifact@v3
        with: { path: out }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Catatan mode static:
- Data dibekukan saat build; update = push + redeploy (atau lewat cron uptime/refresh yang men-commit data baru).
- `SITE_URL` = URL host statis yang dipakai (mis. `https://niumination.github.io`
  bila memakai Pages); bila **project pages** (subpath), tambahkan
  `basePath: '/niumination'` pada varian config di `scripts/export-static.mjs`.

### C. Self-host (Docker / VPS)

```bash
npm run build && npm start   # atau: docker build -t niumination . && docker run -p 3000:3000 niumination
```

`Dockerfile` multi-stage sudah tersedia di repo.

## ✦ Push ke `Niumination/Niu-OSS-Dashboard`

Repo sudah ada dan riwayatnya terjaga (11 commit). Untuk mengirim perubahan:

```bash
# di folder Niu-OSS-Dashboard/
git add <berkas>
git commit -m "<tipe>: <ringkasan>"
git push origin main
```

## ✦ Audit & hardening

- **Keamanan** — `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
  `Cross-Origin-Opener-Policy`, `X-Powered-By` dinonaktifkan; kunci rahasia hanya
  di server (`MIDTRANS_SERVER_KEY`, `STRIPE_SECRET_KEY`); verifikasi webhook SHA-512.
  (`X-Frame-Options` sengaja tidak diset agar situs bisa di-embed.)
- **Robustness** — timeout 10 dtk per request GitHub (AbortController); error
  jaringan = fallback snapshot; semua timer dibersihkan saat unmount; WebVitals
  & SW register gagal-senyap.
- **Performa** — `useDeferredValue` pada pencarian; Scene3D `dpr` ≤ 1.5;
  animasi dinonaktifkan saat `prefers-reduced-motion`; SVG/chart tanpa pustaka chart.
- **Aksesibilitas** — skip-link bilingual, `:focus-visible`, dialog dengan
  pengelolaan fokus, `aria-live` hasil pencarian, `aria-pressed` pada filter.
- **SEO** — JSON-LD Person + WebSite (SearchAction), canonical per halaman,
  sitemap lengkap (termasuk `/studies/*`, `/status`, `/developers`), RSS.

## ✦ Kontribusi / kustomisasi cepat

- **Ganti warna tema** → `tailwind.config.ts` (blok `colors`) + `app/globals.css`.
- **Ubah harga paket / repo unggulan / link sosial** → `lib/site.config.ts`.
- **Tambah kategori** → `CATEGORIES` di `lib/categories.ts` (+ heuristik `categorize`).
- **Tambah terjemahan** → tambah kunci di `lib/i18n.ts` (**id dan en** — test
  paritas akan menolak bila bolong), lalu pakai `<T k>` / `t()`.
- **Tambah studi kasus** → tambah objek di `data/studies.json` (field `en`
  opsional), halaman & API mengikuti otomatis.
- **Tambah repo ke monitor uptime** → otomatis (repo original + homepage,
  10 terbaru by push).
- **Tambah endpoint API** → `scripts/gen-api.mjs` + (opsional) whitelist di
  `app/api/v1/[...resource]/route.ts`, lalu `npm run gen:api`.

---

Riwayat lengkap per fase: **[CHANGELOG.md](./CHANGELOG.md)** · Rencana lanjutan:
**[docs/ROADMAP.md](./docs/ROADMAP.md)**.

## ✦ Rencana pengembangan

Ringkasan — versi lengkap (tujuan, lingkup, kriteria terima, estimasi, risiko)
ada di **[docs/ROADMAP.md](./docs/ROADMAP.md)** (disusun ulang 2026-09-20
menjadi fase 0–5 + riwayat fase lama). Antrian penyempurnaan terkini hasil
riset (prioritas T1–T8: CSP, GITHUB_TOKEN, React 19.3+View Transitions,
Tailwind 4, observabilitas) ada di **[docs/AUDIT-2026.5.md](./docs/AUDIT-2026.5.md)**,
dan tugas ops di sisi pemilik (token, domain www, CSP enforce, Analytics)
dipandu langkah-demi-langkah di **[docs/PANDUAN-OPS.md](./docs/PANDUAN-OPS.md)**.

| Fase | Fokus | Estimasi |
|------|-------|----------|
| 0 — Rumah tangga | E2E hidrasi di CI, guard #418, budget Lighthouse ketat | paralel |
| 1 — Konten & narasi | Studi kasus kaya, /now, /changelog, galeri demo | 1–2 bulan |
| 2 — Pengalaman & a11y | Audit WCAG 2.2 AA, onboarding, PWA offline penuh | 1 bulan |
| 3 — Data & API | Dokumentasi API v1, dataset historis, feed per repo | 2 bulan |
| 4 — Observabilitas | Dasbor vitals, SLA data, canary pasca-deploy | paralel |
| 5 — Komunitas | Reaksi, kontributor tamu, peta ekosistem | setelah trafik |
