import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';
import RepoGrid from '@/components/RepoGrid';
import { getGithubSnapshot } from '@/lib/github';
import { computeSummary } from '@/lib/summary';
import { formatNumber } from '@/lib/utils';
import T from '@/components/T';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Semua Repositori',
  description:
    'Agregator dinamis seluruh repositori publik Niumination — pencarian real-time, kategori otomatis, dan filter tech stack.',
  alternates: { canonical: '/repositories' },
};

export default async function RepositoriesPage() {
  const snap = await getGithubSnapshot();
  const s = computeSummary(snap);

  return (
    <AppShell snapshot={snap}>
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <header>
          <div className="micro flex items-center gap-2 text-cream/45">
            <span className="size-1.5 rounded-full bg-ember" />
            <T k="rep.micro" />
          </div>
          <h1 className="mt-3 font-display text-[40px] leading-[1.0] tracking-tight md:text-[54px]">
            <T k="rep.title" />
          </h1>
          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-cream/60">
            <T
              k="rep.desc"
              vars={{
                total: formatNumber(s.totalRepos),
                original: s.originalRepos,
                forks: s.totalRepos - s.originalRepos,
              }}
            />
          </p>
        </header>

        <div className="mt-8">
          <RepoGrid repos={snap.repos} offline={!snap.live} offlineDate={snap.updatedAt} />
        </div>
      </div>
    </AppShell>
  );
}
