import { Sk } from '@/components/Skeletons';

export default function RepoLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
      <Sk className="h-4 w-40" />
      <div className="mt-6 flex items-center gap-3">
        <Sk className="size-6" />
        <Sk className="h-9 w-72" />
        <Sk className="h-6 w-20 rounded-full" />
      </div>
      <Sk className="mt-4 h-4 w-2/3 max-w-xl" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Sk key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <Sk className="mt-8 h-[420px] rounded-3xl" />
    </div>
  );
}
