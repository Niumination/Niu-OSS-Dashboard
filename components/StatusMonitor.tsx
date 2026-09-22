'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, RefreshCw } from 'lucide-react';
import type { Deployment, UptimeData } from '@/lib/types';
import { dayColor, uptimePct } from '@/lib/uptime';
import { hostOf, timeAgo } from '@/lib/utils';
import { useLocale } from './LocaleProvider';
import T from './T';

type Status = 'checking' | 'online' | 'down';

/** Auto-periksa ulang tiap 5 menit agar status tetap segar. */
const AUTO_REFRESH_MS = 5 * 60 * 1000;

/*
 * StatusMonitor — memantau deployment live (repo dengan homepage).
 * Cek jaringan bersifat opaque (fetch mode 'no-cors' + timeout 6 dtk):
 * resolve = host terjangkau (online), reject = tidak terjangkau (down).
 * Untuk status HTTP penuh (200 vs 500) dibutuhkan CORS proxy/server —
 * dokumentasikan di README.
 */
export default function StatusMonitor({
  deployments,
  history,
}: {
  deployments: Deployment[];
  /** Riwayat GitOps (data/uptime.json) — opsional. */
  history?: UptimeData;
}) {
  const historyByRepo = new Map((history?.sites ?? []).map((s) => [s.repo, s]));
  const { t } = useLocale();
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [tick, setTick] = useState(0);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const iv = setInterval(() => setTick((t) => t + 1), AUTO_REFRESH_MS);
    return () => {
      mounted.current = false;
      clearInterval(iv);
    };
  }, []);

  const runChecks = useCallback(() => {
    if (!mounted.current) return () => {};
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const initial: Record<string, Status> = {};
    for (const d of deployments) initial[d.repo] = 'checking';
    setStatuses(initial);
    setLastCheck(new Date().toISOString());

    deployments.forEach((d, i) => {
      timers.push(
        setTimeout(async () => {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 6000);
          timers.push(timer);
          let st: Status = 'down';
          try {
            await fetch(d.url, {
              mode: 'no-cors',
              cache: 'no-store',
              redirect: 'follow',
              signal: ctrl.signal,
            });
            st = 'online';
          } catch {
            st = 'down';
          }
          clearTimeout(timer);
          if (!cancelled) setStatuses((prev) => ({ ...prev, [d.repo]: st }));
        }, i * 260),
      );
    });

    return () => {
      cancelled = true;
      for (const t of timers) clearTimeout(t);
    };
  }, [deployments]);

  useEffect(() => {
    const cleanup = runChecks();
    return cleanup;
  }, [runChecks, tick]);

  const online = Object.values(statuses).filter((s) => s === 'online').length;
  const checking = Object.values(statuses).some((s) => s === 'checking');

  return (
    <section className="mt-4 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="micro flex items-center gap-2 text-cream/50">
          <Globe className="size-3.5 text-ember" />
          {t('sm.micro')}
          <Link
            href="/status"
            className="ml-1 text-ember/80 underline-offset-4 transition-colors hover:text-ember hover:underline"
          >
            {t('sm.history')}
          </Link>
          {lastCheck && (
            <span suppressHydrationWarning className="hidden text-cream/40 sm:inline">
              {t('sm.checked', { ago: timeAgo(lastCheck) })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9.5px] uppercase tracking-wider text-cream/40">
            {checking ? t('sm.checking') : t('sm.count', { n: online, m: deployments.length })}
          </span>
          <button
            type="button"
            onClick={() => setTick((t) => t + 1)}
            className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-cream/60 transition hover:border-ember/40 hover:text-cream"
            aria-label={t('sm.retry')}
            title={t('sm.retry')}
          >
            <RefreshCw className={`size-3.5 ${checking ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {deployments.map((d, i) => {
          const st = statuses[d.repo] ?? 'checking';
          return (
            <motion.div
              key={d.repo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <StatusDot status={st} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/repo/${d.repo}`}
                  className="block truncate font-mono text-[12px] text-cream/85 transition-colors hover:text-ember-soft"
                >
                  {d.repo}
                </Link>
                <span className="block truncate font-mono text-[9.5px] text-cream/35">
                  {hostOf(d.url)}
                  {historyByRepo.has(d.repo) && (
                    <> · {t('sm.up30', { pct: uptimePct(historyByRepo.get(d.repo)!, 30).toFixed(1) })}</>
                  )}
                </span>
                {historyByRepo.get(d.repo) && (
                  <span className="mt-1.5 flex items-end gap-[2px]" aria-hidden="true">
                    {historyByRepo
                      .get(d.repo)!
                      .days.slice(-30)
                      .map((hd) => (
                        <span
                          key={hd.d}
                          title={`${hd.d}: ${hd.ok}/${hd.n}`}
                          className="h-3.5 flex-1 rounded-[2px]"
                          style={{ background: dayColor(hd.ok / Math.max(1, hd.n)) }}
                        />
                      ))}
                  </span>
                )}
              </div>
              <span
                className={
                  st === 'online'
                    ? 'font-mono text-[9px] uppercase tracking-wider text-success'
                    : st === 'down'
                      ? 'font-mono text-[9px] uppercase tracking-wider text-danger'
                      : 'font-mono text-[9px] uppercase tracking-wider text-ember'
                }
              >
                {st === 'online' ? t('sm.st.online') : st === 'down' ? t('sm.st.down') : t('sm.st.check')}
              </span>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-4 font-mono text-[9.5px] leading-relaxed text-cream/40">
        <T k="sm.note" />
      </p>
    </section>
  );
}

function StatusDot({ status }: { status: Status }) {
  if (status === 'checking') {
    return (
      <span className="relative grid size-3 place-items-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember/50" />
        <span className="relative size-2 rounded-full bg-ember" />
      </span>
    );
  }
  if (status === 'online') {
    return (
      <span className="relative grid size-3 place-items-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/40" style={{ animationDuration: '2.6s' }} />
        <span className="relative size-2 rounded-full bg-success shadow-[0_0_10px_rgba(61,220,151,0.8)]" />
      </span>
    );
  }
  return <span className="grid size-3 place-items-center"><span className="size-2 rounded-full bg-danger/80" /></span>;
}
