/**
 * Konfigurasi situs — satu-satunya tempat yang perlu disentuh untuk mengubah
 * identitas, link sosial, harga paket jasa, dan repo unggulan.
 */

export const SITE = {
  name: 'Niumination',
  handle: 'Niumination',
  github: 'https://github.com/Niumination',
  avatar: 'https://avatars.githubusercontent.com/u/123625275?v=4',
  tagline: 'Sistem terbuka, dibangun di depan umum.',
  description:
    'Full-stack developer & AI tooling engineer dari Aceh Tengah — civic tech, terminal-native AI, dan dotfiles yang benar-benar boot. 91 repositori publik, kerja dalam public.',
  location: 'Aceh Tengah, Indonesia',
  // Kontak & WhatsApp WAJIB memakai NEXT_PUBLIC_* dengan fallback `||`:
  // SITE diimpor AppShell/CommandMenu/PaymentModal (client) DAN komponen server.
  // Env tanpa prefix NEXT_PUBLIC_ di-inline sebagai `undefined` di bundel klien,
  // sehingga `CONTACT_EMAIL=""` di Vercel membuat server merender `mailto:` kosong
  // sementara klien memakai fallback → hydration mismatch React #418 (seluruh
  // halaman diregenerasi klien). `?.trim() ||` juga menutup nilai string kosong.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'halo@niumination.dev',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || '6281200000000',

  sponsors: 'https://github.com/sponsors/Niumination',
  buyMeACoffee: 'https://buymeacoffee.com/niumination',

  midtransClientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '',
  stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? '',

  /** Repo yang ditampilkan di bagian Featured (Overview).
   *  Disinkronkan dengan daftar proyek hero di repo profil
   *  (niumination/niumination, "sinkronisasi kondisi ekosistem 20 Sep 2026"). */
  featuredRepos: [
    'PemdiAcehTengah',
    'niu-dash',
    'Flame-ADE',
    'Niu-LKH',
  ],

  /** Nominal donasi cepat (IDR). */
  donationAmounts: [25000, 50000, 100000, 250000],
} as const;

export interface ServicePackage {
  id: string;
  name: string;
  icon: 'consult' | 'audit' | 'custom';
  price: number;
  unit: string;
  blurb: string;
  features: string[];
  highlight?: boolean;
}

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'konsultasi',
    name: 'Konsultasi Teknis',
    icon: 'consult',
    price: 750_000,
    unit: '/ sesi 60 menit',
    blurb: 'Sesi fokus 1-on-1 untuk kode, arsitektur, atau setup AI tooling tim Anda.',
    features: [
      'Code review mendalam (PR / repo)',
      'Rekomendasi arsitektur & pilihan stack',
      'Setup AI tooling (agent, CLI, otomasi)',
      'Dokumentasi ringkas hasil sesi',
    ],
  },
  {
    id: 'audit',
    name: 'Audit & Optimasi',
    icon: 'audit',
    price: 2_500_000,
    unit: '/ proyek',
    blurb: 'Pembedah total aplikasi Anda: performa, keamanan, SEO — plus peta perbaikannya.',
    features: [
      'Audit performance, security & SEO',
      'Laporan temuan ber-prioritas',
      'Rencana perbaikan bertahap (roadmap)',
      '1 sesi review hasil audit bersama',
    ],
    highlight: true,
  },
  {
    id: 'custom',
    name: 'Aplikasi Web Custom',
    icon: 'custom',
    price: 7_500_000,
    unit: '/ mulai dari',
    blurb: 'Dari brief sampai live di Vercel — dashboard, portal, atau aplikasi web lengkap.',
    features: [
      'Dari brief sampai deploy (Vercel)',
      'Next.js / TypeScript, cepat & aksesibel',
      'Dashboard, API, auth siap pakai',
      '30 hari support pasca-launch',
    ],
  },
];
