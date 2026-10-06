# Chat CS — Tencent RTC Chat (fitur 2026.18)

Widget chat pengunjung dengan bot CS (**NIU-Bot**: FAQ + AI BYOK opsional) dan
eskalasi ke manusia (inbox pemilik di `/cs`). Backend **Tencent RTC Chat** paket
gratis: 1.000 MAU/bulan selamanya, tanpa kartu kredit, semua fitur inti + push.

Fitur ini **nonaktif total** sampai `NEXT_PUBLIC_TRTC_SDK_APP_ID` diisi
(widget me-render `null`) — aman digabung ke main sebelum kredensial disiapkan.

## Arsitektur

```
Pengunjung ─► <ChatWidget/>  (SDK di-lazy-load saat bubble pertama dibuka)
   │ ① GET /api/chat/usersig  -> UserSig guest_* (TLSSigAPIv2, lib/trtc/signature)
   │ ② login guest_*, kirim pesan ke akun bot (niu_bot)
   ▼
Tencent IM ─► callback C2C.CallbackAfterSendMsg ─► POST /api/chat/bot
                                                     │ ③ aturan FAQ (site.config)
                                                     │    └─ opsional: LLM BYOK
                                                     ▼ ④ REST sendmsg (bot membalas)
                                                  adminapi.trtc.io/v4/openim/sendmsg
Eskalasi: tombol "Sambungkan ke manusia" -> pesan tamu ke akun niu_owner
Pemilik  : /cs -> POST /api/chat/owner-sig (gerbang CS_ADMIN_TOKEN) -> inbox
```

## Setup awal (±30 menit)

1. **Claim paket gratis** — <https://trtc.io/login?s_url=https://console.trtc.io?quickclaim=chat_trial>
   → buat aplikasi **Chat** → catat **SDKAppID** + **SDKSecretKey** (menu App Info).
2. **Buat akun** — console → Chat → **Users**: buat `niu_bot` dan `niu_owner`
   (akun `administrator` bawaan untuk REST API).
3. **Env Vercel** — isi semua variabel bagian *Chat CS* di `.env.example`
   (server-only TANPA prefix: `TRTC_SDK_SECRET_KEY`, `CS_ADMIN_TOKEN`).
   Buat token: `openssl rand -hex 32`.
4. **Callback** — console → Chat → **Callback Configuration** → aktifkan
   *C2C.CallbackAfterSendMsg* → URL `https://niumination.web.id/api/chat/bot`.
5. **Lokal**: salin env ke `.env.local`, `npm i`, `npm run dev`.

## Uji cepat

| Uji | Harapan |
|---|---|
| Buka bubble → kirim "harga jasa" | NIU-Bot membalas 3 paket dari `site.config` |
| Kirim "thank you" / teks Inggris | Bot menjawab English (deteksi locale) |
| Klik "Sambungkan ke manusia" → kirim | Pesan masuk daftar di `/cs` |
| `/cs` + CS_ADMIN_TOKEN → pilih tamu → balas | Balasan tampil di widget tamu |
| `GET /api/chat/usersig?userId=niu_owner` | 403 — sig non-tamu ditolak |
| Bubble ditutup, bot membalas | Badge unread muncul di tombol 💬 |

## Keputusan desain (alasan, bukan sekadar apa)

- **Bot via webhook + REST, bukan SDK 24/7** — serverless Vercel tidak bisa
  memegang koneksi SDK sebagai akun bot; pola ini $0 dan skala otomatis.
- **Route usersig hanya mengenal `guest_*`** — pubik boleh minta sig tamu
  (memang perlu), tapi penyamaran sebagai owner/bot tertutup total. Sig owner
  hanya lewat `/api/chat/owner-sig` yang digerbang token + rate limit ketat.
- **Jawaban bot dibangun dari `lib/site.config`** — harga paket di bot tidak
  akan basi saat Anda mengubah `SERVICE_PACKAGES`.
- **SDK chat di-lazy-load** — JS initial situs tidak bertambah (temuan budget
  bundel AUDIT-2026.17). Yang termuat di semua halaman hanya shell ~3 KB.
- **`sw.js` v4 mengecualikan `/api/*`** — usersig/pay/webhook tidak pernah
  masuk cache stale-while-revalidate (respons personal).
- **CSP** masih report-only: host `*.trtc.io` + `*.im.qcloud.com` sudah
  ditambahkan ke `connect-src`; pantau `/api/csp-report` 1–2 minggu sebelum
  enforcement (§CSP docs/PANDUAN-OPS.md).

## Operasional

- **Kuota**: 1.000 MAU/bulan (akun `guest_*` unik). Sisa aman untuk skala
  portofolio; pantau di console → Chat → Usage.
- **Riwayat**: roaming pesan paket gratis terbatas (umumnya 7 hari) — percakapan
  lama hilang di kedua sisi; eskalasi penting tetap bisa ke email/WA.
- **Biaya LLM**: BYOK opsional; rate limit bot 12 pesan/menit/tamu membatasi
  panggilan. Tanpa `LLM_API_KEY`, biaya AI = Rp 0.
- **Rate limit**: in-memory per instance secara default. Untuk global lintas
  instance, isi `UPSTASH_REDIS_REST_URL/TOKEN` (lihat `lib/ratelimit.ts`).
- **Log**: balasan bot gagal / webhook aneh → `console.error('[chat/bot]…')`
  di Vercel → Observability.
- **Menonaktifkan fitur**: hapus `NEXT_PUBLIC_TRTC_SDK_APP_ID` → widget hilang;
  route API tetap aman (503 tanpa secret).

## Batasan & tindak lanjut (backlog)

- Token sesi `/cs` di `sessionStorage` (per tab); tidak ada multi-admin.
- UIKit React resmi (`@tencentcloud/chat-uikit-react`) belum dipakai — locale
  bawaan EN/ZH saja; widget kustom kita dwibahasa. Pertimbangkan UIKit bila
  butuh fitur penuh (grup, thread, reaksi) suatu hari.
- Push notifikasi ke pemilik belum ada — saat ini cek `/cs` manual; opsi:
  webhook bot → email/Telegram saat ada pesan manusia baru.
- Moderasi konten Tencent (Text Moderation) bisa diaktifkan di console tanpa
  ubah kode.
