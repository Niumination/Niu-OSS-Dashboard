# ROADMAP — Rencana Pengembangan Tingkat Lanjut

> Dokumen hidup: revisi tiap fase selesai. Tanggal status: **2026-09-20**.
> Prinsip urutan: **stabil → bermakna → menawan**. Tidak ada fitur baru di atas
> fondasi yang merah.

## Prinsip yang tidak berubah

1. **GitOps per-deploy**: halaman statis murni; data beku per deploy,
   disegarkan cron mingguan (`refresh-data` → push → redeploy). Hanya
   `/api/github/*` yang live (ISR 5 mnt).
2. **Bahasa Indonesia 100%** untuk konten; Inggris hanya istilah teknis &
   tautan eksternal.
3. **Tanpa ISR pada halaman** (pelajaran #418 — dokumen campur generasi).
4. **Performa adalah fitur**: 3D adaptif (3d/lite), degrade otomatis, RAM
   sandbox kecil = uji ketat gratis.
5. **Aksesibilitas bukan bonus**: keyboard-first, `aria-*`, reduced-motion.

## Baseline hijau (jaga, jangan regresi)

vitest 52/52 · tsc 0 · build 205 halaman statis · hidrasi 0 error (11 rute,
termasuk uji lintas-midnight & WebGL-gagal) · smoke 14 rute · SSR ID ·
`export:static` OK · `npm audit` 0 · API live ISR 5 mnt.

---

## FASE 0 — Rumah Tangga Berkelanjutan (mingguan, jalan terus)

Tujuan: kualitas tidak terkikis oleh waktu. *(CI dasar sudah ada:
`ci.yml` = vitest+tsc+build; `lighthouse.yml` mingguan — item di bawah
adalah PENGUATAN, bukan dari nol.)*

- [ ] **E2E hidrasi di CI** (`ci.yml`, job baru): `next start` + Playwright
      — 11 rute = 0 error, uji WebGL-gagal → degrade, pintasan `/`.
      Simpan skrip di `tests/e2e/` (adaptasi `/home/user/.pwtest` lokal).
- [ ] **Guard route-table #418**: langkah CI yang gagal bila build output
      menampilkan kolom Revalidate pada rute halaman (bukan `/api/*`).
- [ ] **Ketatkan anggaran Lighthouse** (`lighthouserc.json`): LCP ≤ 2.500
      (error, kini 4.000 warn), CLS ≤ 0,05 (kini 0,15), a11y ≥ 0,95.
- [ ] **Keterbaruan data**: badge "snapshot per-deploy" menautkan ke
      `/api/github/summary` — pengunjung selalu tahu umur data.
- [ ] Kunci dependensi mingguan (`npm outdated` → PR terjadwal, renovate-style).

## FASE 1 — Konten & Narasi (bulan 1–2) — *prioritas pengguna*

Tujuan: pengunjung datang untuk **cerita**, bukan sekadar daftar repo.

- [ ] **Katalog studi kasus kaya** (perluas `/studies`): tiap studi punya
      masalah → keputusan → hasil terukur → cuplikan arsitektur (SVG inline).
      Target: 8–12 studi, semuanya dari proyek nyata yang ada.
- [ ] **Halaman "Tentang/Sekarang"** (`/now`): apa yang sedang dikerjakan —
      diperbarui otomatis dari event GitHub terbaru (sudah ada datanya).
- [ ] **Catatan rilis** (`/changelog` situs): render `CHANGELOG.md` repo
      sebagai halaman (markdown → sanitasi DOMPurify, pola `Readme.tsx`).
- [ ] **Galeri demo live**: kartu repo dengan pratinjau screenshot (diambil
      cron `refresh-data` via Playwright, disimpan `public/shots/`) —
      "lihat dulu, klik kemudian".
- [ ] SEO konten: `feed.xml` kategori studi, JSON-LD `Article` per studi,
      sitemap prioritas konten > dasbor.

## FASE 2 — Pengalaman & Aksesibilitas (bulan 2–3)

Tujuan: situs terasa *mudah* untuk siapa pun, termasuk penyandang disabilitas
& perangkat lemah.

- [ ] **Audit WCAG 2.2 AA** penuh (axe-core di CI + manual): kontras label
      mikro (`text-cream/30` → naikkan ke /40+ di elemen informatif), fokus
      terlihat di semua interaktif, target sentuh ≥ 44 px.
- [ ] **Onboarding halus**: hint pertama-kunjung (localStorage) — "Tekan
      `/` untuk mencari, Ctrl+K untuk semua aksi" — 1 kartu kecil, bisa
      ditutup permanen.
- [ ] **PWA offline penuh**: precache shell + halaman populer, halaman
      offline kaya ("yang bisa dibaca offline: …"), `share_target` untuk
      berbagi tautan repo.
- [ ] **Mode densitas data**: toggle "ringkas/padat" di grid repo (pembaca
      cepat vs penjelajah) — disimpan di localStorage.
- [ ] **Terjemahan EN penuh** (toggle sudah ada — lengkapi halaman konten)
      tanpa melanggar prinsip ID-first (EN opt-in, default id).

## FASE 3 — Data & API (bulan 3–5)

Tujuan: situs menjadi **sumber data OSS** yang bisa dipakai orang lain.

- [ ] **API v1 stabil + dokumentasi** (`/api/docs`): halaman interaktif
      (coba endpoint langsung, contoh cURL/JS) untuk `/api/v1/*` yang sudah
      ada (repos, events, uptime, index).
- [ ] **Dataset historis**: cron harian menyimpan ringkasan (jumlah repo,
      stars, kontribusi) ke `data/history/*.json` → grafik pertumbuhan
      di `/system` ("perjalanan 12 bulan").
- [ ] **RSS/JSON feed per kategori & per repo** (berlangganan rilis repo
      tertentu).
- [ ] **Webhook/org sync**: sinkron otomatis kegemaran (stars/watch) —
      tampilkan "diapresiasi oleh" di halaman repo.
- [ ] Evaluasi GraphQL gateway tipis (bukan sebelum API v1 dipakai orang).

## FASE 4 — Observabilitas & Otomasi (bulan 4–6)

Tujuan: situs memantau dirinya sendiri; Anda tahu masalah sebelum pengunjung.

- [ ] **Dasbor Web Vitals** di `/system`: `/api/vitals` sudah menerima
      laporan — kumpulkan ke `data/vitals.json` (cron agregat), tampilkan
      p75 LCP/INP/CLS per rute + tren.
- [ ] **SLA data**: indikator "umur snapshot" di semua halaman data;
      peringatan otomatis (issue GitHub) bila cron gagal 2× berturut.
- [ ] **Canary pasca-deploy**: workflow Actions menendang URL produksi
      setelah deploy (status 200 + judul SSR ID + tanpa `revalidate` di
      route table build log).
- [ ] **Laporan kesehatan mingguan**: issue otomatis ringkas — vitals, uptime,
      umur data, dependensi usang.

## FASE 5 — Interaktivitas & Komunitas (bulan 6+, opsional)

Tujuan: dari "dasbor pribadi" menjadi **etalase komunitas**.

- [ ] **Reaksi & ucapan** (tanpa backend berat: GitHub Discussions sebagai
      penyimpan — atau sekadar "salin pesan dukungan").
- [ ] **Halaman kontributor tamu**: studi kasus komunitas (PR ke repo
      manapun milik pemilik) dengan kurasi manual (file MD).
- [ ] **Newsletter tipis** (sekali sebulan, render dari feed — penyedia
      berbasis GitOps: listmonk/buttondown via API).
- [ ] **Peta ekosistem**: visualisasi graf relasi antar repo (shared topics,
      fork) — data sudah ada, hanya perlu layout (d3-force di canvas 2D —
      pola SceneLite, bukan 3D berat).

---

## Metrik keberhasilan (tinjau bulanan)

| Metrik | Target 3 bln | Target 6 bln |
|---|---|---|
| Lighthouse aksesibilitas | ≥ 95 | 100 (AA lulus audit manual) |
| LCP p75 (medan, data vitals) | < 2,5 dtk | < 2,0 dtk |
| Hidrasi error (CI harian) | 0 | 0 |
| Studi kasus publik | 8 | 12+ |
| Konsumen API v1 eksternal | — | ≥ 3 proyek |
| Umur data maksimum | ≤ 7 hari (cron SLA) | ≤ 3 hari |

## Risiko & mitigasi

| Risiko | Mitigasi |
|---|---|
| Fitur menarik goda ISR kembali | Guard CI: route table wajib statis; komentar #418 di AGENTS.md |
| Konten menumpuk tak terkurasi | Batas: 12 studi terbaik, arsip sisanya di repo |
| API v1 dipakai berlebihan (biaya Vercel) | Cache header sudah ada; tambah rate-limit sederhana bila perlu |
| PWA cache basah pasca-deploy | sw.js versi bump otomatis dari `BUILD_ID` hash (Fase 2) |
| Sandbox/CI RAM kecil | Build Turbopack; export/webpack hanya di mesin ≥ 2 GB lega |

## Riwayat fase sebelumnya (roadmap 2026.1 — selesai/diserap)

Fase 1–3 (fondasi, dashboard, distribusi) dan sebagian 4–8 dari roadmap lama
(lihat `git log 36a8847 -- docs/ROADMAP.md`) telah selesai:

| Fase lama | Status | Nasib di roadmap baru |
|---|---|---|
| 4 — Go-live produksi | ✅ selesai (live di `niumination.web.id`) | — |
| 5 — Konten & data | ⏳ sebagian (studi kasus ada, kalender kontribusi ada) | diserap FASE 1 |
| 6 — Distribusi (widget embed, badge SVG) | belum | kandidat FASE 3 (API publik) |
| 7 — Kualitas (E2E, observabilitas) | ⏳ sebagian (CI, vitals ada) | diserap FASE 0 & 4 |
| 8 — Monetisasi+ | belum, tunggu trafik | di luar roadmap ini |

## Antrian cepat (quick wins, ≤ 1 jam per item)

1. `not-found`: tombol "kembali" (history.back) + saran pencarian.
2. `RepoCard`: tautan "topik" → pencarian ter-filter (`/repositories?q=`).
3. `/status`: legenda warna hari (hijau/merah/kuning) untuk pengunjung baru.
4. CommandMenu: aksi "salin tautan halaman ini".
5. `sw.js`: precache `/_next/static` hashed otomatis via event `install`
   fetch manifest (atau biarkan SWR — sudah aman).
