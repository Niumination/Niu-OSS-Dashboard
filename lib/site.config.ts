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
  // ⚠️ Ganti dengan kontak asli Anda sebelum publish.
  email: process.env.CONTACT_EMAIL ?? 'halo@niumination.dev',
  whatsapp: process.env.WHATSAPP_NUMBER ?? '6281200000000',

  sponsors: 'https://github.com/sponsors/Niumination',
  buyMeACoffee: 'https://buymeacoffee.com/niumination',

  midtransClientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '',
  stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? '',

  /** Repo yang ditampilkan di bagian Featured (Overview). */
  featuredRepos: [
    'PemdiAcehTengah',
    'Flame-ADE',
    'mata-aihackfest-2026',
    'niu-dash',
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
