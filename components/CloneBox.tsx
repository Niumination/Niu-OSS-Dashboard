'use client';

import { useState } from 'react';
import { Check, Copy, GitBranch, Link2 } from 'lucide-react';

/*
 * CloneBox — kotak clone interaktif: salin perintah git clone
 * atau salin tautan repositori (dengan feedback visual).
 */
export default function CloneBox({ fullName }: { fullName: string }) {
  const [copied, setCopied] = useState<'clone' | 'link' | null>(null);

  const cloneCmd = `git clone https://github.com/${fullName}.git`;
  const repoUrl = `https://github.com/${fullName}`;

  const copy = async (kind: 'clone' | 'link', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // Clipboard ditolak (konteks non-secure) — abaikan, tautan tetap bisa diklik.
    }
  };

  const btnCls =
    'flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 font-mono text-[9.5px] uppercase tracking-wider text-cream/60 transition-colors hover:border-ember/50 hover:text-cream';

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-ink/70 px-4 py-3">
      <GitBranch className="size-4 shrink-0 text-ember" aria-hidden="true" />
      <code className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-cream/70">
        {cloneCmd}
      </code>
      <div className="flex gap-2">
        <button type="button" onClick={() => copy('clone', cloneCmd)} className={btnCls}>
          {copied === 'clone' ? (
            <>
              <Check className="size-3 text-success" /> tersalin
            </>
          ) : (
            <>
              <Copy className="size-3" /> salin clone
            </>
          )}
        </button>
        <button type="button" onClick={() => copy('link', repoUrl)} className={btnCls} title={repoUrl}>
          {copied === 'link' ? (
            <>
              <Check className="size-3 text-success" /> tersalin
            </>
          ) : (
            <>
              <Link2 className="size-3" /> salin tautan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
