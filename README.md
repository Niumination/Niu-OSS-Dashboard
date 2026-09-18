<div align="center">

**niumination** — OSS Dashboard
Landing page + dashboard interaktif untuk <a href="https://github.com/niumination">github.com/niumination</a>

`Next.js 15` · `React 19` · `TypeScript` · `React Three Fiber` · `Tailwind` · `Framer Motion` · `cmdk` · `@vercel/og`

</div>

---

## ✦ Apa ini?

Satu situs, dua wajah:

1. **Landing page** — hero 3D interaktif (tech-core + network node graph) dengan
   *frame-rate monitor*: perangkat low-end otomatis jatuh ke visual CSS/Canvas ringan (60 fps).
2. **Dashboard** — agregator 91 repositori publik (pencarian real-time, kategori otomatis,
   filter, sortir), metrik aktivitas GitHub (heatmap commit, bahasa, grafik 30 hari),
   monitor status deployment live, command palette `Ctrl+K`, dan sistem monetisasi
   (donasi OSS + booking jasa).

Tema visual mengadaptasi template *ink / cream / ember + spotlight cyan* dengan
aesthetic dark-mode glassmorphism: tipografi **Instrument Serif** (display), **Inter** (UI),
**JetBrains Mono** (micro-label & angka).

## ✦ Fitur

| # | Fitur | Detail |
|---|-------|--------|
| 1 | **Agregator repositori dinamis** | GitHub REST API via `fetch` + Next ISR (`revalidate: 300`). Pencarian real-time, kategori otomatis (Web Apps, System Configs, CLI, Mobile, Utilities, Docs) berbasis language/topik/nama, badge tech stack, stars/forks, sortir (Terbaru / Stars / Nama), filter fork. |
| 2 | **Hero 3D performance-aware** | `@react-three/fiber` + `@react-three/drei` (Three.js). Deteksi device saat mount + FPS monitor in-scene (<45 fps 2× pascatan 3 dtk → **auto-degrade** ke SceneLite: CSS glow orbs + jaringan partikel canvas 2D). |
| 3 | **Command Palette (Ctrl+K / Cmd+K)** | `cmdk`: cari repo, lompat antar seksi, buka tautan sosial, salin email, atau langsung buka modal pembayaran — full keyboard. |
| 4 | **Master dashboard** | 6 stat cards, commit heatmap 26 minggu, distribusi bahasa, grafik aktivitas 30 hari, top repositori, feed event, **StatusMonitor** deployment live (no-cors reachability check + timeout). |
| 5 | **Monetisasi** | Modal 2 tab: *Dukung OSS* (Sekali/Bulanan, nominal cepat + custom, GitHub Sponsors, BuyMeACoffee, **Midtrans SNAP** QRIS/VA, **Stripe** hosted link) dan *Sewa Jasa* (Konsultasi Teknis, Audit & Optimasi, Custom Web App → form brief → **mailto + WhatsApp** checkout flow). |
| 6 | **UI/UX** | Dark-mode glassmorphism, glow accents, Framer Motion micro-animations, skeleton loading, error boundaries (komponen + route), responsif mobile→desktop. |
| 7 | **SEO & OG image** | Metadata + JSON-LD Person, `sitemap.ts`, `robots.ts`, **Dynamic OG Image** (`@vercel/og`/satori): `app/opengraph-image.tsx` (home, force-static) + `app/api/og/[...slug]` (per repo, ISR 1 jam) + `app/repo/[slug]/opengraph-image.tsx` (file convention, pre-render per slug). |

## ✦ Struktur direktori

```
niumination/
├── app/
│   ├── layout.tsx                  # Fonts (Instrument Serif/Inter/JetBrains Mono), metadata, JSON-LD
│   ├── globals.css                 # Tailwind + token ink/cream/ember, dot-grid, glass, cmdk styling
│   ├── page.tsx                    # TAB 1 — Overview / Landing (hero3D + featured + services + activity)
│   ├── repositories/page.tsx       # TAB 2 — All Repositories (aggregator)
│   ├── services/page.tsx           # TAB 3 — Services & Commissions
│   ├── system/page.tsx             # TAB 4 — System & Metrics (+ StatusMonitor)
│   ├── repo/[slug]/
│   │   ├── page.tsx                # Detail repo: stats, topics, README, related, generateStaticParams
│   │   ├── opengraph-image.tsx     # Dynamic OG image per repo (file convention)
│   │   └── loading.tsx
│   ├── api/
│   │   ├── github/user/route.ts    # GET  profil + status live/fallback
│   │   ├── github/repos/route.ts   # GET  seluruh repo + kategori
│   │   ├── github/summary/route.ts # GET  metrik agregat
│   │   └── og/[...slug]/route.ts   # GET  /api/og/home · /api/og/repo/<nama> → PNG (satori)
│   ├── opengraph-image.tsx         # OG home (force-static)
│   ├── sitemap.ts · robots.ts
│   ├── loading.tsx · error.tsx · not-found.tsx · icon.svg
├── components/
│   ├── AppShell.tsx                # Nav + CommandMenu + PaymentModal + Footer (client shell)
│   ├── ui-context.ts               # useUi(): openPayment(tab), openCommand()
│   ├── NavBar.tsx · Footer.tsx · SectionHead.tsx · Skeletons.tsx · ErrorBoundary.tsx
│   ├── Hero3D.tsx                  # Hero: device check + FPS badge + CTA
│   ├── hero/Scene3D.tsx            # R3F scene: icosahedron core, 56-node graph, 350 partikel, FPS monitor
│   ├── hero/SceneLite.tsx          # Fallback ringan: CSS orbs + canvas 2D interaktif
│   ├── RepoGrid.tsx                # Pencarian real-time + kategori + sortir + filter fork
│   ├── RepoCard.tsx                # Kartu: deskripsi, badge bahasa, topics, stars, Live Demo, Source
│   ├── CommandMenu.tsx             # cmdk palette (Ctrl+K)
│   ├── DashboardMetrics.tsx        # Stats + CommitHeatmap + LanguageBars + ActivityBars
│   ├── StatusMonitor.tsx           # Health-check deployment live
│   ├── PaymentModal.tsx            # Donasi OSS + booking jasa (Midtrans/Stripe/Sponsors/BMAC)
│   └── ServicesCtas.tsx
├── lib/
│   ├── github.ts                   # API fetcher: headers/token, ISR revalidate, GithubError, FALLBACK
│   ├── mock-data.ts                # (generated) snapshot nyata — fallback rate-limit & static export
│   ├── gen via scripts/gen-mock.mjs
│   ├── categories.ts               # Klasifikasi otomatis repo → 6 kategori
│   ├── summary.ts                  # Metrik agregat (computeSummary)
│   ├── site.config.ts              # ⚙️ SATU-satunya file yang perlu Anda sentuh (link, harga, kontak)
│   ├── env.ts · types.ts · utils.ts · og-html.tsx
├── scripts/
│   ├── gen-mock.mjs                # Regenerasi snapshot fallback (npm run gen:mock)
│   └── export-static.mjs           # Build static export untuk GitHub Pages (npm run export:static)
├── tailwind.config.ts · next.config.ts · tsconfig.json · postcss.config.mjs
├── .env.example
└── data/                           # (opsional, local-only) repos.json/events.json/user.json
```

## ✦ Persiapan & Jalankan Lokal

```bash
git clone https://github.com/niumination/niumination.git
cd niumination

npm install
cp .env.example .env.local   # lalu isi sesuai bagian "Environment"

npm run dev                  # http://localhost:3000
```

> Tanpa `GITHUB_TOKEN` pun situs berfungsi (limit 60 req/jam per IP).
> Saat limit habis → **fallback snapshot otomatis** + banner peringatan;
> halaman tidak pernah blank.

## ✦ Environment Variables

| Var | Wajib | Fungsi |
|-----|:---:|--------|
| `SITE_URL` | ✓ | URL publik — dipakai metadataBase, sitemap, OG image. |
| `GITHUB_OWNER` | – | Default `Niumination`. |
| `GITHUB_TOKEN` | – | Token GitHub (scope apa pun). Naikkan limit 60 → **5000 req/jam**. |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | – | Client key Midtrans SNAP → tombol "Checkout" Midtrans aktif. |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | – | Stripe hosted payment link → tombol Stripe aktif. |
| `CONTACT_EMAIL` | – | Tujuan form booking jasa (default `halo@niumination.dev`). |
| `WHATSAPP_NUMBER` | – | Nomor WA `62…` untuk tombol Chat WhatsApp. |

⚠️ **Sebelum publish:** ganti `email` & `whatsapp` placeholder di `lib/site.config.ts`
(fallback) dan/atau set `CONTACT_EMAIL` + `WHATSAPP_NUMBER` di environment.

## ✦ Deployment

### A. Vercel (rekomendasi — fitur penuh)

1. Push repo ke `niumination/niumination` (lihat bagian *Push* di bawah).
2. [vercel.com/new](https://vercel.com/new) → import repo `niumination/niumination`.
   Framework auto-terdeteksi: **Next.js**. Build & output dianggap default.
3. Isi Environment Variables:
   - `SITE_URL` = URL final (mis. `https://niumination.vercel.app`)
   - `GITHUB_TOKEN` (sangat disarankan)
   - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`, `CONTACT_EMAIL`, `WHATSAPP_NUMBER`
4. **Deploy.** Selesai.

Keuntungan Vercel di sini:
- ISR (`revalidate`) terkelola — data GitHub segar tiap 5 menit tanpa CDN cold-call.
- `app/api/og/[...slug]` (dynamic OG) berjalan di Node runtime, cache 1 jam.
- `generateStaticParams` pre-render 91 halaman detail repo saat build.

CLI alternatif:

```bash
npm i -g vercel
vercel          # preview
vercel prod     # produksi
```

### B. GitHub Pages (tanpa server)

Static export: semua halaman + OG image dirender **saat build** dari snapshot
(OG route handler otomatis dinonaktifkan oleh script — memang tidak didukung
`output: 'export'`).

```bash
npm run export:static
```

Script melakukan: regenerasi `lib/mock-data.ts` (fetch API atau `data/*.json` lokal)
→ tulis `next.config.ts` varian `output:'export'` → pindahkan `app/api` → `next build`
→ **memulihkan semua file**. Hasil di folder `out/`.

Lalu deploy `out/` ke Pages — contoh pakai GitHub Actions (buat file
`.github/workflows/pages.yml`):

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
        with: { node-version: 20 }
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
- Data dibekukan saat build (snapshot fallback). Update = push + redeploy.
- `SITE_URL` harus `https://niumination.github.io` (atau subpath bila project pages).
- Bila pakai **project pages** (`/repo-name/`), tambahkan `basePath: '/niumination'`
  ke varian config di `scripts/export-static.mjs`.

### C. Self-host (Docker / VPS)

```bash
npm run build && npm start
```

Atau Dockerfile minimalis:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG SITE_URL
ENV SITE_URL=$SITE_URL
RUN npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]
```

## ✦ Push ke `niumination/niumination`

Repo `Niumination` saat ini berisi profile README. Folder ini **menggantinya** —
README di atas sengaja dibuat ramah profil (baca sebagai profil GitHub juga).

```bash
# di folder niumination/
git init
git add -A
git commit -m "feat: OSS dashboard — landing + dashboard interaktif"
git branch -M main
git remote add origin https://github.com/niumination/niumination.git
git push -u origin main      # -f hanya jika riwayat lama tidak perlu dijaga
```

## ✦ Strategi caching & fallback (ringkas)

```
Request → [ISR cache 300 dtk] → hit?  ✅ kirim cache
                              → miss? → GET api.github.com
                                         │ 200  → simpan cache → kirim
                                         │ 403/429 (rate-limit) → 🛟 MOCK_SNAPSHOT + banner
                                         └ error jaringan      → 🛟 MOCK_SNAPSHOT + banner
```

- `lib/mock-data.ts` = **snapshot nyata** (bukan data dummy) hasil `npm run gen:mock`.
- Regenerasi berkala (mis. lewat cron/Actions mingguan) agar fallback tetap segar.
- Tag cache: `['github']` — siap untuk `revalidateTag('github')` bila nanti ada
  trigger manual (route webhook, dsb.).

## ✦ Audit & hardening (2026-09)

Situs diaudit dan di-hardening sebelum deploy:

- **Keamanan** — `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `X-Powered-By` dinonaktifkan.
  (`X-Frame-Options` sengaja tidak diset agar situs tetap bisa di-embed.)
- **Robustness API** — timeout 10 dtk per-request ke GitHub (AbortController);
  hang/network error diperlakukan seperti rate-limit → fallback snapshot.
  Semua timer `StatusMonitor` dibersihkan saat unmount.
- **Performa** — pencarian 90+ kartu memakai `useDeferredValue` (input tetap
  60fps); Scene3D `dpr` dibatasi 1.5; animasi Framer Motion dinonaktifkan saat
  `prefers-reduced-motion`.
- **Aksesibilitas** — skip-link, `:focus-visible` global, dialog dengan fokus
  masuk/keluar yang dikelola, `aria-live` pada hasil pencarian, trigger
  command palette tersedia di mobile.
- **SEO** — JSON-LD `Person` + `WebSite` dengan `SearchAction`
  (`/repositories?q=…`), canonical URL per halaman, `apple-icon`.
- **Konten** — marquee tech stack agregat di beranda; 404 dengan quick-links.

### Fase 1 — pembayaran sungguhan, feed & GitOps (2026-09)

- **Pembayaran server-side**: `POST /api/pay/midtrans` (Snap API v1, kunci
  `MIDTRANS_SERVER_KEY` tidak pernah terekspos) → `snap.pay(token)`;
  `POST /api/pay/stripe` (Checkout Session, IDR zero-decimal) → redirect.
  Webhook Midtrans di `/api/pay/midtrans/webhook` dengan verifikasi tanda
  tangan SHA-512. Tab *Sewa Jasa* kini punya **bayar deposit 50%**.
  `/api/pay/config` memberi tahu UI metode mana yang aktif (boolean saja).
- **`.github/FUNDING.yml`** — tombol Sponsor GitHub + Buy Me a Coffee
  otomatis tampil di semua repo.
- **Feed rilis** — seksi "Rilisan Terbaru" di beranda via **satu request
  GraphQL** (`GITHUB_TOKEN` dibutuhkan; fallback ke event ReleaseEvent).
- **RSS `/feed.xml`** — RSS 2.0 dari snapshot (aktif juga di static export),
  didaftarkan di metadata `alternates.types`.
- **Pencarian fuzzy Fuse.js** — salah ketik tetap menemukan ("pemdi" ≈
  "PemdiAcehTengah"), skor + limit 60 hasil, defer agar tetap 60fps.
- **CI + test + cron data**: GitHub Actions `ci.yml` (vitest → tsc → build),
  `refresh-data.yml` regenerasi snapshot mingguan otomatis (mode `--fresh`
  pada `gen-mock`, pola GitOps ala Upptime), `Dockerfile` multi-stage,
  28 unit test vitest (`tests/`).
- Perbaikan dari test: `computeSummary().categoryCounts` kini konsisten
  menyertakan `all` (sama seperti `countByCategory`).

### Lokalisasi & polesan (2026-09)

- **Bahasa Indonesia sebagai default** di seluruh UI, metadata, JSON-LD, dan
  OpenGraph image (satori).
- **Detail repo**: README dirender sebagai markdown tersanitasi
  (`marked` + `DOMPurify`, client-side) — diambil dari
  `raw.githubusercontent.com` (CDN, tanpa rate limit) dengan fallback
  nama `README.md/readme.md/Readme.md/README.rst/README`; kotak clone
  interaktif (salin perintah / salin tautan); topik bisa diklik →
  pencarian `/repositories?q=topik`; ukuran KB/MB manusiawi.
- **Dashboard**: donat distribusi kategori otomatis (SVG), feed event
  ber-ikon per jenis (push/create/release/fork/watch/issue/PR),
  StatusMonitor menampilkan waktu periksa terakhir + auto-refresh 5 menit.

## ✦ Kontribusi / kustomisasi cepat

- **Ganti warna tema** → `tailwind.config.ts` (blok `colors`) + `app/globals.css`.
- **Ubah harga paket / repo unggulan / link sosial** → `lib/site.config.ts`.
- **Tambah kategori** → `CATEGORIES` di `lib/categories.ts` (+ heuristik `categorize`).
- **Tambah deployment ke monitor** → otomatis (repo original + homepage, 10 terbaru).
  Bisa di-pin manual lewat `SITE` bila perlu.
