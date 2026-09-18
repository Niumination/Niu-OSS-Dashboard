'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Command, Github } from 'lucide-react';
import { SITE } from '@/lib/site.config';
import type { UserLite } from '@/lib/types';
import { useUi } from './ui-context';

const TABS = [
  { href: '/', label: 'Beranda', num: '01' },
  { href: '/repositories', label: 'Repositori', num: '02' },
  { href: '/services', label: 'Jasa', num: '03' },
  { href: '/system', label: 'Sistem', num: '04' },
];

export default function NavBar({ user }: { user: UserLite }) {
  const pathname = usePathname();
  const { openCommand } = useUi();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Beranda Niumination">
          <BrandMark />
          <div className="leading-none">
            <div className="font-mono text-[13px] font-semibold tracking-tight text-cream">niumination</div>
            <div className="mt-1 hidden font-mono text-[8px] uppercase tracking-[0.26em] text-cream/40 sm:block">
              dasbor oss
            </div>
          </div>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5 overflow-x-auto" aria-label="Navigasi utama">
          {TABS.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`relative whitespace-nowrap rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  active ? 'text-ember' : 'text-cream/55 hover:text-cream'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="mr-1.5 text-[9px] opacity-50">{t.num}</span>
                {t.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-ember shadow-glow"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={openCommand}
            className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 font-mono text-[10px] uppercase tracking-wider text-cream/60 transition-colors hover:border-ember/40 hover:text-cream"
            title="Buka command palette (Ctrl+K)"
            aria-label="Buka command palette (Ctrl+K)"
          >
            <Command className="size-3" />
            <span className="hidden md:inline">Ctrl K</span>
            <kbd className="font-mono text-[9px] md:hidden">⌘K</kbd>
          </button>
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer"
            aria-label="Profil GitHub"
            className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-cream/70 transition-colors hover:border-ember/40 hover:text-cream"
          >
            <Github className="size-4" />
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar}
            alt={user.login}
            width={36}
            height={36}
            referrerPolicy="no-referrer"
            className="size-9 rounded-full ring-1 ring-white/15"
          />
        </div>
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <svg viewBox="0 0 64 64" className="size-8 shrink-0" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#1b1712" stroke="rgba(242,236,223,0.14)" />
      <path d="M32 14l15.6 9v18L32 50l-15.6-9V23z" fill="none" stroke="#e05a1e" strokeWidth="4.5" strokeLinejoin="round" />
      <circle cx="47" cy="17" r="5" fill="#00e5ff" />
    </svg>
  );
}
