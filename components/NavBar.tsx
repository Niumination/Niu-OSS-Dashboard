'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Command, Github } from 'lucide-react';
import { SITE } from '@/lib/site.config';
import type { UserLite } from '@/lib/types';
import { useUi } from './ui-context';
import { useLocale } from './LocaleProvider';

const TABS = [
  { href: '/', key: 'nav.home', num: '01' },
  { href: '/repositories', key: 'nav.repos', num: '02' },
  { href: '/services', key: 'nav.services', num: '03' },
  { href: '/system', key: 'nav.system', num: '04' },
];

export default function NavBar({ user }: { user: UserLite }) {
  const pathname = usePathname();
  const { openCommand } = useUi();
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={t('nav.aria.home')}>
          <BrandMark />
          <div className="leading-none">
            <div className="font-mono text-[13px] font-semibold tracking-tight text-cream">niumination</div>
            <div className="mt-1 hidden font-mono text-[8px] uppercase tracking-[0.26em] text-cream/40 sm:block">
              {t('nav.kicker')}
            </div>
          </div>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5 overflow-x-auto" aria-label={t('cm.group.nav')}>
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative whitespace-nowrap rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  active ? 'text-ember' : 'text-cream/55 hover:text-cream'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="mr-1.5 text-[9px] opacity-50">{tab.num}</span>
                {t(tab.key)}
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
          {/* Pemilih bahasa (id | en) */}
          <div
            className="flex h-9 items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-0.5"
            role="group"
            aria-label={t('nav.aria.lang')}
          >
            {(['id', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                aria-pressed={locale === l}
                className={`h-8 rounded-full px-2.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  locale === l ? 'bg-ember text-ink' : 'text-cream/50 hover:text-cream'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={openCommand}
            className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 font-mono text-[10px] uppercase tracking-wider text-cream/60 transition-colors hover:border-ember/40 hover:text-cream"
            title={t('nav.aria.command')}
            aria-label={t('nav.aria.command')}
          >
            <Command className="size-3" />
            <span className="hidden md:inline">Ctrl K</span>
            <kbd className="font-mono text-[9px] md:hidden">⌘K</kbd>
          </button>
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer"
            aria-label={t('nav.aria.github')}
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
