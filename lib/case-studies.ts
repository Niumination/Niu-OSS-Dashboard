/*
 * Studi kasus — konten in-repo (tanpa CMS), berbasis fakta repositori nyata.
 * Struktur: masalah -> pendekatan -> hasil. Dipakai /studies & /studies/[slug].
 */

export interface CaseStudy {
  slug: string;
  title: string;
  tagline: string;
  kind: string;
  year: string;
  repo: string;
  demo?: string;
  stack: string[];
  metrics: Array<{ label: string; value: string }>;
  problem: string;
  approach: Array<{ title: string; text: string }>;
  outcome: string;
  accent: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'pemdi-aceh-tengah',
    title: 'Pemdi Aceh Tengah',
    tagline: 'Portal pemerintah digital untuk kabupaten di dataran tinggi Gayo.',
    kind: 'Civic Tech',
    year: '2024–2026',
    repo: 'PemdiAcehTengah',
    demo: 'https://pemdi-aceh-tengah.vercel.app',
    stack: ['JavaScript', 'Vercel', 'Static-first'],
    metrics: [
      { label: 'halaman layanan', value: 'lengkap' },
      { label: 'biaya hosting', value: 'Rp 0' },
      { label: 'pembaruan', value: 'aktif' },
    ],
    problem:
      'Informasi layanan publik kabupaten tersebar di banyak tempat dan sulit dijangkau warga. Portal resmi membutuhkan infrastruktur berbayar dan alur konten yang berat untuk dioperasikan satu orang — sementara kebutuhan sebenarnya: cepat, ringan, dan bisa dirawat dari mana saja.',
    approach: [
      {
        title: 'Static-first, deploy gratis',
        text: 'Seluruh halaman dirender statis lalu di-host di Vercel — biaya nol, waktu muat cepat, dan tahan lonjakan trafik saat momen layanan ramai (penerimaan, cut bersama).',
      },
      {
        title: 'Konten terstruktur in-repo',
        text: 'Konten layanan hidup sebagai berkas dalam repositori — perubahan lewat git, terlacak siapa mengubah apa, bisa dikoreksi siapa saja lewat pull request.',
      },
      {
        title: 'Aksesibilitas daratan tinggi',
        text: 'Desain hemat kuota: tanpa pustaka berat, gambar terkompresi, dan tetap terbaca di koneksi lambat — khas jaringan dataran tinggi Gayo.',
      },
    ],
    outcome:
      'Portal non-resmi yang menjadi rujukan praktis layanan digital kabupaten, dirawat berkala, dan membuktikan pola "pemerintahan digital tanpa anggaran besar" yang bisa direplikasi kabupaten lain.',
    accent: '#00e5ff',
  },
  {
    slug: 'flame-ade',
    title: 'Flame ADE',
    tagline: 'Emulator terminal AI-native ~7 MB — Tauri 2 + Rust + React 19.',
    kind: 'Desktop / AI Tooling',
    year: '2025–2026',
    repo: 'Flame-ADE',
    stack: ['Tauri 2', 'Rust', 'React 19', 'TypeScript', 'BYOK AI'],
    metrics: [
      { label: 'ukuran binary', value: '±7 MB' },
      { label: 'runtime', value: 'native' },
      { label: 'model AI', value: 'BYOK' },
    ],
    problem:
      'Terminal modern dengan AI biasanya membawa Electron (ratusan MB) dan mengunci pengguna ke satu penyedia model. Pengguna menginginkan terminal yang punya "otak" tapi tetap ringan, cepat, dan tidak memaksa langganan.',
    approach: [
      {
        title: 'Tauri, bukan Electron',
        text: 'Shell desktop ditulis Rust dengan WebView sistem — hasilnya binary ±7 MB dan konsumsi mema­kai orde lebih kecil dibanding Electron.',
      },
      {
        title: 'AI sebagai fitur, bukan kandungan',
        text: 'Bring-your-own-key: pengguna menempel kunci model pilihannya (lokal atau cloud) — terminal tidak pernah mengirim data ke server siapa pun selain milik pengguna sendiri.',
      },
      {
        title: 'UI React 19 di atas core Rust',
        text: 'Pengalaman antarmuka modern (React 19 + TypeScript) tanpa mengorbankan kecepatan proses inti yang tetap di sisi Rust.',
      },
    ],
    outcome:
      'Terminal AI-native yang benar-benar seukuran notepad — target utama macOS Tahoe, dengan disiplin ukuran yang dijaga sejak commit pertama. Bukti bahwa "AI di mana-mana" tidak harus berarti "berat di mana-mana".',
    accent: '#e05a1e',
  },
  {
    slug: 'ai-first-os',
    title: 'AI First OS',
    tagline: 'Arch Linux ISO builder dengan Hermes Agent sebagai warga kelas satu.',
    kind: 'Sistem Operasi / Dotfiles',
    year: '2025–2026',
    repo: 'AI-First-OS',
    stack: ['Shell', 'Arch Linux', 'AI-First', 'Hermes Agent'],
    metrics: [
      { label: 'basis', value: 'Arch' },
      { label: 'agent', value: 'Hermes' },
      { label: 'build', value: 'ISO otomatis' },
    ],
    problem:
      'Distribusi Linux umum memperlakukan AI sebagai aplikasi tambahan yang dipasang belakangan. Bagaimana jika OS dibangun dari ISO dengan agen AI sebagai "warga negara kelas satu" — tersedia sejak boot pertama, bukan setelah setup manual berjam-jam?',
    approach: [
      {
        title: 'ISO builder ter-skrip penuh',
        text: 'Seluruh proses build ISO ditulis dalam skrip shell yang bisa diaudit — tidak ada sihir GUI; hasil build reproducible dan bisa dijalankan CI.',
      },
      {
        title: 'Hermes sejak boot',
        text: 'Agen Hermes terintegrasi pada tahap image — pengguna langsung punya asisten sistem yang memahami konfigurasi mesinnya sendiri.',
      },
      {
        title: 'Ekosistem terorkestrasi',
        text: 'Terhubung dengan repo orchestration (AGENTS.md, backlog, pipeline kematangan v4) sehingga evolusi OS, dotfiles, dan tooling berjalan di satu alur kerja.',
      },
    ],
    outcome:
      'Eksperimen sistem operasi AI-first yang reproducible: satu perintah build ISO, agen aktif sejak boot, dan seluruh keputusan arsitektur terdokumentasi terbuka untuk ditelusuri siapa saja.',
    accent: '#a78bfa',
  },
];

export function getStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
