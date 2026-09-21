# Niu-OSS-Dashboard — Sub-BACKLOG

**Master:** `BACKLOG.md` (root ekosistem `~/Desktop/Niumination/`)
**Repo:** `github.com/Niumination/Niu-OSS-Dashboard` · **Path:** `sites/niu-oss-dashboard/`

## Tasks

- [x] **Fase 4 — Go-live Vercel + DNS `niumination.web.id`** — domain Verified Vercel, DNS via Cloudflare → A record ke Vercel IP (`216.198.79.65`, `64.29.17.65`); HTTP 200, title "Niumination — Dasbor OSS" (21 Sep 2026) — @niu-oss-dashboard
- [ ] **Fase 4 — Baseline observabilitas** — catat p50/p95 `/api/vitals` 1 minggu + skor Lighthouse pertama di domain produksi; tambahkan `niumination.web.id` ke `scripts/uptime-check.mjs` — @niu-oss-dashboard
- [ ] **Fase 4 — Set `GITHUB_TOKEN` di Vercel** — data repo/feed terkunci di snapshot 19 Sep (lihat `docs/AUDIT-2026.5.md` §T1) — @niu-oss-dashboard
- [x] **🔐 Upgrade `next@15.3.3`** — ~~naik ke patch Next 15~~ **SELESAI lebih jauh: `next@16.3.5` + React 19.2 + TS 7 + Vitest 5** (19 Sep 2026; CVE-2025-66478 tertutup, audit 0 temuan; lihat CHANGELOG "Stack 2026") — @niu-oss-dashboard
- [x] **Fase 4 — Patch arena.ai v5 (`c60387f`)** — BreadcrumbList JSON-LD, avatar `next/image`, `docs/AUDIT-2026.5.md`, `CHANGELOG.md` [Stack 2026.5] (21 Sep 2026) — @niu-oss-dashboard
- [ ] **Fase 5 — Studi kasus MDX + kalender kontribusi live** — migrasi `data/studies.json` → MDX, aktifkan `GITHUB_TOKEN` untuk GraphQL `contributionsCalendar`, lengkapi overlay deskripsi repo EN — @niu-oss-dashboard
- [ ] **Fase 6 — Distribusi** — widget embed `/embed/repo/[slug]`, badge SVG ala shields, `/share` vCard + QR — @niu-oss-dashboard
- [ ] **Fase 7 — Kualitas** — E2E Playwright alur kritis, Lighthouse per-PR, Sentry penuh, budget bundel di CI — @niu-oss-dashboard
- [ ] **Fase 8 — Monetisasi lanjutan** — produk digital + portal klien ringan (setelah ada trafik) — @niu-oss-dashboard
