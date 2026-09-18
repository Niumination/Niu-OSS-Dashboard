import Link from 'next/link';
import { MetricsSkeleton, RepoGridSkeleton, Sk } from '@/components/Skeletons';

/**
 * Loading UI (skeleton) — tampil selama server component mengambil
 * data GitHub (ISR miss) sebelum konten streaming selesai.
 */
export default function Loading({ metrics = false }: { metrics?: boolean }) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-6 md:px-6 lg:px-8">
      <div className="flex h-16 items-center gap-3">
        <Sk className="size-8 rounded-xl" />
        <Sk className="h-4 w-32" />
        <Sk className="ml-auto h-8 w-40 rounded-full" />
      </div>

      {metrics ? (
        <div className="mt-8">
          <Sk className="h-8 w-64" />
          <Sk className="mt-2 h-4 w-96 max-w-full" />
          <div className="mt-8">
            <MetricsSkeleton />
          </div>
        </div>
      ) : (
        <div>
          {/* hero skeleton */}
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-ink-2 p-8">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Sk className="h-3 w-56" />
                <Sk className="mt-5 h-14 w-full max-w-md" />
                <Sk className="mt-3 h-14 w-full max-w-lg" />
                <div className="mt-6 flex gap-3">
                  <Sk className="h-11 w-44 rounded-full" />
                  <Sk className="h-11 w-36 rounded-full" />
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Sk key={i} className="h-20 rounded-2xl" />
                  ))}
                </div>
              </div>
              <Sk className="h-[320px] rounded-3xl lg:col-span-5" />
            </div>
          </div>

          <div className="mt-14">
            <Sk className="h-3 w-40" />
            <Sk className="mt-3 h-9 w-72" />
            <div className="mt-6">
              <RepoGridSkeleton />
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-cream/35">
        memuat data github…{' '}
        <Link href="/" className="text-ember/70 hover:text-ember">
          /
        </Link>
      </div>
    </div>
  );
}
