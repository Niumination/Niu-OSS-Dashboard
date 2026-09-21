# Panduan Ops — Bagian Anda (pasca-audit 2026.5)

**Untuk:** pemilik proyek · **Dari:** agen Arena (patch 2026.7)
Semua tugas di bawah ini butuh akses dashboard (GitHub/Vercel)
yang hanya Anda pegang. Perkiraan waktu total: ±30 menit.

---

## ⚠️ Aturan emas sinkronisasi Git (WAJIB, dibaca dulu)

**Jangan pernah force-push ke `main`. Selalu `git pull --rebase` sebelum push.**

Insiden 20–21 Sep 2026: 5 run cron uptime **berhasil commit & push**,
tetapi komitnya ter-"orphan" (terpotong dari silsilah) karena patch
diterapkan dari snapshot lama lalu di-push menimpa `main`. Akibatnya
data uptime beku ±26 jam dan domain produksi sempat tak terpantau.
Kronologi lengkap + bukti `head_sha`: lihat CHANGELOG [2026.8].

Saat menerapkan patch dari agen (Hermes/di lokalan):

```bash
git fetch origin
git rebase origin/main        # atau: git pull --rebase
git am 0001-*.patch           # kalau konflik → fetch ulang, minta patch baru
git push                      # BUKAN --force
```

Kalau push ditolak (non-fast-forward): **jangan paksa** — `git pull
--rebase` dulu, selesaikan, baru push. Kebiasaan ini menjaga komit
cron (uptime + snapshot mingguan) tetap hidup di `main`.

---

## A. T1 — Set `GITHUB_TOKEN` di Vercel (±10 menit, efek terbesar)

**Masalah:** build Vercel memanggil GitHub API tanpa token → kuota 60
permintaan/jam dipakai bareng IP Vercel → hampir selalu rate-limit →
data jatuh ke snapshot cadangan. Dengan token: 5.000/jam, **data segar
setiap deploy**.

1. **GitHub** → Settings → Developer settings → **Personal access tokens**
   → *Fine-grained tokens* → Generate new token:
   - Token name: `niu-oss-vercel-build`
   - Expiration: mis. 90 hari (kalender pengingat untuk rotate!)
   - Repository access: **Public repositories (read-only)** — cukup
   - Permissions: tidak perlu menambah apa pun (repo publik read-only
     sudah default untuk akses metadata + contents via REST).
2. Salin token (hanya tampil sekali).
3. **Vercel** → Project `niu-oss` → Settings → **Environment Variables**:
   - Key: `GITHUB_TOKEN` · Value: (token) · Environments: **Production**
   (Preview/Development tidak perlu).
4. Sekalian bersihkan env lama yang sudah tidak dibaca kode:
   hapus `CONTACT_EMAIL` & `WHATSAPP_NUMBER` (jika ada).
5. **Deployments** → latest → ⋯ → **Redeploy** (tanpa cache juga boleh).
6. Verifikasi (2 menit): `curl -s https://niumination.web.id/api/github/summary`
   → harus "live": true, "source": "github-api".

> **⚠️ Pitfall GITHUB_OWNER kosong (22 Sep 2026, `9c820d3`):** jika env
> `GITHUB_OWNER` di Vercel di-set ke **string kosong** (bukan dihapus),
> operator `??` tidak menggantikannya (hanya null/undefined yang
> digantikan) → `OWNER = ''` → semua fetch `/users//repos` 404 →
> **fallback-cache permanen, terlepas dari token**. Pola aman:
> `process.env.GITHUB_OWNER?.trim() || 'Niumination'` (sama seperti
> `NEXT_PUBLIC_CONTACT_*` di `lib/site.config.ts`).
>
> **Diagnosa cepat:** bikin route debug sementara yang panggil
> `getGithubSnapshot({ live: true })` dan cetak `process.env.GITHUB_OWNER`
> + `process.env.GITHUB_TOKEN`. Kalau `owner: ""` → ini masalahnya.

## B. Varian `www` (opsional, ±5 menit)

Kondisi terverifikasi (21 Sep 2026): `www.niumination.web.id` punya A record
di zona DNS (Vercel DNS), tetapi **sertifikat SSL hanya CN apex** — akses
`https://www…` gagal cert-mismatch. Karena zona DNS sudah dikelola Vercel,
pengaturannya cukup dari dashboard (tanpa menyentuh panel domain mana pun):

1. **Vercel** → Project `niu-oss` → Settings → **Domains** →
   Add `www.niumination.web.id`.
2. Pilih opsi **redirect ke** `niumination.web.id` (disarankan — satu
   kanonik, tidak dobel konten).
3. Vercel otomatis menerbitkan sertifikat untuk `www` (menit–jam).
4. Verifikasi: `curl -sI https://www.niumination.web.id` →
   `308 → https://niumination.web.id`.

Tidak wajib — apex saja sudah sah untuk SEO (canonical sudah apex).

## C. T2 — CSP: cara membaca laporan & kapan enforce

Patch 2026.7 sudah memasang `Content-Security-Policy-Report-Only` +
endpoint `/api/csp-report`. **Tidak ada yang diblokir** — fase ini hanya
mengumpulkan data pelanggaran.

1. **Vercel** → Project → **Logs** (atau Observability → Functions) →
   filter `csp`. Setiap pelanggaran tampil:
   `[csp] <direktif> blocked=<sumber> doc=<halaman>`.
2. Pantau 2–4 minggu. Yang wajar muncul:
   - `script-src ... blocked=https://app.midtrans.com/...` saat uji
     pembayaran → sudah di-allowlist, aman.
   - Pelanggaran dari ekstensi browser Anda sendiri (doc = halaman,
     blocked aneh) → abaikan.
   - `connect-src` ke `*.vercel-insights.com` bila Analytics diaktifkan
     (lihat D) → sudah di-allowlist.
3. **Enforce** (setelah bersih / hanya noise ekstensi):
   edit `next.config.ts` → ganti key
   `Content-Security-Policy-Report-Only` → `Content-Security-Policy`
   (nilai persis sama), commit, deploy. Setelah enforce, pantau Logs
   1–2 hari lagi.
4. Uji hasil: [securityheaders.com](https://securityheaders.com) →
   masukkan `https://niumination.web.id` → target minimal A.

## D. Observabilitas tambahan (opsional, ±5 menit)

- **Vercel Analytics + Speed Insights**: Project → Settings →
  **Analytics** / **Speed Insights** → aktifkan. Field CWV pengguna nyata
  (CrUX-like) tampil di tab terkait — melengkapi `/api/vitals` internal.
  Allowlist CSP sudah disiapkan untuk ini.
- **Sentry** (menunggu saja, jangan sekarang): gratis untuk OSS di
  sentry.io → untuk error tracking produksi penuh (ROADMAP F7).

## E. Ritual verifikasi setiap kali deploy

```bash
# setelah setiap deploy patch dari saya:
E2E_BASE_URL=https://niumination.web.id node tests/e2e/hydration.mjs
# ekspektasi: 12/12 ✓ (kalau ada ✗, kabari saya dengan output lengkap)
```

## F. Status antrian audit (posisi sekarang)

| Item | Status |
|---|---|
| T1 GITHUB_TOKEN | ✅ SELESAI (22 Sep 2026) — live: true, source: github-api. Token fine-grained github_pat_11A5P + fix GITHUB_OWNER kosong (9c820d3) |
| T2 CSP | ✅ fase 1 report-only terpasang (2026.7) · enforce = panduan C |
| T3 React 19.3 + View Transitions | ⏳ menunggu `@react-three/fiber` rilis dukungan `react 19.3` (cek: `npm view @react-three/fiber peerDependencies.react`) |
| T4 Bundle audit | ✅ selesai 2026.7: initial `/` 915 KB · three.js 882 KB lazy ✓ · kandidat pangkas terbesar = framer-motion+cmdk 248 KB (via T3) |
| T5 Tailwind 4 | proyek terpisah (jangan digabung patch lain) |
| T6 SEO schema | ✅ SoftwareSourceCode + BreadcrumbList terpasang (2026.5–2026.7) |
| T7 Observabilitas | sebagian (uptime domain ✓, /api/vitals ✓) · Analytics = panduan D |
| T8 backlog | lihat BACKLOG.md |

## G. Hal-hal kecil yang bisa ditanyakan kapan saja

- Rotate token GITHUB_TOKEN (tiap 90 hari) — ulang langkah A.
- Cek uptime domain: `https://niumination.web.id/status` (situs utama
  selalu baris pertama sejak patch 2026.6).
- Migrasi Tailwind 4 / Sentry / MDX studi — bilang saja, saya siapkan
  patch-nya.
