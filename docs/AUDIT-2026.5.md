# Audit Kualitas 2026.5 — Posisi Sekarang & Tahap Penyempurnaan Berikutnya

**Tanggal:** 20–21 September 2026 · **Basis:** `c902d1b` (pasca-fix #418, E2E live 12/12)
**Metode:** audit internal (kode, build, CI, header live) × referensi praktik terbaik
produksi Next.js 2026 (SEO/CWV, keamanan header, rilis upstream React/Next).

---

## 1. Posisi saat ini — sudah di level mana?

Diverifikasi langsung dari repo + live, bukan asumsi:

| Area | Kondisi | Sumber verifikasi |
|---|---|---|
| Rendering | 206 halaman **statik murni**, 0 ISR (guard CI `check-static.mjs`) | build + guard |
| Hidrasi | E2E live 12/12 hijau (pasca-fix #418) | `hydration.mjs` vs vercel.app |
| Core Web Vitals (lab) | TTFB 6–14 ms · FCP 116–632 ms · LCP 236 ms · FID 1 ms — semua "good" | log `/api/vitals` build lokal |
| Stack | next 16.3.5 (terbaru) · react 19.2.8 · TS 7 · Vitest 5 — **0 vulnerabilities** | `npm ls` + `npm audit` |
| SEO | Metadata API + `metadataBase`/canonical + sitemap + robots + JSON-LD Person/WebSite/SearchAction + **BreadcrumbList (baru)** + OG image dinamis | `app/layout.tsx`, halaman repo/studi |
| Keamanan header | `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP; X-Frame-Options sengaja terbuka (embed) | `next.config.ts` |
| CI/CD | test + typecheck + build + guard + **E2E hidrasi** + **Lighthouse budget** (perf ≥0.8, a11y ≥0.95) + dependabot | `.github/workflows/` |
| PWA | manifest + sw.js v2 + offline page | `app/manifest.ts`, `public/sw.js` |
| Observabilitas | `/api/vitals` (Web Vitals → server) + uptime cron + refresh-data cron | `app/api/vitals`, workflows |
| Dokumentasi | README, CHANGELOG, AGENTS.md, BACKLOG, ROADMAP fase 0–5 | root + `docs/` |

**Kesimpulan:** fondasi sudah kelas produksi. Yang tersisa bukan "mengejar
best practice", melainkan penyempurnaan bertahap — daftar berikut
diurutkan berdasarkan nilai vs risiko.

---

## 2. Temuan & antrian penyempurnaan (hasil riset, diprioritaskan)

### T1 — OPS (tanpa kode, efek langsung besar)
1. **Set `GITHUB_TOKEN` di Vercel** (fine-grained, read-only public).
   Build live dua kali berturut-turut jatuh ke `fallback-cache`
   (rate-limit 60 req/jam unauthenticated dipakai bersama IP Vercel) →
   data repo/feed terkunci di snapshot 19 Sep. Dengan token (5.000 req/jam)
   setiap deploy membawa data segar. *Ini penyebab #1 data live terasa
   "telat", bukan bug.*
2. **Hapus env `CONTACT_EMAIL`/`WHATSAPP_NUMBER` lama** di Vercel (sudah
   tidak dibaca kode; murni kebersihan). Kontak custom → `NEXT_PUBLIC_CONTACT_EMAIL`.
3. **Saat pointing domain**: set `SITE_URL=https://niumination.web.id` +
   tambahkan domain ke `scripts/uptime-check.mjs` (sudah ada di BACKLOG Fase 4).

### T2 — Keamanan: CSP bertahap (report-only → enforce)
Praktik 2026: CSP nonce + `strict-dynamic` via middleware. **Catatan
arsitektural:** situs ini statik murni — nonce per-request tidak mungkin
ter-inject ke HTML prerender. Jalur realistis:
1. Deploy `Content-Security-Policy-Report-Only` dulu (header statis di
   `next.config.ts`): `default-src 'self'; img-src 'self' data: https:;`
   `script-src 'self' 'unsafe-inline'` (flight Next inline) + `connect-src`
   terkunci; pantau laporan 2–4 minggu.
2. Perketat bertahap: `frame-ancestors`, `object-src 'none'`, `base-uri 'self'`.
3. Enforce setelah nol pelanggaran. Target grade A di securityheaders.com.
   Referensi: checkfast.io/securing-headers-csp-hsts-2026, decryptiondigest
   (report-only first), codercops (config Next).

### T3 — React 19.3 + View Transitions (menunggu upstream)
React 19.3 (9 Sep 2026) stabil: **View Transitions**, Fragment Refs,
`browser()`, Trusted Types, Context di Server Components — non-breaking.
**Terblokir:** `@react-three/fiber@9.7.0` (terbaru) peer react `>=19 <19.3`.
Aksi: pasang ulang test saat fiber rilis mendukung 19.3. Keuntungan
nyata setelahnya: View Transitions bisa menggantikan animasi
framer-motion (dipakai di 11 komponen) → potensi pemangkasan bundel JS
client yang cukup besar.

### T4 — Bundle audit berkala
- Jalankan `@next/bundle-analyzer` per kuartal; pantau First Load JS.
- Kandidat lazy-load: `three`/`@react-three` (hero — sudah degrade lite,
  pastikan chunk 3D tidak masuk initial load), `marked`+`dompurify`
  (Readme — pastikan hanya di route `/repo/[slug]`), `qrcode` (QrCard).
- Tambah budget bundle di CI (lanjutan Lighthouse budget yang sudah ada).

### T5 — Tailwind 3 → 4 (major, rencana khusus)
v4.3: engine baru (lebih cepat), config CSS-first, ukuran lebih kecil.
Migrasi menyentuh semua styling — jadikan proyek terpisah dengan visual
regression check (screenshot E2E) + lighthouse before/after. Jangan
digabung dengan perubahan lain.

### T6 — SEO lanjutan
- ✅ Sudah ditambahkan audit ini: BreadcrumbList di `/repo/[slug]` +
  `/studies/[slug]`.
- Berikutnya: `SoftwareSourceCode` schema di halaman repo (name,
  programmingLanguage, license, url) — kaya hasil pencarian untuk repo
  publik; `Article` schema untuk studi.
- Setelah domain aktif + CrUX terkumpul: verifikasi field-data CWV
  (lab sudah bagus, field data dari pengguna nyata yang menentukan
  ranking).

### T7 — Observabilitas produksi (selaras ROADMAP Fase 4)
- Sentry (error tracking) — kandidat paling bernilai; gratis untuk
  open-source.
- Vercel Analytics / Speed Insights untuk field CWV (tambahan dari
  `/api/vitals` yang sudah jalan).
- Alert uptime → notifikasi (bukan hanya status page pasif).

### T8 — Item backlog yang tetap relevan
MDX studi (F5), widget embed + badge (F6), E2E alur kritis bayar (F7),
monitoring pasca-domain (F4). Lihat `BACKLOG.md` + `docs/ROADMAP.md`.

---

## 3. Yang SUDAH dikerjakan (audit ini + lanjutan 2026.6–2026.7)

| Perubahan | Nilai | Commit |
|---|---|---|
| Avatar NavBar → `next/image` | AVIF/WebP otomatis, dimensi presisi (CLS), lazy-consolidation; satu-satunya `<img>` manual tersisa | `c60387f` |
| `BreadcrumbList` JSON-LD di repo & studi | Rich result breadcrumb di Google | `c60387f` |
| `react`/`react-dom` dipertahankan 19.2.8 sengaja | 19.3 di luar peer range fiber — risiko 3D hero; diputuskan stabil > baru (dicatat di T3) | `c60387f` |
| **Uptime `niumination.web.id` permanen** | Situs utama baris pertama pemantauan cron 15 mnt (domain live 21 Sep) | `628f77a` |
| **T2 fase 1: CSP report-only** + `/api/csp-report` | Pengumpulan pelanggaran ke log Vercel — jalur menuju enforcement (PANDUAN-OPS §C) | `1ad946c` |
| **T6 lanjut: `SoftwareSourceCode`** di `/repo/[slug]` | Lisensi SPDX, InteractionCounter star/fork — rich result repo | `1ad946c` |
| **T4: audit bundel** (angka dasar) | initial `/` 915 KB · three.js 882 KB lazy ✓ · framer+cmdk 248 KB (kandidat T3) · DOMPurify 73 KB rute repo saja | `1ad946c` |
| Workspace & artefak debug dibersihkan | patch lama, mirror, `.next` 206 MB | — |

**Status antrian (22 Sep 2026):** ~~T1 ⏳ menunggu pemilik (PANDUAN §A)~~ → **T1 ✅ SELESAI** — live: true, source: github-api (token fine-grained + fix GITHUB_OWNER kosong, `9c820d3`) ·
T2 ✅ fase 1 / enforce menunggu data laporan · T3 ⏳ menunggu rilis fiber
(`npm view @react-three/fiber peerDependencies.react`) · T4 ✅ ·
T5 ⏸ proyek terpisah · T6 ✅ (SoftwareSourceCode terpasang) ·
T7 sebagian (uptime+vitals ✓; Analytics/Sentry = PANDUAN §D) · T8 mengikuti BACKLOG.

---

## 4. Referensi riset (ringkas)

- Praktik produksi Next.js App Router 2026: javascriptdoctor.blog (SEO +
  best practices), c-sharpcorner (Server Components), webdevultra
  (production checklist)
- Core Web Vitals 2026: codeminer.co (panduan LCP/INP/CLS + PPR),
  eastondev.com (LCP/FCP/CLS Next.js), wellally.tech (studi kasus:
  next/image +55% LCP, next/dynamic +57% INP)
- Keamanan header 2026: checkfast.io, devtoolkit.cloud, decryptiondigest,
  codercops (CSP nonce/strict-dynamic, report-only rollout)
- Rilis upstream: React 19.3 (react.dev / changelog — View Transitions
  stabil), Next 16.3.5 = latest stabil saat audit
