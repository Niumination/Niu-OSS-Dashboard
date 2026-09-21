# Changelog
 
Semua perubahan penting proyek ini didokumentasikan di sini — satu entri
per fase pengerjaan, lengkap dengan commit yang bisa dilacak.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1/);
proyek ini tidak memakai versioning semver ketat (satu repo, satu situs).
 
## [Stack 2026.7] — T2 CSP report-only + T6 schema repo + T4 audit bundel — 2026-09-21

### Keamanan (T2 fase 1)
- **`Content-Security-Policy-Report-Only`** di `next.config.ts` (catch-all):
  `default-src 'self'`, script/style dengan inline (flight Next + Snap.js
  Midtrans di-allowlist), `object-src 'none'`, `base-uri`/`form-action`
  `'self'`, `frame-ancestors *` (kebijakan embed dipertahankan).
  Halaman statik murni → nonce per-request tak memungkinkan; jalur
  bertahap report-only → enforcement (panduan: docs/PANDUAN-OPS.md §C).
- **`app/api/csp-report/route.ts`** (baru): titik kumpul laporan browser
  (format lama `csp-report` + baru `Report-To`) → log Functions Vercel,
  field dipotong anti-banjir. Teruji: POST → 204 + log `[csp] …`.

### SEO (T6)
- **`SoftwareSourceCode` JSON-LD** di `/repo/[slug]` (bahasa, lisensi
  SPDX, statistik star/fork via InteractionCounter, dateModified).
  Halaman repo kini membawa Person + WebSite + BreadcrumbList +
  SoftwareSourceCode.

### Audit bundel (T4 — angka dasar untuk pemantauan)
- Initial JS `/` = **915 KB** (13 chunk, pra-gzip); framework react +
  react-dom 386 KB; framer-motion+cmdk 248 KB (kandidat pangkas via T3);
  **three.js 882 KB terkonfirmasi lazy** (tidak dimuat di initial `/`).
  DOMPurify 73 KB hanya di rute repo; `qrcode` server-side.

### Dokumentasi
- **docs/PANDUAN-OPS.md** (baru): panduan langkah-demi-langkah bagian
  pemilik — T1 GITHUB_TOKEN, varian www, prosedur CSP → enforce,
  Analytics, ritual verifikasi deploy, status antrian audit.

### Verifikasi
tsc 0 · vitest 52/52 · build 206 statis · guard ✓ · E2E hidrasi 12/12 ·
header CSP terkonfirmasi di `next start` · schema valid JSON-LD.

## [Produksi 2026.6] — Domain live + observabilitas uptime — 2026-09-21

### Konteks
`niumination.web.id` di-pointing ke Vercel (apex, HTTP→HTTPS 308 otomatis,
canonical/sitemap/robots sudah memakai domain produksi). E2E hidrasi di
domain produksi: **12/12 ✓** (10 rute + degrade WebGL + pintasan).

### Observabilitas
- **`scripts/uptime-check.mjs`**: `niumination.web.id` kini situs pertama
  yang dipantau permanen (cron tiap 15 menit); situs turunan repo dikurangi
  jadi 9 agar total tetap 10. Melengkapi item BACKLOG Fase 4.

### Catatan ops pasca-pointing
- `www.niumination.web.id` belum diatur (tidak ter-resolve) — opsional:
  tambahkan CNAME `www` → `cname.vercel-dns.com` bila ingin varian www
  (Vercel akan redirect ke apex).
- Data build masih jalur `fallback-cache` — snapshot mingguan (cron 21 Sep
  08:25 WIB) membuat data tetap segar; `GITHUB_TOKEN` (AUDIT-2026.5 §T1)
  tetap disarankan agar data segar per-deploy tanpa menunggu cron.

## [Stack 2026.5] — Audit kualitas 2026 + SEO & polish — 2026-09-21

### Konteks
Pasca-fix #418 (terverifikasi E2E live 12/12 di vercel.app). Audit internal
× referensi praktik produksi Next.js 2026 — hasil lengkap + antrian
penyempurnaan berikutnya di `docs/AUDIT-2026.5.md`.

### SEO
- **`BreadcrumbList` JSON-LD** di `/repo/[slug]` dan `/studies/[slug]`
  (hierarki Beranda → daftar → detail) — memperkaya rich result Google.
- **Avatar NavBar → `next/image`**: satu-satunya `<img>` manual tersisa
  kini ikut optimasi otomatis (AVIF/WebP, dimensi presisi → CLS aman).
  Mode export statis tetap aman (`images.unoptimized` sudah ditangani
  `scripts/export-static.mjs`).

### Keputusan dependensi (disengaja, bukan ketinggalan)
- **react/react-dom tetap 19.2.8**: React 19.3 (9 Sep 2026) sudah rilis,
  tetapi `@react-three/fiber@9.7.0` (terbaru) masih peer `>=19 <19.3` —
  hero 3D lebih penting daripada fitur baru. Dijadwalkan ulang saat
  fiber mendukung (lihat AUDIT-2026.5 §T3: View Transitions menggantikan
  sebagian framer-motion).
- next 16.3.5 = versi stabil terbaru; `npm audit` 0 temuan.

### Verifikasi
tsc 0 · vitest 52/52 · build 206 halaman statik · guard ✓ · E2E hidrasi
12/12 (lokal, build normal).

## [Stack 2026.4] — FASE 0 roadmap: CI hidrasi E2E, guard #418, budget, dependabot — 2026-09-20

### E2E hidrasi masuk CI (otomatis, bukan manual lagi)
- **`tests/e2e/hydration.mjs`** (baru): 10 rute (slug dinamis ditemukan
  otomatis dari API statis + HTML — tanpa hardcode), uji WebGL-gagal →
  hero degrade lite, uji pintasan `/` + Esc. Exit code jelas untuk CI.
- **`ci.yml`**: job `e2e` baru (build → guard → Chromium Playwright →
  `next start` → skrip E2E → server selalu dimatikan).

### Guard arsitektur #418
- **`scripts/check-static.mjs`** (baru): baca `prerender-manifest.json` —
  SEMUA rute halaman wajib tanpa `initialRevalidateSeconds` angka (ISR);
  route API live dicetak sebagai info. Dijalankan CI setelah build.
  Teruji dua arah: lolos pada build bersih, gagal pada ISR simulasi.

### Anggaran Lighthouse diketatkan (terkalibrasi pengukuran nyata)
- `lighthouserc.json`: a11y ≥ 0.95 (terukur 100) · CLS ≤ 0.05 (terukur 0) ·
  perf ≥ 0.80 · LCP error 3.800 ms + warn 2.500 ms (target F1).
- Bonus perf nyata: animasi masuk hero (H1 = elemen LCP) dipersingkat
  0.6 → 0.35 dtk → TBT 430 → 240 ms, skor performa 79 → 87.

### Keterbaruan data & dependensi
- "snapshot data per-deploy" (banner /repositories) + chip /system kini
  menaut ke `/api/github/summary` (API live).
- `.github/dependabot.yml` (baru): npm + github-actions mingguan, grup
  minor-patch, major Next/React/three di-ignore (evaluasi manual).

### Diverifikasi
guard lolos (uji negatif ✓) · E2E lokal 10 rute + 3 skenario ✓ · tautan API
di SSR /repositories & /system ✓ · tsc 0 · vitest 52/52 · build 205 halaman.
Skrip baru: `npm run check:static`, `npm run test:e2e`.

## [Stack 2026.3] — audit #3: keamanan/SW/test, roadmap tingkat lanjut — 2026-09-20

### Audit #3 (area yang belum diperdalam) — temuan & perbaikan
- **Readme.tsx (XSS jalur error)**: fallback saat `marked` melempar menyuntik
  potongan markdown MENTAH ke `dangeringlySetInnerHTML` tanpa sanitasi —
  kini di-escape entitas HTML terlebih dulu.
- **sw.js v2**: instalasi precache tidak lagi all-or-nothing (`addAll` →
  per-item, tahan jaringan goyang); cache runtime DIBATASI 60 entri
  (approx-LRU) — tidak lagi membengkak tanpa batas dari navigasi.
- **Skeleton a11y**: `role="status"` + label pada skeleton grid (pembaca
  layar kini tahu sedang memuat).
- **+11 unit test** (52 total): `tests/uptime.test.ts` baru (uptimePct,
  avgMs, lastCheck, lastIncident, overall) + determinisme `now` pada
  `computeSummary` (regresi #418 lintas-hari).

### Rencana pengembangan tingkat lanjut
- **`docs/ROADMAP.md` disusun ulang** jadi fase 0–5 (rumah tangga → konten →
  a11y → API/data → observabilitas → komunitas) dengan KPI, risiko-mitigasi,
  antrian quick-win, dan pemetaan riwayat fase lama; README ikut diselaraskan.

### Diverifikasi
tsc 0 · vitest 52/52 · build 205 halaman statis · hidrasi 5 rute utama 0
error (termasuk /repo dengan README render) · sw.js lolos `node --check`.
Operasional: browser u dipindah ke path disk (`.cache/pw`) — tmpfs /tmp
membuat sandbox RAM-2GB thrash saat build (tercatat di AGENTS.md).

## [Stack 2026.2] — audit pasca-fix #418, hardening 3D & UX ramah pengguna — 2026-09-20

### Audit mendalam pasca-fix (4 bug laten ditemukan & diperbaiki)
- **`lib/insights.ts`**: fetch GraphQL kontribusi masih `revalidate: 3600` → di
  Vercel (dengan `GITHUB_TOKEN`) halaman `/system` mewarisi ISR lagi (kambuh
  #418). Kini `cache: 'force-cache'`. (Lokal tak terdeteksi: tanpa token, fetch
  tak pernah jalan.)
- **`lib/summary.ts` + `DashboardMetrics`**: `Date.now()`/`new Date()` di
  render komponen klien → heatmap & bar aktivitas bergeser sehari setelah
  deploy → hydration mismatch pasti kambuh di `/system`. Kini "sekarang"
  deterministik = `snapshot.updatedAt` (dibuktikan: Playwright Clock maju 3
  hari → 0 error; pra-fix pasti gagal).
- **`RepoGrid`**: fallback `new Date()` pada tanggal banner dihapus.

### Hardening rantai 3D adaptif (task tertunda)
- **`ErrorBoundary` v2**: `resetKeys` (penyembuhan otomatis saat kunci
  berubah), `onError` (hook strategi degrade), fallback default aksesibel
  (`role="alert"`) + tombol "Coba lagi" tanpa reload.
- **Hero3D**: error scene → degrade permanen ke SceneLite via `onError` +
  `resetKeys={[mode]}` (bukan spinner selamanya).
- **Scene3D**: `webglcontextlost` dicegah default-nya → degrade ke lite;
  `fallback` Canvas kini memicu degrade (dibuktikan uji: WebGL di-stub gagal
  → badge `lite · css/canvas`, canvas 2D aktif, 0 error).
- Canvas dekoratif `aria-hidden` (pembaca layar).

### UX ramah pengguna (riset referensi: GitHub, Linear, pola filter/microcopy)
- **Pintasan `/`** memfokuskan pencarian repositori (ala GitHub) + hint kbd
  di input; `Esc` mengosongkan.
- **Chip "Reset"** di toolbar saat ada filter/pencarian aktif (pola
  "Clear all"); empty state kini bermakna: pesan + saran + aksi.
- **Banner data jujur**: "snapshot data per-deploy ({tanggal})" menggantikan
  bahasa "mode offline / ISR 5 menit" yang sudah tidak akurat — pengunjung
  paham kapan data dibekukan & di mana data termutakhir (API).
- **`ScrollTop`** — tombol kembali-ke-atas untuk halaman panjang (muncul
  setelah ±1,5 layar, hormati reduced-motion).
- `sys.snap` label sistem menyelaraskan: "snapshot per-deploy · {date}".

### Diverifikasi
- Hidrasi Playwright 11 rute = 0 error; uji lintas-midnight (+3 hari) = 0
  error; uji WebGL-gagal = degrade lite, 0 error; jalur 3D sehat (3d → lite);
  smoke 14 rute 200; OG PNG 1200×630; SSR ID; vitest 41/41; tsc 0;
  export:static OK (RAM 2 GB: server wajib dimatikan dulu); npm audit 0.

## [Stack 2026.1] — fix hydration #418 produksi: halaman statis murni (audit mendalam 3D adaptif) — 2026-09-19
 
### Diagnosis (audit mendalam, direproduksi 100%)
- **Gejala**: di https://niu-oss.vercel.app semua halaman melempar
  `Minified React error #418` (hydration mismatch) → React membuang HTML
  server dan me-render ulang seluruh pohon di klien — hero 3D ikut tampak
  glitch/restart (dilaporkan sebagai "bug di 3d adaptif"). Jalur 3D itu
  sendiri sehat: terukur 35–63 fps, auto-degrade ke SceneLite bekerja.
- **Akar masalah**: `revalidate` (halaman & `fetch`) memicu regenerasi ISR di
  Vercel; dokumen ter-cache terbukti **mencampur generasi render** — DOM
  (feed event segar: "22 hari lalu") berbeda dengan payload flight RSC yang
  dihidrasi (event basi dari build: "2 hari lalu", bahkan set event berbeda).
  Bukti: HTML yang diterima browser ≠ HTML yang diterima curl pada detik yang
  sama; bypass cache (`?v=<unik>`) tetap gagal; `/offline` (statis murni)
  hidrasi bersih; build lokal webpack & Turbopack selalu bersih.
- Metode: mirror penuh situs live ke server statis lokal (HTML + 17 aset) →
  #418 tetap muncul → bedah DOM vs payload flight → inkonsistensi internal
  terbukti; jam browser dimajukan/mundurkan (Playwright Clock) mengeliminasi
  teori waktu-relatif; uji Intl Node 20 = Node 22 = Chrome mengeliminasi
  teori format angka/tanggal.
 
### Diperbaiki
- **Semua halaman kini statis murni** — `export const revalidate` dihapus dari
  10 file (9 halaman + OG image repo); `getGithubSnapshot()` fetch
  `cache: 'force-cache'` saat render halaman → dokumen HTML + flight selalu
  dari SATU render build (pencampuran generasi mustahil). Data halaman
  diperbarui per deploy — cron mingguan `refresh-data` push data → deploy.
- **Route API live tetap ISR**: `/api/github/{user,repos,summary}` memanggil
  `getGithubSnapshot({ live: true })` (revalidate 300, data bergerak, tanpa
  hidrasi — aman).
- **`components/TimeAgo.tsx` baru**: label waktu relatif aman-hidrasi
  (`suppressHydrationWarning`) + berdetak tiap 60 dtk agar tetap segar di
  halaman statis; dipakai di feed beranda (2 situs) dan RepoCard.
  `timeAgo(iso, now?)` di `lib/utils.ts` menerima referensi waktu opsional.
 
### Diverifikasi
- Playwright headless (Chromium + SwiftShader WebGL): **10/10 rute hidrasi
  0 error** (pra-fix: 8/8 gagal #418); jalur 3D: `3d · 35 fps` → degrade
  `lite` sesuai desain; `npm audit` 0; vitest 41/41; tsc bersih; build
  Turbopack 205 halaman; export:static OK.
- 4 error jaringan di `/system` = URL demo live eksternal yang memang down
  (sapa-ai, kune-ya, cc-acehtengah, watchdog-mata) — data status, bukan bug.
 
## [Stack 2026] — upgrade mayor ke stack terkini: Next.js 16, React 19.2, TypeScript 7 — 2026-09-19
 
### Diubah (akar masalah deploy Vercel)
- **`next` 15.3.3 → 16.3.5** — 15.3.3 ditandai **deprecated + rentan** oleh npm
  (CVE-2025-66478, "This version has a security vulnerability"); setelah upgrade:
  `npm audit` **0 temuan**. Build Vercel kini Turbopack default (Node ≥ 20.9 —
  default Vercel Node 22 memenuhi).
- **`react`/`react-dom` 19.1.0 → 19.2.8** (versi integrasi Next 16; 19.3.0
  ditolak peer `@react-three/fiber` `>=19 <19.3`).
- **`typescript` 5.8.3 → 7.0.2** · **`vitest` 4.1.11 → 5.0.1** (41/41 lulus) ·
  `framer-motion` 13.4 · `lucide-react` 1.47 · `three` 0.186 ·
  `@react-three/fiber` 9.7 · `@react-three/drei` 10.7 · `@types/node` 22.
- **`engines.node` `>=20` → `>=20.9`** (syarat Next 16); CI & snippet README
  naik ke Node 22.
 
### Diperbaiki / disesuaikan
- **`@vercel/og` dihapus** — 3 file OG (`app/opengraph-image.tsx`,
  `app/repo/[slug]/opengraph-image.tsx`, `app/api/og/[...slug]/route.tsx`)
  bermigrasi ke **`next/og`** bawaan. Header cache OG terverifikasi utuh.
- **Ikon `Github` lucide-react dihapus upstream (1.x)** — diganti komponen
  `components/GithubMark.tsx` (SVG octicon resmi, API `className` serupa) di
  5 komponen (CommandMenu, Footer, NavBar, PaymentModal, studies-ui).
- `next.config.ts`: kunci `eslint` dibuang (next lint dihapus di Next 16);
  idem pada config yang ditulis `scripts/export-static.mjs`.
- `scripts/export-static.mjs`: build memakai `next build --webpack`
  (Turbopack OOM di lingkungan RAM < ~4 GB; hasil setara). Script baru
  `npm run build:webpack` untuk verifikasi lokal/CI kecil.
- `package.json` `name`: `niumination` → `niu-oss-dashboard` (selaras repo);
  deskripsi diperbarui. Lockfile di-regenerate (npm 11; `npm ci` diverifikasi
  kompatibel npm 10 bawaan Node 22 di CI/Vercel).
 
### Catatan
- Verifikasi: vitest 41/41 · `tsc --noEmit` bersih (TS 7) · build 205 halaman
  webpack (SITE_URL kosong **dan** web.id — pitfall Vercel tertutup) ·
  export:static OK · smoke 14 rute + API v1 + OG image PNG 1200×630 · SSR ID.
- Tailwind sengaja **tetap 3.4.17** (maintenance, stabil): migrasi v4
  (CSS-first) menunggu verifikasi visual — dicatat di BACKLOG/AGENTS.
 
## [Fix deploy] — build Vercel gagal karena `SITE_URL` kosong — 2026-09-19
 
### Diperbaiki
- **`ERR_INVALID_URL` saat build Vercel** (`Failed to collect page data for
  /_not-found`): env var `SITE_URL` yang **ada tapi kosong** lolos dari
  `process.env.SITE_URL ?? 'https://niumination.web.id'` (operator `??` hanya
  menangkap `undefined`/`null`), sehingga `new URL('')` di `app/layout.tsx`
  melempar error dan build gagal. Di mesin lokal gejalanya tidak muncul karena
  variabelnya tidak diset sama sekali.
- Sumber tunggal baru: `siteUrl` di `lib/env.ts` — `process.env.SITE_URL?.trim()
  || 'https://niumination.web.id'` (menutup kasus kosong **dan** spasi).
  Dipakai di `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`,
  `app/feed.xml/route.ts`, `app/studies/[slug]/page.tsx`, `app/repo/[slug]/page.tsx`.
- `app/api/pay/stripe/route.ts`: fallback ke `new URL(req.url).origin` kini juga
  menangani `SITE_URL` kosong.
 
### Catatan
- Verifikasi: `SITE_URL= npm run build` (kondisi Vercel direplikasi lokal) exit 0;
  `npm run typecheck` exit 0; `npm test` 41/41.
- Set `SITE_URL` di Vercel ke `https://niumination.web.id` saat domain aktif;
  nilai kosong kini aman (jatuh ke default), tapi canonical/OG akan memakai default.
 
## [Fase 3.2] — persiapan produksi Vercel + domain, ID penuh, roadmap — 2026-09-19
 
Commit: `36a8847`
 
### Diubah
- **Target produksi: Vercel + domain `niumination.web.id` (idwebhost)** —
  semua fallback URL beralih dari github.io; README Deployment A kini berisi
  langkah lengkap pemasangan domain (record A/CNAME idwebhost → Vercel).
- **Route `/api/v1/[...resource]` Vercel-safe**: file JSON di-import saat
  build (ter-bundle & ter-trace) — tidak lagi membaca `public/` via `fs`
  saat runtime (filesystem lambda Vercel tidak memuat public/).
 
### Diperbaiki (cakupan bahasa ID)
- Label kategori kini Indonesia: Aplikasi Web, Konfigurasi Sistem, Utilitas,
  Dokumentasi & Lainnya (kamus `cat.*.label` untuk EN tersedia).
- Judul metadata default: "Niumination — Dasbor OSS" (sebelumnya "OSS
  Dashboard").
- Ringkasan event feed kini ID penuh: "3 commit", "rilis v1", "menghapus
  gh-pages" (sebelumnya "3 commits", "release v1", "delete").
- Metrik studi AI-First-OS: "agen" (konsisten dengan isi studi).
 
### Ditambahkan
- `docs/ROADMAP.md` — rencana pengembangan fase 4–8 (go-live, konten,
  distribusi, kualitas, monetisasi) + backlog riset.
 
## [Fase 3.1] — i18n penuh, dokumentasi API, deskripsi repo EN — 2026-09-19
 
Commit: `48727b1`
 
### Ditambahkan
- **i18n dashboard internal penuh** (`id`/`en`): `/system`
  (DashboardMetrics, StatusMonitor, InsightsPanel, CategoryDonut),
  `/repositories` (RepoGrid, RepoCard, CloneBox), `/services` penuh
  (kartu paket, 4 langkah proses, metode pembayaran, ServicesCtas),
  dan detail repo (statistik, catatan README, repo terkait, 404 repo).
- **`/developers`** — halaman dokumentasi API publik v1 (bilingual):
  prinsip GitOps/CORS/pembaruan, tabel 9 endpoint dengan tautan live,
  contoh `fetch` nyata. Tercantum di footer, command palette, sitemap.
- **Deskripsi repositori EN**: `data/repo-descriptions.en.json`
  (12 overlay untuk deskripsi berbahasa Indonesia) +
  `lib/repo-i18n.ts` (`localizedDescription`) — dipakai kartu repo,
  halaman detail, dan API publik v1 (field `descriptionEn`).
- 3 unit test baru (overlay EN valid, pass-through, null-safe) → 41 total.
 
### Sengaja tidak diterjemahkan
- `PaymentModal` (alur pembayaran lokal: QRIS/VA/denominasi IDR) —
  klien internasional dilayani Stripe hosted link yang berbahasa Inggris.
 
## [Fase 3] — i18n, PWA, API publik v1, QR share — 2026-09-19
 
Commit: `ab0737f`
 
### Ditambahkan
- **i18n id/en infrastruktur**: kamus tunggal `lib/i18n.ts`,
  `LocaleProvider` + tombol **ID | EN** di navbar (localStorage,
  `<html lang>` sinkron). Pola: `<T k>` (server) / `useLocale()` (client).
  Cakupan awal: kerangka situs, beranda, /status, studi kasus (field `en`
  di `data/studies.json`), 404/error/offline, command palette.
  Paritas kunci ditegakkan `tests/i18n.test.ts`.
- **PWA**: `app/manifest.ts` (force-static), ikon 192/512/maskable
  tanpa dependensi (`scripts/gen-icons.mjs`), service worker `public/sw.js`
  (precache shell, navigasi network-first, aset stale-while-revalidate),
  halaman `/offline`.
- **API publik v1**: `scripts/gen-api.mjs` → 101 file JSON statis di
  `public/api/v1/` (index/user/repos/repos-{name}/events/summary/uptime/
  studies/studies-{slug}); mirror server `app/api/v1/[...resource]/route.ts`
  + header CORS di `next.config.ts`; regenerasi otomatis oleh
  `refresh-data.yml` (mingguan), `uptime.yml` (15 menit), `export:static`.
- **QR share**: `components/QrCard.tsx` (paket `qrcode`, SVG + unduh
  data-URI) di detail repo & detail studi kasus.
- Konten studi kasus dipindah ke `data/studies.json` (sumber tunggal UI
  + API) dengan terjemahan EN.
 
### Ditunda
- **PPR** — target deploy utama GitHub Pages (statis) tidak diuntungkan;
  pola shell-statis + lubang dinamis client sudah dipakai. Diputuskan
  mengukur p50/p95 dari `/api/vitals` dulu bila pindah ke Vercel.
 
## [Fase 2] — status GitOps, insight, studi kasus, observabilitas — 2026-09-18
 
Commit: `3159eed`
 
### Ditambahkan
- **`/status`** — halaman status ala Upptime: `uptime.yml` (cron 15 menit)
  → `scripts/uptime-check.mjs` (10 deployment publik teratas) → commit
  `data/uptime.json` + `lib/uptime-data.ts`. History 30 hari, uptime %,
  latensi rata-rata; auditabel penuh lewat git.
- **Pola kontribusi ala OSS Insight** (`/system`): grafik 12 bulan,
  distribusi hari-dalam-minggu, 5 repo teratas. GraphQL
  `contributionsCalendar` bila ada `GITHUB_TOKEN`; fallback events ±90
  hari dengan catatan sumber jujur.
- **`/studies`** — 3 studi kasus (Pemdi Aceh Tengah, Flame ADE,
  AI-First OS): masalah → pendekatan → hasil + metrik, navigasi prev/next,
  fakta repo live, teaser di beranda, tercantum di sitemap.
- **Observabilitas**: `<WebVitals/>` → `POST /api/vitals` (log Functions);
  Lighthouse CI mingguan (`lighthouse.yml` + `lighthouserc.json`, budget:
  perf ≥ 0.75, a11y/bp/seo ≥ 0.9, CLS < 0.15); `SENTRY_DSN` opsional.
 
## [Fase 1] — pembayaran sungguhan, feed & GitOps — 2026-09-18
 
Commit: `81a91b5`
 
### Ditambahkan
- **Pembayaran server-side**: `POST /api/pay/midtrans` (Snap API v1,
  order_id `nium-<ts36>-<rand>`, 10k–10M IDR), `POST /api/pay/stripe`
  (Checkout Session, IDR zero-decimal), webhook Midtrans dengan verifikasi
  SHA-512, `/api/pay/config` (boolean metode aktif), deposit 50% untuk
  booking jasa. Kunci rahasia tidak pernah terekspos ke client.
- **`.github/FUNDING.yml`** — tombol Sponsor + Buy Me a Coffee di semua repo.
- **Feed rilis** — seksi "Rilisan Terbaru" via satu request GraphQL
  (`getRecentReleases`, fallback ReleaseEvent) + **RSS `/feed.xml`**
  (aktif juga di static export).
- **Pencarian fuzzy Fuse.js** — salah ketik tetap menemukan; skor + limit
  60 hasil, `useDeferredValue` agar tetap 60 fps.
- **CI & data GitOps**: `ci.yml` (vitest → tsc → build), `refresh-data.yml`
  (snapshot mingguan otomatis), `Dockerfile` multi-stage, 28 unit test.
 
## [Lokalisasi & polesan] — 2026-09-17
 
Commit: `5aa0d6d`
 
### Ditambahkan
- Bahasa Indonesia sebagai default seluruh UI, metadata, JSON-LD, OG image.
- Detail repo: README markdown tersanitasi (`marked` + DOMPurify`) dari
  `raw.githubusercontent.com` dengan fallback nama file; kotak clone
  interaktif; topik bisa diklik → `/repositories?q=…`; ukuran KB/MB.
- Dashboard: donat kategori SVG, feed event ber-ikon, StatusMonitor
  dengan waktu periksa terakhir + auto-refresh 5 menit.
 
## [Audit & hardening] — 2026-09-17
 
Commit: `a1468a5`
 
### Keamanan
- Header keamanan (`nosniff`, Referrer-Policy, Permissions-Policy, COOP),
  `X-Frame-Options` sengaja tidak diset (agar bisa di-embed).
- Timeout 10 dtk per request GitHub (AbortController); error jaringan =
  fallback snapshot; cleanup semua timer saat unmount.
 
## [Rilis awal] — landing + dashboard interaktif — 2026-09-17
 
Commits: `c7f6dfd`
 
### Ditambahkan
- Landing page hero 3D performance-aware (R3F; auto-degrade ke mode
  CSS/Canvas saat low-end / <45 fps), marquee tech stack, kartu featured.
- Dashboard: agregator 91 repositori (kategori otomatis, filter, sortir),
  heatmap commit 26 minggu, monitor deployment live, command palette
  Ctrl+K (cmdk), modal monetisasi.
- SEO & OG: metadata + JSON-LD, sitemap, robots, dynamic OG image satori
  (home + per repo), 91 halaman detail pre-render.
