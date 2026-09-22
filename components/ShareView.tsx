'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, Check, Copy, FolderGit2, SearchX } from 'lucide-react';
import { useLocale } from './LocaleProvider';

/*
 * ShareView — isi halaman /share (share target PWA, Fase 2).
 * Menerima title/text/url dari menu berbagi OS, lalu:
 *  - tautan repo GitHub Niumination -> tawarkan buka halaman /repo/<nama>;
 *  - tautan lain -> buka langsung / salin;
 *  - tanpa tautan -> tampilkan teks yang dibagikan (bisa disalin).
 */

function extractUrls(text: string, url: string | null): string[] {
  const found = new Set<string>();
  if (url && /^https?:\/\//.test(url)) found.add(url);
  for (const m of text.matchAll(/https?:\/\/[^\s<>"')]+/g)) found.add(m[0]);
  return [...found];
}

export default function ShareView() {
  const params = useSearchParams();
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const title = params.get('title') ?? '';
  const text = params.get('text') ?? '';
  const urls = useMemo(() => extractUrls(`${title}\n${text}`, params.get('url')), [title, text, params]);

  // Repo Niumination? -> github.com/Niumination/<repo> (bisa diakhiri path)
  const repoMatch = urls
    .map((u) => /^https?:\/\/(?:www\.)?github\.com\/Niumination\/([A-Za-z0-9._-]+)/.exec(u))
    .find(Boolean);

  const copyFirst = async () => {
    try {
      await navigator.clipboard.writeText(urls[0] ?? text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* abaikan */
    }
  };

  return (
    <div className="w-full max-w-md text-center">
      <p className="micro text-cream/45">share // pwa</p>
      <h1 className="mt-3 font-display text-[34px] leading-tight tracking-tight md:text-[42px]">
        {t('share.title')}
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-cream/60">{t('share.desc')}</p>

      {urls.length === 0 && !text ? (
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <SearchX className="mx-auto size-6 text-cream/40" aria-hidden />
          <p className="mt-2 text-[13px] text-cream/50">{t('share.none')}</p>
          <Link
            href="/"
            className="mt-4 inline-flex h-10 items-center rounded-full border border-white/15 px-5 font-mono text-[10.5px] uppercase tracking-wider text-cream/70 transition hover:border-ember/50 hover:text-cream"
          >
            {t('err.home')}
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3 text-left">
          {repoMatch && (
            <Link
              href={`/repo/${repoMatch[1]}`}
              className="group flex items-center gap-3 rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3.5 transition hover:bg-ember/15"
            >
              <FolderGit2 className="size-5 shrink-0 text-ember" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[12.5px] text-cream/90">
                  {repoMatch[1]}
                </span>
                <span className="block text-[12px] text-cream/55">{t('share.openRepo')}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-cream/40 transition group-hover:text-ember" aria-hidden />
            </Link>
          )}

          {urls.map((u) => (
            <a
              key={u}
              href={u}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.02] px-4 py-3.5 transition hover:bg-white/[0.05]"
            >
              <ArrowUpRight className="size-4 shrink-0 text-cream/40 transition group-hover:text-ember" aria-hidden />
              <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-cream/70">{u}</span>
            </a>
          ))}

          {(urls.length > 0 || text) && (
            <button
              type="button"
              onClick={copyFirst}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.1] px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-cream/60 transition hover:border-ember/40 hover:text-cream"
            >
              {copied ? <Check className="size-3.5 text-success" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
              {copied ? t('share.copied') : t('share.copy')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
