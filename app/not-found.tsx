import Link from 'next/link';

const LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/repositories', label: 'Semua Repositori' },
  { href: '/services', label: 'Jasa' },
  { href: '/system', label: 'Sistem & Metrik' },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
      <div className="micro text-ember">404 // tidak ditemukan</div>
      <h1 className="font-display text-[52px] leading-none tracking-tight md:text-[72px]">
        Halaman tidak ada.
      </h1>
      <p className="max-w-md text-[14px] leading-relaxed text-cream/60">
        Repo-nya mungkin di-rename, dihapus, atau tautannya salah. Coba salah satu tujuan di bawah.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="h-10 rounded-full border border-white/15 px-5 font-mono text-[10.5px] uppercase tracking-wider text-cream/70 transition hover:border-ember/50 hover:text-cream"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
