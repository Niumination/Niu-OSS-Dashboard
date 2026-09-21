# Niu-OSS-Dashboard — Project AGENTS.md

**Lokasi:** `sites/niu-oss-dashboard/` (ekosistem: `~/Desktop/Niumination/sites/niu-oss-dashboard/`)
**GitHub:** `github.com/Niumination/Niu-OSS-Dashboard`
**Stack:** Next.js 16.3 (App Router, Turbopack) · React 19.2 · TypeScript 7 · Tailwind 3.4 · React Three Fiber/drei · Framer Motion 13 · cmdk · Fuse.js · next/og · qrcode · Vitest 5
**Domain target:** `niumination.web.id` — **✅ LIVE per 21 Sep 2026** (registrar idwebhost · nameserver `ns1/ns2.vercel-dns.com` → zona DNS dikelola Vercel; domain Verified, HTTP 200, title "Niumination — Dasbor OSS". *Koreksi 21 Sep: catatan lama "via Cloudflare" keliru — diverifikasi 2 resolver, tidak ada Cloudflare*)
**Status:** 🟢 Aktif — **Fase 4 go-live DONE** (21 Sep 2026); Fase 5 pending

## Overview

Situs publik ekosistem Niumination: landing page (hero 3D performance-aware) + dashboard agregator 91 repo publik `github.com/niumination` (pencarian real-time, metrik aktivitas, monitor status GitOps, studi kasus, API publik v1, PWA, i18n id/en, monetisasi Midtrans/Stripe server-side).

Asal: arsip `~/Downloads/Niu-OSS-Dashboard.zip` — diimpor ke ekosistem 19 Sep 2026 dengan **riwayat git asli terjaga** (11 commit, 17–18 Sep 2026).

## Struktur

```
app/            # App Router — page.tsx (beranda), repositories, services, system, status,
                # studies, developers, repo/[slug], offline, api/{github,og,pay,v1,vitals},
                # feed.xml, sitemap.ts, robots.ts, manifest.ts
components/     # AppShell, NavBar, Hero3D + hero/Scene3D·SceneLite, RepoGrid/RepoCard,
                # DashboardMetrics, InsightsPanel, StatusMonitor, PaymentModal, CommandMenu …
lib/            # github.ts (fetch + fallback snapshot), i18n.ts (kamus id/en tunggal),
                # categories.ts, insights.ts, summary.ts, uptime.ts, site.config.ts
data/           # snapshot GitHub — GENERATED (repos, events, user, studies, uptime)
public/api/v1/  # API publik statis — GENERATED (101 berkas JSON)
scripts/        # gen-mock.mjs · gen-api.mjs · gen-icons.mjs · uptime-check.mjs · export-static.mjs
tests/          # vitest — i18n, categories, summary, utils
docs/ROADMAP.md # rencana fase 4–8
.github/workflows/  # ci · refresh-data (Senin 03:00 UTC) · uptime (15 mnt) · lighthouse (Senin 05:00 UTC)
```

## Perintah

```bash
npm ci
npm run dev        # dev server
npm test           # 41 unit test (vitest)
npm run typecheck  # tsc --noEmit
npm run build      # build produksi
npm run export:static   # varian GitHub Pages (out/)
```

## Aturan proyek

- **Berkas generated jangan diedit manual:** `data/*.json`, `public/api/v1/**`, `lib/mock-data.ts`.
  Regenerasi: `npm run gen:mock` (snapshot) / `npm run gen:api` (API publik) / `npm run gen:icons`.
- **Rahasia hanya di server:** `MIDTRANS_SERVER_KEY`, `STRIPE_SECRET_KEY` tidak boleh ber-prefix `NEXT_PUBLIC`.
  Repo hanya memuat `.env.example` — `.env.local` di-ignore.
- **i18n paritas:** kunci `id` wajib punya padanan `en` di `lib/i18n.ts` — `tests/i18n.test.ts` menolaknya.
- **Jangan set `X-Frame-Options`** — embed situs memang disengaja.
- Async kerja: branch `main` tunggal, commit kecil bertanda fase (`feat(fase-N):`).

## Verifikasi setelah diimpor (19 Sep 2026)

| Pemeriksaan | Hasil |
|---|---|
| `npm ci` | ✅ 294 paket, exit 0 |
| `npm test` | ✅ 41/41 lulus (4 berkas, 5.5 dtk) |
| `npm run typecheck` | ✅ exit 0 |
| `npm run build` | ✅ exit 0 — 206 halaman statis + studi |
| `SITE_URL= npm run build` | ✅ exit 0 (pitfall env kosong tertutup) |
| Pemindaian rahasia (`secret-scan-staged.py`) | ✅ 0 temuan |
| Cakupan data | 91 repo publik, 0 entri `private: true` |
| Domain `niumination.web.id` | ✅ DNS resolve → Vercel IP, HTTP 200, title "Niumination — Dasbor OSS" |
| Deploy Vercel | ✅ Ready (`https://niu-az30x6c63-archk4lis-projects.vercel.app`) |

## Temuan terbuka

- ~~`next@15.3.3` ditandai rentan oleh npm (CVE-2025-66478)~~ — **SELESAI 19 Sep 2026**: di-upgrade ke `next@16.3.5` (lihat CHANGELOG "[Stack 2026]"); `npm audit` kini 0 temuan.
- `data/` + `lib/mock-data.ts` masih snapshot statis; kalender kontribusi 12 bulan butuh `GITHUB_TOKEN` di Vercel (Fase 5).
- ~~**GITHUB_TOKEN di Vercel belum terverifikasi bekerja**~~ — ✅ **SELESAI 22 Sep 2026** (`9c820d3`): akar masalah adalah env `GITHUB_OWNER` berisi string kosong → `??` tidak menggantikan → fetch 404. Fix: `?.trim() ||`. Sekarang `live: true`, `source: github-api`. Token fine-grained `github_pat_11A5P` terpasang di Production + Preview.
- **CSP fase 1 aktif** (2026.7, `1ad946c`): header `Content-Security-Policy-Report-Only` + `POST /api/csp-report` (log `[csp] …` di Functions). Enforce = ganti nama key di `next.config.ts` — prosedur `docs/PANDUAN-OPS.md` §C.
- **Uptime `niumination.web.id` permanen** (2026.6, `628f77a`): baris pertama `scripts/uptime-check.mjs`, situs repo turunan dikurangi ke 9 (total tetap 10).
- **Schema repo lengkap** (2026.5→2026.7): Person + WebSite (layout) + BreadcrumbList + `SoftwareSourceCode` (lisensi SPDX, InteractionCounter) di `/repo/[slug]`.
- **Angka dasar bundel** (audit 2026.7): initial JS `/` = 915 KB (13 chunk); three.js 882 KB lazy ✓; react+react-dom 386 KB; framer-motion+cmdk 248 KB = kandidat pangkas via T3; DOMPurify 73 KB hanya rute repo.
- Tailwind masih 3.4 (maintenance) — migrasi ke v4 (CSS-first config) kandidat modernisasi berikutnya, tunggu verifikasi visual.
- ~~**GITHUB_TOKEN belum di-set di Vercel**~~ → ✅ **SELESAI 22 Sep 2026** — `live: true`, `source: github-api`, 90 repo (lihat CHANGELOG [Produksi 2026.9]).
- Domain `niumination.web.id` sudah live (21 Sep 2026) — registrar idwebhost, nameserver `ns1.vercel-dns.com` / `ns2.vercel-dns.com` (zona DNS dikelola Vercel; A apex `216.198.79.1` + `64.29.17.1`). *Catatan lama "DNS via Cloudflare" keliru — tidak ada Cloudflare.*
- Audit `docs/AUDIT-2026.5.md` dibuat (20–21 Sep 2026) — posisi kualitas × antrian penyempurnaan T1–T8.
- react tetap 19.2.8 (sengaja — fiber peer `<19.3`; hero 3D prioritas). Perubahan di `docs/AUDIT-2026.5.md` §T3.
- `package.json` react diganti ke `^19.2.8` (caret) untuk membolehkan minor patch.
- BreadcrumbList JSON-LD + avatar `next/image` (commit `c60387f`, audit 2026.5).

## Deploy (Vercel)

- Proyek Vercel: `niu-oss` (team `archk4lis-projects`), produksi `https://niu-oss-archk4lis-projects.vercel.app`, terhubung ke repo GitHub `Niumination/Niu-OSS-Dashboard` (auto-deploy tiap push `main`).
- **Pitfall `SITE_URL`:** env var yang **ada tapi kosong** membuat `new URL('')` gagal saat build (`Failed to collect page data for /_not-found`) — pernah mematikan deploy 19 Sep 2026. Selalu lewat `siteUrl` dari `lib/env.ts`, jangan pakai `process.env.SITE_URL ?? '...'`.
- Env produksi terpasang: `SITE_URL`, `GITHUB_OWNER`, `GITHUB_TOKEN`, Midtrans/Stripe, kontak.
- Reproduksi lokal perilaku Vercel: `SITE_URL= npm run build`.
- Next 16: build Vercel = **Turbopack default** (Node ≥ 20.9; Vercel pakai Node 22). Di mesin RAM kecil (< ~4 GB) Turbopack bisa OOM — verifikasi lokal pakai `npm run build:webpack`; `export:static` sudah memakai `--webpack` untuk alasan yang sama.
- **Pitfall ISR + hydration (#418, 19 Sep 2026):** `revalidate` (level halaman MAUPUN level `fetch`) membuat halaman diregenerasi di Vercel; artefak ter-cache pernah menyajikan DOM generasi baru + payload flight RSC generasi lama dalam SATU dokumen → hydration gagal (React #418) di semua halaman → seluruh pohon diregenerasi klien (hero 3D ikut tampak glitch). Solusi: SEMUA halaman statis murni — tanpa `export const revalidate`, fetch halaman pakai `cache: 'force-cache'` (lihat `getGithubSnapshot` + `lib/insights.ts`); hanya route API `/api/github/*` yang boleh ISR (`{ live: true }`). Label waktu relatif di komponen klien WAJIB `suppressHydrationWarning` (pola `<TimeAgo>`).
- **Pitfall waktu-nyata di komponen klien (20 Sep 2026):** komponen `'use client'` yang menerima snapshot penuh dan menghitung `Date.now()`/`new Date()` saat render akan mismatch sehari setelah build (nilai SSR vs hidrasi bergeser). Aturan: turunkan "sekarang" dari `snapshot.updatedAt` (lihat `DashboardMetrics`/`computeSummary(snap, now)`).
- **Sandbox RAM 2 GB (20 Sep 2026):** `npm run export:static` (webpack) bisa thrash/OOM bila server preview masih jalan — MATIKAN dulu semua `next start`, boleh tambah `NODE_OPTIONS=--max-old-space-size=1280`. Turbopack (`npx next build`) jauh lebih ringan. **/tmp adalah tmpfs (993 MB): JANGAN taruh browser Playwright/cache npm besar di sana** (bikin build OOM) — pakai `PLAYWRIGHT_BROWSERS_PATH=/home/user/.cache/pw` (disk, dikecualikan snapshot).
- **Data halaman dibekukan per deploy**; penyegaran = push data baru (cron `refresh-data` mingguan) → auto-redeploy Vercel.
- **Pitfall force-push memotong komit cron (20–21 Sep 2026):** 5 run uptime sukses commit+push, tapi `head_sha` run (`0ee958b0`, `2f3f37e2`, `ac672e7a`, `a916430d`) TIDAK ada di silsilah `main` — bukti komitnya ter-orphan karena patch diterapkan dari snapshot basi lalu dipush menimpa `main`. Data uptime beku ±26 jam. **Aturan: TIDAK PERNAH force-push; `git fetch` + `pull --rebase` sebelum `git am`/push** (detail: PANDUAN-OPS "Aturan emas", harden workflow [2026.8]).
- **Domain pointing `niumination.web.id`** (21 Sep 2026, terverifikasi ulang): domain dibeli di **idwebhost**; nameserver di panel idwebhost dialihkan ke **Vercel DNS** (`ns1/ns2.vercel-dns.com`) sehingga zona DNS dikelola dari dashboard Vercel (A apex = `216.198.79.1` + `64.29.17.1`; SOA `ns1.vercel-dns.com hostmaster.nsone.net`). Domain Verified di Vercel; trafik langsung ke Vercel (header `server: Vercel`, tanpa `cf-ray`). **Koreksi penting:** entri lama yang menyebut "DNS via Cloudflare / nameserver dimitris·rosemary.ns.cloudflare.com" adalah MISINFORMASI — tidak ada Cloudflare dalam arsitektur ini. `www`: A record ada di zona tapi sertifikat hanya CN apex — aktifkan via Vercel → Domains (lihat PANDUAN-OPS §B).
- **Pitfall `GITHUB_OWNER` string kosong (22 Sep 2026, `9c820d3`):** env `GITHUB_OWNER` di Vercel di-set ke **string kosong** (bukan dihapus) → `process.env.X ?? 'default'` tidak menggantikannya (`??` hanya null/undefined) → `OWNER=''` → semua fetch GitHub API 404 → `fallback-cache` permanen, **terlepas dari token**. Debug butuh ~1 jam karena token selalu lolos uji API terpisah. Aturan: **selalu `.trim() ||`, jangan `??`**, untuk SEMUA env yang punya default (pola `NEXT_PUBLIC_CONTACT_*`, patch `c60387f`).
- **Pitfall env `NEXT_PUBLIC_CONTACT_*` (20 Sep 2026):** `lib/site.config.ts` menggunakan `process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()` dan `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim()` — env tanpa prefix `NEXT_PUBLIC_` tidak tersedia di bundel klien. Patch arena `c60387f` menegaskan pola ini.
- **E2E 12/12 live** (build normal, bukan 52 unit test — lihat `tests/e2e/hydration.mjs`).
- Unit test 52/52 (bukan 41 — sudah diperbarui di `tests/i18n.test.ts` oleh arena `c60387f`).
- Build menghasilkan **206 halaman statis** (bukan 91 — studi baru `niu-gayo-agroclimate` + `pemdi-aceh-tengah` dan sebagainya sudah diperbarui oleh arena `c902d1b`/`c60387f`).
- **`docs/AUDIT-2026.5.md`**: audit kualitas 2026.5 — posisi saat ini, antrian penyempurnaan T1–T8, referensi riset (20–21 Sep 2026).
- **`docs/PANDUAN-OPS.md`** (2026.7): panduan ops sisi pemilik — T1 GITHUB_TOKEN (langkah PAT fine-grained), varian www (aktif via Vercel Domains), prosedur CSP → enforce, Vercel Analytics, ritual verifikasi deploy, status antrian.
- **Jejak patch Arena**: `c902d1b` (fix #418 final + sinkron konten) → `c60387f` (audit 2026.5) → `628f77a` (uptime domain, 2026.6) → `1ad946c` (CSP report-only + schema + audit bundel, 2026.7) → `2026.8` (refresh uptime manual + harden cron + aturan emas anti-force-push). Semua tercatat di CHANGELOG.
- **E2E live domain produksi 12/12** (21 Sep 2026, `https://niumination.web.id`): 10 rute + degrade WebGL + pintasan keyboard — semua hijau pasca-fix #418.

## Tasks

Lihat `BACKLOG.md`. Master: `~/Desktop/Niumination/BACKLOG.md` (tag `@niu-oss-dashboard`).
