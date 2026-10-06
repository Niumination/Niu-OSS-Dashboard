/**
 * Otak NIU-Bot — asisten CS di widget chat (route /api/chat/bot).
 *
 * Dua lapis jawaban:
 *  1) Aturan FAQ deterministik — cepat, gratis, dan dijamin tak berhalusinasi;
 *     harga & kontak DIBANGUN dari lib/site.config (satu sumber kebenaran,
 *     otomatis sinkron bila paket jasa berubah).
 *  2) Opsional: LLM BYOK (endpoint OpenAI-compatible) untuk pertanyaan bebas —
 *     aktif hanya jika LLM_API_KEY terisi; gagal/timeout -> kembali ke FAQ.
 *     Selaras dengan filosofi #byok ekosistem proyek.
 */
import { SERVICE_PACKAGES, SITE } from '@/lib/site.config';
import type { Locale } from '@/lib/i18n';

export interface BotReply {
  text: string;
}

interface Rule {
  match: RegExp;
  build: (l: Locale) => string;
}

const idr = new Intl.NumberFormat('id-ID');
const SERVICES_URL = `${SITE.github.replace('github.com/Niumination', 'niumination.web.id')}/services`;

function servicesText(l: Locale): string {
  const lines = SERVICE_PACKAGES.map((p) => `• ${p.name} — Rp ${idr.format(p.price)} ${p.unit}`);
  return l === 'id'
    ? `Tiga layanan utama:\n${lines.join('\n')}\nDetail & tombol "Mulai proses": ${SERVICES_URL}`
    : `Three main services:\n${lines.join('\n')}\nDetails & kick-off button: ${SERVICES_URL}`;
}

const RULES: Rule[] = [
  {
    match: /\b(halo|hai|hello|hi|hei|pagi|siang|sore|malam|assalamu|hey)\b/i,
    build: (l) =>
      l === 'id'
        ? 'Halo! Saya NIU-Bot, asisten otomatis niumination 🤖 Bisa bantu soal: jasa & harga, donasi open source, portofolio/repo, atau cara menghubungi pemilik. Mau tanya apa?'
        : "Hi! I'm NIU-Bot, niumination's assistant 🤖 I can help with: services & pricing, open-source donations, portfolio/repos, or reaching the owner. What do you need?",
  },
  {
    match: /\b(jasa|layanan|harga|biaya|price|pricing|tarif|paket|service|cost)/i,
    build: servicesText,
  },
  {
    match: /\b(konsultasi|consult|consultation)/i,
    build: (l) => {
      const p = SERVICE_PACKAGES.find((s) => s.id === 'konsultasi') ?? SERVICE_PACKAGES[0];
      return l === 'id'
        ? `${p.name}: ${p.blurb} — Rp ${idr.format(p.price)}${p.unit}. Brief awal gratis, mulai dari tombol "Mulai proses" di halaman jasa.`
        : `${p.name}: one focused hour on code, architecture, or AI tooling — IDR ${idr.format(p.price)}${p.unit}. Initial brief is free; start from the services page.`;
    },
  },
  {
    match: /\b(audit|optimasi|optimization)/i,
    build: (l) => {
      const p = SERVICE_PACKAGES.find((s) => s.id === 'audit');
      const price = p ? ` Rp ${idr.format(p.price)}${p.unit}` : '';
      return l === 'id'
        ? `Audit & Optimasi:${price} — aplikasi Anda dibedah dari performa, keamanan, sampai SEO; pulangannya daftar temuan berprioritas yang benar-benar dikerjakan, bukan PDF yang disimpan lupa.`
        : `Audit & Optimization:${price} — your app dissected across performance, security, and SEO; you get a prioritized finding list that actually gets executed.`;
    },
  },
  {
    match: /\b(donasi|donate|sponsor|kopi|coffee|dukung|support|tip)/i,
    build: (l) =>
      l === 'id'
        ? `Semua kode di situs ini gratis — donasi membayar server & domain ☕\n• GitHub Sponsors: ${SITE.sponsors}\n• Buy Me a Coffee: ${SITE.buyMeACoffee}`
        : `All code here is free — donations pay for servers & the domain ☕\n• GitHub Sponsors: ${SITE.sponsors}\n• Buy Me a Coffee: ${SITE.buyMeACoffee}`,
  },
  {
    match: /\b(flame|ade|terminal|tauri)/i,
    build: (l) =>
      l === 'id'
        ? 'Flame-ADE: emulator terminal AI-native ~7 MB — Tauri 2 + Rust + React 19, BYOK AI, tanpa telemetri. Studi kasus: https://niumination.web.id/studies/flame-ade'
        : 'Flame-ADE: an AI-native ~7 MB terminal emulator — Tauri 2 + Rust + React 19, BYOK AI, no telemetry. Case study: https://niumination.web.id/studies/flame-ade',
  },
  {
    match: /\b(repo|github|portofolio|portfolio|proyek|project|oss|open source|code|kode)\b/i,
    build: (l) =>
      l === 'id'
        ? `90-an repositori publik: https://niumination.web.id/repositories — portal pemda, terminal AI 7 MB, sampai dotfiles Arch. Sumber: ${SITE.github}`
        : `90+ public repos: https://niumination.web.id/repositories — gov portals, a 7 MB AI terminal, Arch dotfiles. Source: ${SITE.github}`,
  },
  {
    match: /\b(kontak|hubungi|contact|email|whatsapp|\bwa\b|telepon|phone)/i,
    build: (l) =>
      l === 'id'
        ? `Cara tercepat: klik tombol "Sambungkan ke manusia" 👤 di header chat ini, atau email ${SITE.email} / WA wa.me/${SITE.whatsapp}. Tombol "Mulai proses" di /services juga tersambung ke sana.`
        : `Fastest way: hit the "Talk to a human" 👤 button in this chat header, or email ${SITE.email} / WA wa.me/${SITE.whatsapp}. The kick-off button on /services leads there too.`,
  },
  {
    match: /\b(manusia|human|admin|operator|orang|owner|pemilik|cs|person)\b/i,
    build: (l) =>
      l === 'id'
        ? 'Siap — klik tombol "Sambungkan ke manusia" 👤 di header chat. Setelah itu pesan Anda diteruskan langsung ke pemilik (balasan tidak real-time, tapi pasti dibaca).'
        : 'Sure — click the "Talk to a human" 👤 button in the chat header. Your messages then go straight to the owner (not real-time, but always read).',
  },
];

const FALLBACK: Record<Locale, string> = {
  id: 'Hmm, itu di luar FAQ saya 😅 Coba tanya soal: jasa/harga, donasi, repo GitHub, atau kontak. Untuk hal spesifik, klik "Sambungkan ke manusia" 👤.',
  en: 'Hmm, that\'s beyond my FAQ 😅 Try asking about: services/pricing, donations, GitHub repos, or contact. For specifics, hit "Talk to a human" 👤.',
};

const RATE_NOTICE: Record<Locale, string> = {
  id: 'Anda mengirim pesan cukup cepat — saya jeda sebentar ya. Kalau urgent, klik "Sambungkan ke manusia" 👤 atau email langsung.',
  en: "You're sending messages quite fast — I'll pause for a bit. If urgent, hit \"Talk to a human\" 👤 or email directly.",
};

/** Deteksi bahasa tamu yang sangat sederhana (cukup untuk bot FAQ). */
export function detectLocale(text: string): Locale {
  const t = text.toLowerCase();
  const enHints = /\b(hello|hi|hey|price|pricing|service|services|repo|repos|github|donate|donation|contact|human|thank)/;
  if (enHints.test(t)) return 'en';
  return 'id';
}

export function rateNotice(locale: Locale): string {
  return RATE_NOTICE[locale];
}

// ---------- LLM BYOK opsional (OpenAI-compatible) ----------
const SYSTEM_PROMPT = `Kamu adalah NIU-Bot, asisten customer service situs portofolio niumination.web.id
(milik developer open source Indonesia, github.com/Niumination).
Jawab singkat (maks 4 kalimat), ikuti bahasa penanya (id/en), jujur, jangan mengarang.
Fakta: layanan = ${SERVICE_PACKAGES.map((p) => `${p.name} Rp${idr.format(p.price)}${p.unit}`).join(', ')} (halaman /services);
donasi via ${SITE.sponsors} & ${SITE.buyMeACoffee}; ~90 repo publik open source; kontak ${SITE.email} / wa.me/${SITE.whatsapp}.
Jika tidak tahu atau diminta hal sensitif, sarankan tombol "Sambungkan ke manusia".`;

async function llmAnswer(question: string): Promise<string | null> {
  const base = process.env.LLM_BASE_URL;
  const key = process.env.LLM_API_KEY;
  if (!base || !key) return null; // BYOK tidak diset -> lewati
  const model = process.env.LLM_MODEL ?? 'gpt-4o-mini';

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        max_tokens: 220,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: question.slice(0, 1000) },
        ],
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return json.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

// ---------- Titik masuk utama ----------
export async function answerVisitor(question: string, locale?: Locale): Promise<BotReply> {
  const l = locale ?? detectLocale(question);
  const q = question.trim();

  // 1) FAQ — jawaban faktual tak pernah berhalusinasi
  for (const r of RULES) if (r.match.test(q)) return { text: r.build(l) };

  // 2) Pertanyaan bebas -> LLM BYOK bila tersedia
  const llm = await llmAnswer(q);
  if (llm) return { text: llm };

  // 3) Fallback
  return { text: FALLBACK[l] };
}
