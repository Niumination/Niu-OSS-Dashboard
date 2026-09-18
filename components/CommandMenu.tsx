'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Check,
  Coffee,
  ExternalLink,
  FolderGit2,
  Github,
  Heart,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Search,
  Stethoscope,
  Wrench,
} from 'lucide-react';
import { SITE } from '@/lib/site.config';
import { categorize, CATEGORY_MAP } from '@/lib/categories';
import type { Snapshot } from '@/lib/types';
import type { PaymentTab } from './ui-context';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: Snapshot;
  onPayment: (tab: PaymentTab) => void;
}

/**
 * Command Palette (ala Raycast/kbar) — Ctrl/Cmd+K.
 * Mencari repositori, melompat antar seksi, membuka tautan sosial,
 * dan memicu modal pembayaran — semua via keyboard.
 */
export default function CommandMenu({ open, onOpenChange, snapshot, onPayment }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  // Pantau fokus saat terbuka (cmdk memindahkannya antar-item); kembalikan
  // ke elemen pemicu saat ditutup.
  useEffect(() => {
    if (!open) {
      lastFocused.current?.focus?.();
      lastFocused.current = null;
      return;
    }
    const onOpenKey = () => {
      lastFocused.current = (document.activeElement as HTMLElement) ?? null;
    };
    // Jendela singkat: activeElement saat listener dipasang = elemen pemicu.
    lastFocused.current = (document.activeElement as HTMLElement) ?? null;
    window.addEventListener('focusin', onOpenKey, true);
    return () => window.removeEventListener('focusin', onOpenKey, true);
  }, [open]);

  const close = () => onOpenChange(false);

  const navItems = [
    { value: 'nav-overview', label: 'Beranda / Landing', icon: LayoutDashboard, href: '/' },
    { value: 'nav-repos', label: 'Semua Repositori', icon: FolderGit2, href: '/repositories' },
    { value: 'nav-services', label: 'Jasa & Komisi', icon: Wrench, href: '/services' },
    { value: 'nav-system', label: 'Sistem & Metrik', icon: Activity, href: '/system' },
  ];

  const linkItems = [
    { value: 'link-github', label: 'Profil GitHub', icon: Github, href: SITE.github },
    { value: 'link-sponsors', label: 'GitHub Sponsors', icon: Heart, href: SITE.sponsors },
    { value: 'link-bmac', label: 'Buy Me a Coffee', icon: Coffee, href: SITE.buyMeACoffee },
    { value: 'link-email', label: `Email — ${SITE.email}`, icon: Mail, href: `mailto:${SITE.email}` },
  ];

  const actionItems = [
    { value: 'act-donate', label: 'Dukung Open Source', icon: Heart, payment: 'oss' as PaymentTab },
    { value: 'act-hire', label: 'Sewa Jasa / Konsultasi', icon: Stethoscope, payment: 'services' as PaymentTab },
  ];

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard ditolak (mis. konteks non-secure) -> fallback membuka
      // client email di tab baru tanpa menavigasikan aplikasi.
      close();
      window.open(`mailto:${SITE.email}`, '_self', 'noopener');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[10vh] md:pt-[14vh]">
          <motion.button
            type="button"
            aria-label="Tutup command palette"
            className="absolute inset-0 cursor-default bg-ink/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-ink-2/95 shadow-card backdrop-blur-2xl"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Command shouldFilter>
              <div className="flex items-center gap-3 border-b border-white/[0.08] px-5">
                <Search className="size-4 shrink-0 text-ember" />
                <Command.Input
                  autoFocus
                  placeholder="Cari repo, seksi halaman, tautan, atau aksi…"
                  className="h-14 flex-1 bg-transparent text-[15px] text-cream outline-none placeholder:text-cream/35"
                />
                <kbd className="hidden shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-cream/45 sm:block">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[52vh] overflow-y-auto p-2">
                <Command.Group heading="Navigasi">
                  {navItems.map((item) => (
                    <Command.Item
                      key={item.value}
                      value={item.value}
                      onSelect={() => {
                        close();
                        router.push(item.href);
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] text-cream/85"
                    >
                      <item.icon className="size-4 shrink-0 text-ember" />
                      {item.label}
                      <kbd className="ml-auto font-mono text-[9px] uppercase tracking-wider text-cream/30">
                        {item.href}
                      </kbd>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Repositori">
                  {snapshot.repos.slice(0, 40).map((r) => {
                    const cat = CATEGORY_MAP[categorize(r)];
                    return (
                      <Command.Item
                        key={r.name}
                        value={`${r.name} ${r.description ?? ''} ${(r.topics ?? []).join(' ')}`}
                        onSelect={() => {
                          close();
                          router.push(`/repo/${r.name}`);
                        }}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] text-cream/85"
                      >
                        <FolderGit2 className="size-4 shrink-0 text-spotlight" />
                        <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{r.name}</span>
                        <span className="micro hidden text-[8px] sm:block" style={{ color: cat.color }}>
                          {cat.label}
                        </span>
                        {r.homepage && <ExternalLink className="size-3 shrink-0 text-cream/35" />}
                      </Command.Item>
                    );
                  })}
                </Command.Group>

                <Command.Group heading="Tautan sosial">
                  {linkItems.map((item) => (
                    <Command.Item
                      key={item.value}
                      value={item.value}
                      onSelect={() => {
                        close();
                        window.open(item.href, '_blank', 'noopener');
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] text-cream/85"
                    >
                      <item.icon className="size-4 shrink-0 text-cream/50" />
                      {item.label}
                      <ExternalLink className="ml-auto size-3 shrink-0 text-cream/30" />
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Aksi">
                  {actionItems.map((item) => (
                    <Command.Item
                      key={item.value}
                      value={item.value}
                      onSelect={() => {
                        close();
                        onPayment(item.payment);
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] text-cream/85"
                    >
                      <item.icon className="size-4 shrink-0 text-ember" />
                      {item.label}
                    </Command.Item>
                  ))}
                  <Command.Item
                    value="copy-email"
                    onSelect={() => copyEmail()}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] text-cream/85"
                  >
                    {copied ? (
                      <Check className="size-4 shrink-0 text-success" />
                    ) : (
                      <MessageSquare className="size-4 shrink-0 text-cream/50" />
                    )}
                    {copied ? 'Email tersalin!' : 'Salin alamat email'}
                  </Command.Item>
                </Command.Group>

                <Command.Empty className="grid place-items-center py-10 font-mono text-[11px] uppercase tracking-[0.2em] text-cream/35">
                  Tidak ada hasil
                </Command.Empty>
              </Command.List>
            </Command>

            <div className="flex items-center gap-4 border-t border-white/[0.08] px-5 py-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-cream/35">
              <span>↑↓ telusuri</span>
              <span>↵ pilih</span>
              <span>esc tutup</span>
              <span className="ml-auto text-cream/25">⌘K / Ctrl+K</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
