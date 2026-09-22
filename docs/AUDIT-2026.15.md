# Audit Menyeluruh 2026.15 — Repo + Live Web

**Tanggal:** 22 September 2026 · **Basis:** `dc54276` (2026.14, live Production deploy 17:11:15Z)
**Metode:** audit empiris dua sisi — repo lokal (tsc, vitest, npm audit/outdated, scan rahasia,
workflow, data) × live `niumination.web.id` (sweep 23 rute, header keamanan, API, JSON-LD,
sitemap, bobot halaman, ekspor statis).

---

## 1. Posisi saat ini — diverifikasi langsung

| Area | Kondisi | Bukti |
|---|---|---|
| Rantai upstream | `dc54276` = origin/main = HEAD lokal, diff konten kosong vs patch lokal | `git diff` |
| CI/CD | CI `dc54276f` **success**; 4 workflow aktif; dependabot npm+actions mingguan | GitHub API |
| Kualitas repo | tsc **0 error** · vitest **62/62** · npm audit **0 vulnerabilities** · scan rahasia bersih · TS 7.0.2 akurat | lokal |
| Live rute | **22×200** (10 detail studi, services, system, status, now, changelog, developers, share, offline, repo, feed, sitemap, robots, manifest, sw, icon) + 404 benar untuk halaman tak dikenal | `curl` sweep |
| Header keamanan | CSP **report-only** lengkap (report-uri `/api/csp-report` → 204) · HSTS max-age 2 tahun | `curl -I` |
| API dinamis | `/api/github/summary` live:true source:github-api, updatedAt segar (17:10Z) | `curl` |
| API statis v1 | 7/9 endpoint indeks hidup; **2 rusak → diperbaiki patch ini** (lihat §2.1) | `curl` |
| JSON-LD | Semua blok valid & ter-parse: Person, WebSite, BreadcrumbList, Article (studi), SoftwareSourceCode (repo) | parse Python |
| Sitemap | 10 halaman studi + /now + /changelog; /share benar tidak masuk (noindex) | grep sitemap.xml |
| PWA | manifest share_target live · sw.js v3 + precache 5 halaman baru · halaman offline | verifikasi 2026.14 |
| Uptime | 8/10 OK — 2 turun = proyek demo yang memang dipause | `data/uptime.json` |
| Ekspor statis | `npm run export:static` **sukses 49,6 dtk** di tree saat ini (jalur GitHub Pages sehat) | lokal |
| Build | **214 halaman statis**, 0 ISR (guard CI) — angka ini dipakai metric studi | `npm run build` |

**Kesimpulan:** fondasi sehat dan 2026.13–2026.14 diterapkan sempurna. Audit menemukan
**2 bug nyata di permukaan API publik** (tidak terdeteksi CI karena file-nya tak pernah
dilacak git) + **3 angka/docs basi** + **1 risiko rantai dependensi** — semua diperbaiki
di patch 2026.15 ini.

---

## 2. Temuan & perbaikan (dipatch 2026.15)

### 2.1 [BUG — sedang] API per-studi 404 di live
`public/api/v1/index.json` (live) mengiklankan `/api/v1/studies/{slug}.json` —
namun **6 dari 10** file di `public/api/v1/studies/` **tidak pernah di-commit**
(dibuat `gen-api.mjs` tapi terlewat `git add` saat ekspansi katalog 2026.12:
didong-code, kms-spbe, niu-dash, niu-lkh, niu-oss-dashboard, sapa-ai).
Hasil: live **404 untuk 6 detail studi** itu (4 studi lama 200) — kontrak
API publik rusak diam-diam.
**Fix:** track 10 file `studies/*.json` (regenerasi segar dari `data/studies.json`).
Setelahnya generator melapor **"107 file JSON di public/api/v1/"**.

### 2.2 [BUG — ringan] Endpoint yatim `repos/dotfiles.json`
File `dotfiles` (repo lama "My Arch Dotfiles", update terakhir 2024-12-17, sudah
tidak ada di indeks `repos.json`) masih dilacak git dan **dilayani live 200**
dengan data basi.
**Fix:** `git rm` — jumlah endpoint kini persis 90 repo + 10 studi + 7 indeks = **107**.

### 2.3 [BASI] Metric studi niu-oss-dashboard salah semua angkanya
- "endpoint API publik: **102**" → aktual **107** (terverifikasi dari generator).
- "halaman statis: **208**" → aktual **214** (build saat ini).
- Prosa id+en ikut disebut angka yang sama → 4 lokasi "102" + 4 lokasi "208"
  diperbaiki di `data/studies.json`, lalu API diregenerasi.
Pelajaran: **setiap metric yang di-"print" ke halaman publik harus dicek ulang saat
fitur menambah permukaan** (2026.12–2026.14 menambah halaman & endpoint tanpa
menyentuh metric studi).

### 2.4 [RISIKO — sedang] react `^19.2.8` vs peer fiber 9.7.0
react **19.3.0 sudah rilis** dan masuk rentang caret → `npm update`/dependabot
mingguan bisa naikkan react & **menghancurkan peer fiber** (9.7.0 masih
`>=19 <19.3`). CI akan gagal dengan pesan membingungkan.
**Fix:** pin `react` + `react-dom` → `~19.2.8` (guard sementara, kembalikan ke
`^` saat fiber mendukung 19.3 — lihat T3 ROADMAP).

### 2.5 [BASI] Docs "91 repo" → 90
AGENTS.md (2 lokasi) + README.md (1 lokasi) masih menulis 91; faktanya 90
(`repos.json` 90, GitHub `public_repos` 90). Diperbaiki.

### 2.6 Observasi (tidak dipatch — dicatat untuk tahap berikut)

- **Lighthouse CI gagal 21 Sep** (`259de0c`) dan eksekusi mingguan berikutnya baru
  **Senin 28 Sep 05:00 UTC** — 16+ commit berjalan tanpa audit performa. Build
  statisnya sehat (direproduksi lokal sukses), jadi kegagalan lama kemungkinan
  asersi budget — dicurigai kontras a11y (teks `cream/30` — yang justru baru
  diperbaiki di 2026.13). **Rekomendasi ops:** trigger manual *Run workflow* setelah
  patch ini diterapkan, jangan tunggu 28 Sep.
- **JS initial 952 KB** (naik dari 915 KB baseline — creep +37 KB dari fitur
  2026.12–2026.14). Tuas terbesar tetap T3 (framer-motion+cmdk ≈ 248 KB).
- **`/repositories` HTML 529 KB** — payload RSC 90 repo ter-embed. Bisa dipangkas
  dengan client-side fetch, tapi mengubah arsitektur #418; biarkan sampai ada
  keluhan performa nyata.
- **`/api/v1/summary.json` + `repos.json`** generatedAt 21 Sep 18:34Z — cadence
  mingguan refresh-data, bukan bug.
- **vitest "latest" tag aneh** (5.0.1 > tag 4.1.11) — anomali registry npm, abaikan.
- Patch minor tersedia kapan pun: framer-motion 13.4.1, marked 18.0.14, next 16.3.6.

---

## 3. Rekomendasi tahap berikutnya (pasca-patch ini)

1. **Ops (user):** terapkan patch → CI hijau → **trigger Lighthouse CI manual** →
   verifikasi 404 per-studi berubah 200 (`/api/v1/studies/sapa-ai.json`).
2. **Mode stabilisasi s.d. ~5 Okt** (jendela CSP): pantau laporan
   `/api/csp-report` — bila 2 minggu bersih tanpa pelanggaran script/style,
   jalankan enforce sesuai rencana T2 (~5–19 Okt).
3. **Fase 2 ekor (opsional):** EN penuh, axe-core di CI, target sentuh 44 px.
4. **Galeri screenshot** — tetap menunggu keputusan user (banyak proyek demo pause).
5. **Fase 3 Data & API** — sekarang lebih relevan karena permukaan API v1
   lengkap 107 endpoint & terverifikasi.
6. **T3 (fiber)** — tunggu rilis fiber dengan peer react ≥19.3, lalu kembalikan
   pin `~19.2.8` → `^`.
