# Roadmap Pengembangan — Niumination OSS Dashboard

> Dokumen hidup — diperbarui tiap fase. Riwayat yang sudah selesai ada di
> [CHANGELOG.md](../CHANGELOG.md). Prinsip: **kirim kecil-kecil, terukur, dan
> terlacak** — setiap fase punya kriteria terima yang bisa diverifikasi.

## Kondisi saat ini (baseline)

- Situs production-ready: landing + dashboard, i18n ID/EN penuh (kecuali
  PaymentModal yang memang lokal), PWA, API publik v1, QR share, observabilitas
  (Web Vitals + Lighthouse mingguan), 41 unit test, CI 4 workflow.
- Target deploy: **Vercel + domain `niumination.web.id`** (idwebhost).
- Data: snapshot GitOps (mingguan) + uptime (15 menit) + API statis (101 file).

---

## Fase 4 — Go-live produksi ⏭ prioritas berikutnya

**Tujuan**: situs live di `https://niumination.web.id`, terpantau, terukur.

**Lingkup**
1. Deploy Vercel (lihat README → *Deployment A*) + pasang domain idwebhost
   (A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`).
2. Set env produksi: `SITE_URL`, `GITHUB_TOKEN`, kunci Midtrans/Stripe, kontak.
3. Tambah `niumination.web.id` ke daftar pemeriksaan uptime
   (`scripts/uptime-check.mjs` — daftar situs selain repo homepage).
4. Baseline observabilitas: catat p50/p95 dari `/api/vitals` (1 minggu) dan
   skor Lighthouse pertama di domain produksi.

**Kriteria terima**
- [ ] Semua rute utama 200 di domain (+ SSL A-grade, redirect www→apex atau sebaliknya).
- [ ] `sitemap.xml`, `robots.txt`, `feed.xml`, OG image, `/api/v1/*` valid di domain.
- [ ] Uptime 11/11 situs terpantau (10 repo + domain utama).
- [ ] Web Vitals & Lighthouse tercatat minimal 1 siklus penuh.

**Estimasi**: ~1 hari kerja (+ menunggu propagasi DNS).
**Risiko & mitigasi**: record DNS lama idwebhost bertabrakan → hapus parking
record; .web.id butuh verifikasi identitas → pastikan domain aktif ≥ 1 tahun.

---

## Fase 5 — Konten & data (1–2 minggu)

**Tujuan**: konten makin dalam, data makin live.

**Lingkup**
1. **Studi kasus MDX**: migrasi `data/studies.json` → konten MDX berkomponen
   (callout, snippet kode, tabel metrik, screenshot). Tetap tanpa CMS — MDX
   in-repo, fallback JSON dipertahankan untuk API.
2. **Kalender kontribusi live**: `GITHUB_TOKEN` di Vercel mengaktifkan GraphQL
   `contributionsCalendar` 12 bulan (sudah tersedia; tinggal set env + verifikasi).
3. **Overlay EN deskripsi repo tuntas**: audit 67 deskripsi ber-bahasa, tambah
   padanan EN yang belum ada (saat ini 12).
4. **Halaman "Uses"** (opsional): setup perkakas — bernilai SEO & relatable.

**Kriteria terima**
- [ ] 3 studi kasus dirender dari MDX dengan minimal 1 snippet + 1 visual per studi.
- [ ] Panel /system menampilkan kalender 12 bulan dari GraphQL (bukan fallback).
- [ ] Semua deskripsi repo berbahasa Indonesia punya `descriptionEn`.

**Estimasi**: 1–2 minggu (dominan penulisan konten).
**Risiko**: MDX menambah dependensi & waktu build → ukur delta build; batasi
komponen MDX pada whitelist kecil.

---

## Fase 6 — Distribusi & interaktivitas (2–3 minggu)

**Tujuan**: konten situs bisa hidup di luar situs.

**Lingkup**
1. **Widget embed repo**: rute `/embed/repo/[slug]` (iframe-friendly, tanpa
   chrome) + cuplikan `<iframe>` di halaman repo — kartu repo bisa dipasang di
   blog/situs orang lain.
2. **Badge SVG ala shields.io**: `/api/badge/stars/{repo}.svg`,
   `/api/badge/uptime/{repo}.svg` — cache 1 jam; dipakai README repo GitHub.
3. **QR kartu nama digital**: `/share` — vCard (.vcf) + QR besar + tautan
   kontak; QR halaman utama di footer.
4. **OG dinamis per studi kasus** (file convention, seperti repo).

**Kriteria terima**
- [ ] Widget embed tervalidasi di 1 halaman eksternal (mis. profil README).
- [ ] Badge terpasang di minimal 3 README repo GitHub (terverifikasi render).
- [ ] `/share` menghasilkan unduhan .vcf yang dikenali iOS/Android.

**Estimasi**: 2–3 minggu.
**Risiko**: abuse hotlinking badge → rate-limit ringan via cache header +
`s-maxage`; embed dibatasi `X-Frame-Options` TIDAK di-set (memang sengaja).

---

## Fase 7 — Kualitas & otomasi (paralel, berkelanjutan)

**Tujuan**: perubahan dijamin tidak merusak; insiden terdeteksi cepat.

**Lingkup**
1. **E2E Playwright**: alur kritis — toggle bahasa, cari repo → detail → QR,
   /status render, donate-flow (mode sandbox Midtrans/Stripe), offline PWA.
2. **Lighthouse per-PR** (naikkan dari mingguan): gagal = blok merge.
3. **Sentry penuh**: `SENTRY_DSN` + sourcemap upload; alert ke email/Telegram.
4. **Baseline performa**: anggaran bundel di CI (size-limit) untuk JS route utama.

**Kriteria terima**
- [ ] CI (test → typecheck → e2e → lighthouse) hijau/merah < 10 menit.
- [ ] Insiden simulasi (error route) tercatat di Sentry + notifikasi masuk.

**Estimasi**: 3–4 hari setup awal, lalu pemeliharaan.
**Risiko**: runtime e2e di CI bikin lambat → jalankan hanya pada path kritis +
paralelisasi matrix.

---

## Fase 8 — Monetisasi lanjutan (setelah ada trafik/permintaan)

**Tujuan**: pendapatan berulang dari aset yang sudah ada.

**Lingkup**
1. **Produk digital**: dotfiles pack premium (instalasi terpandu), e-book
   "AI tooling untuk tim kecil" — checkout Midtrans + kirim otomatis via email.
2. **Portal klien ringan**: halaman status proyek per-klien
   (`/klien/{token}`) — progres, deliverable, invoice (read-only, tanpa auth berat).
3. **Invoice otomatis**: PDF + pembayaran + pengingat (Xendit/Midtrans).

**Kriteria terima**
- [ ] 1 transaksi produk digital end-to-end (bayar → terima file).
- [ ] 1 klien nyata memakai portal proyek selama 1 sprint.

**Estimasi**: 3–4 minggu.
**Risiko**: beban support → batasi SKU awal; jangan bangun portal penuh sebelum
ada 2 klien.

---

## Backlog riset (tidak terjadwal)

| Ide | Catatan |
|-----|---------|
| **PPR** | Aktifkan hanya setelah p50/p95 `/api/vitals` di Vercel terukur; pola shell-statis sudah ada. |
| **Gamifikasi** | Streak kontribusi + badge pencapaian di profil publik. |
| **i18n PaymentModal** | Hanya bila ada permintaan klien EN nyata (alur saat ini memang lokal). |
| **Komentar studi kasus** | Giscus (GitHub Discussions) — tanpa server. |
| **Analitik privasi-first** | Plausible/Umami self-host bila butuh data trafik. |

---

## Cara kerja per fase

1. Ambil satu fase → pecah jadi issue/checkbox di dokumen ini.
2. Kerjakan di branch `fase-N` → PR → CI hijau → merge.
3. Perbarui CHANGELOG (entri + hash commit) dan tabel status di README.
4. Tandai kriteria terima ✅ di dokumen ini (jejak keputusan tetap terbaca).
