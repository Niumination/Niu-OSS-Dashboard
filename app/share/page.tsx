import type { Metadata } from 'next';
import { Suspense } from 'react';
import AppShell from '@/components/AppShell';
import TitleSync from '@/components/TitleSync';
import ShareView from '@/components/ShareView';
import { getGithubSnapshot } from '@/lib/github';

// Statik murni; parameter dibaca klien (useSearchParams -> wajib Suspense
// agar tetap kompatibel ekspor statis).

export const metadata: Metadata = {
  title: 'Bagikan',
  description: 'Titik terima share target PWA — tautan yang dibagikan dibuka atau dicari di dasbor.',
  robots: { index: false, follow: false },
};

export default async function SharePage() {
  const snap = await getGithubSnapshot();

  return (
    <AppShell snapshot={snap}>
      <TitleSync k="title.share" />
      <div className="mx-auto flex min-h-[60vh] max-w-[1440px] items-center justify-center px-4 py-16 md:px-6 lg:px-8">
        <Suspense fallback={null}>
          <ShareView />
        </Suspense>
      </div>
    </AppShell>
  );
}
