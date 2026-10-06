import type { Metadata } from 'next';
import CsInbox from '@/components/CsInbox';

/*
 * /cs — inbox pemilik untuk balasan chat pengunjung (Tencent RTC Chat).
 *
 * Halaman alat internal: tanpa NavBar/Footer publik, noindex, digerbang
 * token (CS_ADMIN_TOKEN) di sisi server via /api/chat/owner-sig.
 */
export const metadata: Metadata = {
  title: 'Inbox CS — Niumination',
  robots: { index: false, follow: false },
};

export default function CsPage() {
  return (
    <main id="konten" className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10">
      <CsInbox />
    </main>
  );
}
