import { cx } from '@/lib/utils';

/** Blok skeleton dasar (shimmer). */
export function Sk({ className }: { className?: string }) {
  return <div className={cx('skel rounded-xl', className)} />;
}

export function RepoCardSkeleton() {
  return (
    <div className="flex flex-col rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5">
      <div className="flex items-center gap-2">
        <Sk className="size-4 rounded-full" />
        <Sk className="h-4 w-40" />
        <Sk className="ml-auto h-5 w-12 rounded-full" />
      </div>
      <Sk className="mt-3 h-3 w-24" />
      <div className="mt-4 flex-1 space-y-2">
        <Sk className="h-3 w-full" />
        <Sk className="h-3 w-5/6" />
        <Sk className="h-3 w-2/3" />
      </div>
      <div className="mt-4 flex gap-2">
        <Sk className="h-2.5 w-10" />
        <Sk className="h-2.5 w-10" />
        <Sk className="ml-auto h-2.5 w-14" />
      </div>
      <div className="mt-4 flex gap-2">
        <Sk className="h-9 flex-1 rounded-full" />
        <Sk className="h-9 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function RepoGridSkeleton() {
  return (
    <div>
      <Sk className="h-14 w-full rounded-3xl" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Sk key={i} className="h-8 w-28 rounded-full" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <RepoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <Sk className="h-7 w-16" />
      <Sk className="mt-2 h-3 w-24" />
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <Sk className="h-72 rounded-3xl lg:col-span-7" />
        <Sk className="h-72 rounded-3xl lg:col-span-5" />
      </div>
    </div>
  );
}
