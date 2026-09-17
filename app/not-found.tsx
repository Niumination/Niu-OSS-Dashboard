import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
      <div className="micro text-ember">404 // not found</div>
      <h1 className="font-display text-[52px] leading-none tracking-tight md:text-[72px]">
        Halaman tidak ada.
      </h1>
      <p className="max-w-md text-[14px] leading-relaxed text-cream/60">
        Repo-nya mungkin di-rename, dihapus, atau tautannya salah. Cek daftar lengkap di
        Repositories.
      </p>
      <div className="flex gap-3">
        <Link
          href="/repositories"
          className="h-11 rounded-full bg-ember px-6 font-mono text-[11px] uppercase tracking-wider text-ink transition hover:bg-ember-soft"
        >
          All Repositories
        </Link>
        <Link
          href="/"
          className="flex h-11 items-center rounded-full border border-white/15 px-6 font-mono text-[11px] uppercase tracking-wider text-cream/75 transition hover:border-ember/50 hover:text-cream"
        >
          Ke beranda
        </Link>
      </div>
    </div>
  );
}
