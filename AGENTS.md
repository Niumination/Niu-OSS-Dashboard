# Niu-OSS-Dashboard — Project AGENTS.md

**Lokasi:** `sites/niu-oss-dashboard/` (ekosistem: `~/Desktop/Niumination/sites/niu-oss-dashboard/`)
**GitHub:** `github.com/Niumination/Niu-OSS-Dashboard`
**Stack:** Next.js 15.3 (App Router) · React 19 · TypeScript 5.8 · Tailwind 3.4 · React Three Fiber/drei · Framer Motion · cmdk · Fuse.js · @vercel/og · qrcode · Vitest 4
**Domain target:** `niumination.web.id` (Vercel + DNS idwebhost) — **belum live per 19 Sep 2026** (DNS belum resolve)
**Status:** 🟢 Aktif — Fase 3.2 selesai (akumulasi 11 commit); Fase 4 go-live pending

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
| `npm run build` | ✅ exit 0 — 91 halaman repo + 3 studi ter-prerender |
| Pemindaian rahasia (`git grep` pola key/token) | ✅ 0 temuan |
| Cakupan data | 91 repo publik, 0 entri `private: true` |

## Temuan terbuka

- `next@15.3.3` ditandai rentan oleh npm (CVE-2025-66478) — upgrade menunggu keputusan pemilik (tercatat di `BACKLOG.md`).
- `data/` + `lib/mock-data.ts` masih snapshot statis; kalender kontribusi 12 bulan butuh `GITHUB_TOKEN` di Vercel (Fase 5).

## Tasks

Lihat `BACKLOG.md`. Master: `~/Desktop/Niumination/BACKLOG.md` (tag `@niu-oss-dashboard`).
