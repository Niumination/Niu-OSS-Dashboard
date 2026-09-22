import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import AppShell from '@/components/AppShell';
import TitleSync from '@/components/TitleSync';
import { getGithubSnapshot } from '@/lib/github';
import { CASE_STUDIES } from '@/lib/case-studies';
import { StudiesGrid } from '@/components/studies-ui';
import T from '@/components/T';

// Statik murni tanpa ISR: regenerasi ISR di Vercel pernah mencampur generasi
// render (DOM segar vs payload flight RSC basi) sehingga hydration gagal
// (React #418) di semua halaman. Data diperbarui per deploy — cron mingguan
// refresh-data push data baru -> auto-redeploy. Lihat CHANGELOG [Stack 2026.1].

export const metadata: Metadata = {
  title: 'Studi Kasus',
  description:
    'Studi kasus dibedah apa adanya: masalah, keputusan, hasil — dari civic tech sampai OS AI-first. Klaimnya bisa dicek di kodenya.',
  alternates: { canonical: '/studies' },
};

export default async function StudiesPage() {
  const snap = await getGithubSnapshot();

  return (
    <AppShell snapshot={snap}>
      <TitleSync k="title.studies" />
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <header>
          <div className="micro flex items-center gap-2 text-cream/45">
            <span className="size-1.5 rounded-full bg-ember" />
            <T k="studies.micro" />
          </div>
          <h1 className="mt-3 font-display text-[40px] leading-[1.0] tracking-tight md:text-[54px]">
            <T k="studies.title" />
          </h1>
          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-cream/60">
            <T k="studies.desc" vars={{ n: CASE_STUDIES.length }} />
          </p>
        </header>

        <StudiesGrid studies={CASE_STUDIES} />
        <p className="mt-8 flex items-center gap-2 font-mono text-[10px] text-cream/35">
          <ExternalLink className="size-3" />
          <T k="studies.note" />
        </p>
      </div>
    </AppShell>
  );
}
