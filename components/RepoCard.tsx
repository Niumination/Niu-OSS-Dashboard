'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock,
  ExternalLink,
  FolderGit2,
  GitFork,
  Play,
  Star,
} from 'lucide-react';
import { categorize, CATEGORY_MAP } from '@/lib/categories';
import type { RepoLite } from '@/lib/types';
import { formatDate, formatNumber, langColor, timeAgo } from '@/lib/utils';

interface Props {
  repo: RepoLite;
  index?: number;
  /** true saat prefers-reduced-motion — lewati animasi masuk. */
  instant?: boolean;
}

/**
 * Kartu repositori: deskripsi, indikator warna bahasa, badge kategori,
 * tech stack (topics), stars/forks, tombol Live Demo (jika ada homepage)
 * dan tautan ke kode sumber.
 */
export default function RepoCard({ repo, index = 0, instant = false }: Props) {
  const cat = CATEGORY_MAP[categorize(repo)];

  return (
    <motion.article
      layout={!instant}
      initial={instant ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={instant ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
      transition={instant ? undefined : { duration: 0.35, delay: Math.min(index, 11) * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className="card-glow group relative flex flex-col rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm transition-colors duration-300 hover:border-ember/35"
    >
      <div className="flex items-center gap-2">
        <FolderGit2 className="size-4 shrink-0 text-ember" />
        <Link
          href={`/repo/${repo.name}`}
          className="truncate font-mono text-[13px] font-medium text-cream transition-colors group-hover:text-ember-soft"
          title={repo.fullName}
        >
          {repo.name}
        </Link>
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          {repo.fork && (
            <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-cream/45">
              fork
            </span>
          )}
          {repo.archived && (
            <span className="rounded-full border border-danger/30 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-danger">
              diarsipkan
            </span>
          )}
          {repo.homepage && !repo.archived && (
            <span className="flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-success">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-success" />
              </span>
              live
            </span>
          )}
        </span>
      </div>

      <div className="micro mt-2.5 text-[8.5px]" style={{ color: cat.color }}>
        {cat.label}
        {repo.language ? ` · ${repo.language}` : ''}
      </div>

      <p className="mt-2.5 line-clamp-3 flex-1 text-[13px] leading-relaxed text-cream/65">
        {repo.description ?? '— repositori tanpa deskripsi.'}
      </p>

      {(repo.topics.length > 0 || repo.language) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {repo.language && (
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9.5px] text-cream/70">
              <span className="size-2 rounded-full" style={{ background: langColor(repo.language) }} />
              {repo.language}
            </span>
          )}
          {repo.topics.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-white/[0.04] px-2 py-0.5 font-mono text-[9.5px] text-cream/45">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 font-mono text-[10.5px] text-cream/50">
        <span className="flex items-center gap-1" title="Stars">
          <Star className="size-3 text-warn" /> {formatNumber(repo.stars)}
        </span>
        <span className="flex items-center gap-1" title="Forks">
          <GitFork className="size-3" /> {formatNumber(repo.forks)}
        </span>
        <span
          suppressHydrationWarning
          className="ml-auto flex items-center gap-1"
          title={`Push terakhir: ${formatDate(repo.pushedAt)}`}
        >
          <Clock className="size-3" /> {timeAgo(repo.pushedAt)}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        {repo.homepage ? (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-ember font-mono text-[10.5px] uppercase tracking-wider text-ink transition hover:bg-ember-soft hover:shadow-glow"
          >
            <Play className="size-3" /> Demo Langsung
          </a>
        ) : (
          <span className="flex h-9 flex-1 items-center justify-center rounded-full border border-white/5 font-mono text-[10px] uppercase tracking-wider text-cream/25">
            demo —
          </span>
        )}
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-3.5 font-mono text-[10.5px] uppercase tracking-wider text-cream/75 transition hover:border-spotlight/50 hover:text-spotlight"
          >
            Sumber <ExternalLink className="size-3" />
          </a>
      </div>
    </motion.article>
  );
}
