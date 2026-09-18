'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import T from '@/components/T';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[route error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
      <div className="micro text-ember"><T k="err.micro" /></div>
      <h1 className="font-display text-[40px] leading-tight tracking-tight md:text-[52px]">
        <T k="err.title" />
      </h1>
      <p className="max-w-md text-[14px] leading-relaxed text-cream/60">
        {error.message || null}
        {!error.message && <T k="err.fallback" />}
        {error.digest && (
          <span className="mt-2 block font-mono text-[10px] text-cream/35">digest: {error.digest}</span>
        )}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-11 rounded-full bg-ember px-6 font-mono text-[11px] uppercase tracking-wider text-ink transition hover:bg-ember-soft"
        >
          <T k="err.retry" />
        </button>
        <Link
          href="/"
          className="flex h-11 items-center rounded-full border border-white/15 px-6 font-mono text-[11px] uppercase tracking-wider text-cream/75 transition hover:border-ember/50 hover:text-cream"
        >
          <T k="err.home" />
        </Link>
      </div>
    </div>
  );
}
