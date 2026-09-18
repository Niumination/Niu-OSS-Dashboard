import Link from 'next/link';
import { Coffee, Github, Heart, Mail } from 'lucide-react';
import { SITE } from '@/lib/site.config';
import type { Snapshot } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import T from '@/components/T';

const NAV = [
  { href: '/', key: 'footer.nav.home' },
  { href: '/repositories', key: 'footer.nav.repos' },
  { href: '/studies', key: 'footer.nav.studies' },
  { href: '/services', key: 'footer.nav.services' },
  { href: '/system', key: 'footer.nav.system' },
  { href: '/status', key: 'footer.nav.status' },
  { href: '/feed.xml', key: 'footer.nav.rss' },
];

export default function Footer({ snapshot }: { snapshot: Snapshot }) {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/[0.07]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 md:grid-cols-3 md:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 64 64" className="size-7" aria-hidden="true">
              <rect x="4" y="4" width="56" height="56" rx="14" fill="#1b1712" stroke="rgba(242,236,223,0.14)" />
              <path d="M32 14l15.6 9v18L32 50l-15.6-9V23z" fill="none" stroke="#e05a1e" strokeWidth="4.5" strokeLinejoin="round" />
              <circle cx="47" cy="17" r="5" fill="#00e5ff" />
            </svg>
            <span className="font-mono text-[13px] font-semibold text-cream">niumination</span>
          </div>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-cream/55">
            <T k="footer.blurb" />
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/35">
            {SITE.location}
          </p>
        </div>

        <div>
          <div className="micro text-cream/40"><T k="footer.menu" /></div>
          <ul className="mt-4 space-y-2.5">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-[13px] text-cream/65 transition-colors hover:text-ember">
                  <T k={n.key} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="micro text-cream/40"><T k="footer.support" /></div>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href={SITE.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-cream/65 transition-colors hover:text-ember">
                <Github className="size-3.5" /> github.com/{SITE.handle}
              </a>
            </li>
            <li>
              <a href={SITE.sponsors} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-cream/65 transition-colors hover:text-ember">
                <Heart className="size-3.5" /> GitHub Sponsors
              </a>
            </li>
            <li>
              <a href={SITE.buyMeACoffee} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-cream/65 transition-colors hover:text-ember">
                <Coffee className="size-3.5" /> Buy Me a Coffee
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-[13px] text-cream/65 transition-colors hover:text-ember">
                <Mail className="size-3.5" /> {SITE.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.05]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 font-mono text-[10px] uppercase tracking-wider text-cream/35 md:px-6 lg:px-8">
          <span>© 2026 Niumination · Aceh Tengah, ID</span>
          <span className="hidden md:inline">next.js · react-three/fiber · tailwind · framer motion</span>
          <span className="ml-auto">
            <T k="footer.data" vars={{ date: formatDate(snapshot.updatedAt) }} />
          </span>
        </div>
      </div>
    </footer>
  );
}
