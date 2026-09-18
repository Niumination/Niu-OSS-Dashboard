import Link from 'next/link';
import T from '@/components/T';


const LINKS = [
  { href: '/', key: 'nav.home' },
  { href: '/repositories', key: 'cm.nav.repos' },
  { href: '/services', key: 'nav.services' },
  { href: '/system', key: 'cm.nav.system' },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
      <div className="micro text-ember"><T k="nf.micro" /></div>
      <h1 className="font-display text-[52px] leading-none tracking-tight md:text-[72px]">
        <T k="nf.title" />
      </h1>
      <p className="max-w-md text-[14px] leading-relaxed text-cream/60">
        <T k="nf.desc" />
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="h-10 rounded-full border border-white/15 px-5 font-mono text-[10.5px] uppercase tracking-wider text-cream/70 transition hover:border-ember/50 hover:text-cream"
          >
            <T k={l.key} />
          </Link>
        ))}
      </div>
    </div>
  );
}
