'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { Snapshot } from '@/lib/types';
import { UiContext, type PaymentTab, type UiApi } from './ui-context';
import NavBar from './NavBar';
import Footer from './Footer';
import CommandMenu from './CommandMenu';
import HintCard from './HintCard';
import PaymentModal from './PaymentModal';
import ScrollTop from './ScrollTop';

interface Props {
  snapshot: Snapshot;
  children: ReactNode;
}

/**
 * Shell aplikasi (client): nav bar + command palette global + modal pembayaran
 * global + footer. Konten halaman (RSC) mengalir melalui `children`.
 */
export default function AppShell({ snapshot, children }: Props) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [pay, setPay] = useState<{ open: boolean; tab: PaymentTab }>({ open: false, tab: 'oss' });

  const api = useMemo<UiApi>(
    () => ({
      openPayment: (tab: PaymentTab = 'oss') => setPay({ open: true, tab }),
      openCommand: () => setCmdOpen(true),
    }),
    [],
  );

  return (
    <UiContext.Provider value={api}>
      <div className="relative z-10 flex min-h-screen flex-col">
        <NavBar user={snapshot.user} />
        <CommandMenu
          open={cmdOpen}
          onOpenChange={setCmdOpen}
          snapshot={snapshot}
          onPayment={(tab) => setPay({ open: true, tab })}
        />
        <PaymentModal
          open={pay.open}
          initialTab={pay.tab}
          onClose={() => setPay((p) => ({ ...p, open: false }))}
        />
        <main id="konten" className="flex-1 focus:outline-none">{children}</main>
        <HintCard />
        <Footer snapshot={snapshot} />
        <ScrollTop />
      </div>
    </UiContext.Provider>
  );
}
