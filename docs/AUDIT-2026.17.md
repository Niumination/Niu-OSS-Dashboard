# Audit Menyeluruh & Peta Jalan 2026.17 — Posisi, Yang Tertunda, dan Langkah Berikutnya

**Tanggal:** 23 September 2026 · **Basis:** `93685e0` (= origin/main, 2026.16 live)
**Metode:** audit empiris — repo lokal (tsc, vitest, npm audit/outdated, scan rahasia,
workflow, data) × registri npm (peer/fiber) × live `niumination.web.id` (API, config
pembayaran, kesegaran) × inventaris ROADMAP/BACKLOG/quick-wins.

> Dokumen ini adalah **peta keputusan**: apa yang sehat, apa yang tertunda (dan
> menunggu apa), serta urutan kerja yang disarankan beserta **kebutuhan lengkap**
> tiap item. Angka-angka di bawah diverifikasi langsung, bukan asumsi.

---

## 1. Posisi saat ini — diverifikasi 23 Sep 2026

| Area | Kondisi | Bukti |
|---|---|---|
| Rantai git | `93685e0` = lokal = upstream, bersih, 2026.12–2026.16 semua live | `git fetch` + diff |
| CI | `c7c7de1` CI **success** — termasuk **step a11y baru** (run pertama lolos) | GitHub API, 04:11Z |
| Kualitas | tsc **0 error** · vitest **62/62** · npm audit **0 vulnerabilities** · scan rahasia **bersih** | lokal, 23 Sep |
| i18n | Kamus **474 = 474 kunci** paritas penuh; 0 kunci terpakai hilang; a11y EN ikut diaudit | skrip audit + CI |
| A11y | axe-core 13/13 rute lolos (wcag2x + 2.2 AA), **terkunci di CI** | `tests/e2e/a11y.mjs` |
| API publik v1 | 107 endpoint (90 repo + 10 studi + 7 indeks), kontrak utuh | audit 2026.15 |
| Live | API dinamis segar (summary live github-api 04:56Z) · uptime 8/10 OK (2 = demo pause) · data uptime tiap 15 mnt | curl |
| Workflow | 4/4 aktif (CI, Lighthouse, refresh-data, Uptime) | GitHub API |
| JS initial `/` | **965 KB** (tren: 915 → 952 → 965 — creep +50 KB sejak baseline) | curl + sum chunk |

---

## 2. Temuan audit baru (belum pernah dibukukan)

### 2.1 🟢 T3 TERBUKA — fiber 9.8.0 mengizinkan react 19.3
`@react-three/fiber@9.8.0` peer react **`>=19 <19.4`** (9.7.0 masih `<19.3`).
Artinya rantai **fiber 9.8.0 + react/react-dom 19.3.0** kini valid — blokade T3
hilang. Guard pin `~19.2.8` (2026.15) bekerja sempurna (npm wanted tetap 19.2.8),
dan bisa dinaikkan ke `~19.3.0` (guard serupa terhadap 19.4).
> Catatan: canary fiber 10 masih `<19.3` — jangan sentuh alpha/canary.

### 2.2 🟠 Pembayaran belum aktif di produksi
`/api/pay/config` live → `{"midtrans":false,"stripe":false}`. Modal pembayaran
menampilkan pesan mode statis yang jujur (by design). **Mengaktifkan = keputusan
bisnis + 3 environment variable di Vercel** (lihat §4 Langkah 2) — bukan pekerjaan kode.

### 2.3 🟡 Dua baris basi di AGENTS.md (runbook tabel)
Baris 59 "41/41 lulus (4 berkas)" → kini **62/62 (7 berkas)**; baris 61
"206 halaman statis" → kini **214**. (Diperbaiki di patch dokumen ini.)

### 2.4 🟡 `sw.js` versi masih manual
`VERSION = 'niu-sw-v3'` di-hardcode — mitigasi "bump otomatis dari BUILD_ID hash"
di ROADMAP **belum diimplementasikan**. Dampak: halaman precache CORE bisa stale
pasca-deploy hingga VERSION dibump manual (navigasi network-first tetap sembuh
sendiri). Peluang implementasi: generate `sw.js` dari template saat build dengan
hash build.

### 2.5 Info lain (tidak perlu aksi)
- `@types/node` 22 → 26 (major) — naik bersama siklus Node, rendah risiko tapi
  bukan sekarang.
- vitest "latest" tag 4.1.11 < terpasang 5.0.1 — anomali registry npm, abaikan.
- `data/repos.json` snapshot 22 Sep 18:19Z — cadence mingguan benar (Senin).

---

## 3. Inventaris lengkap yang TERTUNDA — dan menunggu apa

### A. Menunggu keputusan/aksi pemilik (ops, tanpa kode)
| # | Item | Menunggu apa | Estimasi |
|---|---|---|---|
| A1 | **Aktifkan pembayaran** (Midtrans + Stripe) di Vercel | Keputusan bisnis + kunci: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `STRIPE_SECRET_KEY` | 10 mnt config + verifikasi |
| A2 | **Perbarui deskripsi repo GitHub** Niu-OSS-Dashboard (masih "Next.js 15, 91 repo") | Edit 1 kolom di GitHub (fakta: Next 16, 90 repo) | 2 mnt |
| A3 | **Trigger Lighthouse CI manual** — terakhir gagal 21 Sep (pra-fix kontras 2026.13); otomatis berikutnya baru Senin 28 Sep 05:00 UTC | Klik Run workflow (budget: perf ≥0.8, a11y ≥0.95, LCP <3.8s, CLS <0.05) | 1 mnt klik + ~8 mnt jalan |
| A4 | **Keputusan galeri screenshot studi** — banyak proyek demo dipause | Pilih: (a) tunda sampai demo aktif, (b) screenshot dari README repo masing-masing, (c) batalkan | keputusan |

### B. Menunggu jendela waktu
| # | Item | Jendela | Prasyarat |
|---|---|---|---|
| B1 | **CSP → enforce** | ~5–19 Okt (2–4 minggu sejak report-only 22 Sep) | **WAJIB dulu**: tambah URL demo ke `connect-src` (bukti laporan: ping `/system` terblokir) + 1–2 minggu laporan bersih. Prosedur: `docs/PANDUAN-OPS.md` §C |
| B2 | **Baseline CrUX** (data lapangan asli) | ~28 hari sejak trafik — sekitar 20 Okt | Cukup menunggu; cek PageSpeed Insights |
| B3 | **Lighthouse auto mingguan** | Senin 28 Sep 05:00 UTC | — (atau A3 untuk lebih cepat) |

### C. Menunggu upstream (watch, jangan paksa)
| # | Item | Status |
|---|---|---|
| C1 | tailwindcss 3.4 → **4.3** (major, T5) | Tunggu momentum; breaking changes config besar |
| C2 | @types/node 22 → 26 | Naik saat Node 26 jadi basis CI |
| C3 | vitest "latest" tag aneh | Abaikan (registry npm) |

### D. Antrian kode — SIAP dikerjakan kapan pun
| # | Item | Sumber | Ukuran |
|---|---|---|---|
| D1 | **T3: fiber 9.8.0 + react 19.3.0** + pin `~19.3.0` | temuan §2.1 | patch sedang (butuh verifikasi penuh) |
| D2 | Minor bumps: framer-motion 13.4.1, marked 18.0.14, next 16.3.6 | npm outdated | patch kecil |
| D3 | **CSP prep**: connect-src + URL demo (report-only dulu) | prasyarat B1 | patch kecil |
| D4 | **sw.js versi otomatis dari BUILD_ID** | temuan §2.4 | patch sedang |
| D5 | Quick wins ROADMAP: not-found tombol kembali, topik→filter, legenda /status, CommandMenu salin-tautan | ROADMAP §antrian cepat | 4 × kecil |
| D6 | **Fase 3 — API docs interaktif** (`/developers` upgrade: coba endpoint, contoh cURL/JS) | ROADMAP Fase 3 #1 | proyek kecil |
| D7 | Fase 3 — dataset historis + grafik pertumbuhan `/system` | ROADMAP Fase 3 #2 | proyek sedang |
| D8 | Fase 3 — feed RSS/JSON per kategori & per repo | ROADMAP Fase 3 #3 | proyek kecil |
| D9 | Fase 4 — dasbor Web Vitals p75 per rute | ROADMAP Fase 4 | proyek sedang |
| D10 | BACKLOG lama: studi MDX, widget embed + badge SVG, Sentry penuh, E2E alur kritis | BACKLOG.md | proyek masing-masing |

---

## 4. Rekomendasi urutan kerja (dengan kebutuhan lengkap)

### Langkah 1 — Patch stabil [2026.17] (kode, ~45 mnt, risiko rendah)
**Isi:** D2 (minor bumps) + perbaikan AGENTS (§2.3, sudah termasuk patch ini).
**Kebutuhan:** node_modules; verifikasi: `tsc`, `vitest`, `npm run build` 214/214;
patch dikirim ke pemilik → `git am` → push → CI hijau → deploy.
**Risiko:** minimal (patch-level semuanya).

### Langkah 2 — T3: react 19.3 + fiber 9.8 (kode, ~1 jam, risiko sedang)
**Isi:** `@react-three/fiber` 9.7.0→9.8.0, `react`+`react-dom` 19.2.8→19.3.0,
pin `~19.2.8`→`~19.3.0` (guard 19.4), `@types/react` ikut bila perlu.
**Kebutuhan:** verifikasi LENGKAP karena menyentuh runtime 3D:
`tsc` + `vitest` + `build` + **E2E hidrasi lokal** (butuh Chromium:
`npx playwright install chromium --with-deps`) + **a11y lokal** + smoke live
pasca-deploy (hero 3D render, degrade WebGL, halaman repo/studi).
**Rollback:** revert 1 commit; pin `~` mencegah dependabot melompat lebih jauh.
**Kenapa sekarang:** menutup creep risiko peer + membuka jalur fiber 10 nanti.

### Langkah 3 — Ops pemilik (5–15 mnt, tanpa kode)
A2 (deskripsi GitHub) → A3 (trigger Lighthouse) → A1 (keputusan pembayaran:
aktifkan dengan 3 kunci di Vercel, atau biarkan pesan mode statis yang jujur).

### Langkah 4 — CSP prep (kode kecil, SEBELUM jendela enforce 5–19 Okt)
**Isi:** tambah URL demo (10 situs uptime) ke `connect-src` header report-only.
**Kebutuhan:** daftar URL dari `data/uptime.json`; ubah `next.config.ts`; deploy;
pantau `/api/csp-report` 1–2 minggu (log Vercel); enforce sesuai PANDUAN-OPS §C.

### Langkah 5 — Fase 3 dimulai (proyek berikutnya, pilih satu)
Urutan disarankan: **D6 (API docs interaktif)** dulu — paling murah, memanfaatkan
API v1 yang baru saja diutuhkan (107 endpoint) → lalu D7 (dataset historis) → D8 (feed).
**Kebutuhan D6:** rancang interaktif tanpa memutus ekspor statis (fetch klien ke
`/api/v1/*`), i18n id+en, a11y (axe CI otomatis menjaga), guard `check-static.mjs` hijau.

### Langkah 6 — D5 quick wins + D4 (sw.js auto-versi) sebagai pengisi antar proyek.

---

## 5. Keputusan yang ditunggu dari pemilik

1. **Pembayaran**: aktif (siapkan kunci Midtrans/Stripe) atau tetap nonaktif?
2. **Galeri screenshot**: tampilkan (dari README repo) / tunda / batal?
3. **Urutan Fase 3**: mulai D6 (API docs) sesuai rekomendasi, atau prioritaskan lain?
4. **T3**: eksekusi sekarang (Langkah 2) atau setelah jendela CSP?

---

*Dokumen ini bagian dari seri audit: `AUDIT-2026.5.md` (posisi & antrian T1–T8) ·
`AUDIT-2026.15.md` (audit repo × live + perbaikan API) · **`AUDIT-2026.17.md`**
(Ini: peta jalan pasca-Fase 2). Sumber kebenaran angka: output perintah audit
23 Sep 2026 di atas; perbarui dokumen ini bila angka berubah signifikan.*
