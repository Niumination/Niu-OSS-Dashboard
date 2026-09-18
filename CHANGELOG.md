# Changelog

Semua perubahan penting proyek ini didokumentasikan di sini — satu entri
per fase pengerjaan, lengkap dengan commit yang bisa dilacak.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1/);
proyek ini tidak memakai versioning semver ketat (satu repo, satu situs).

## [Fase 3.2] — persiapan produksi Vercel + domain, ID penuh, roadmap — 2026-09-19

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
