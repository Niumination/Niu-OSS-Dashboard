import type { Metadata } from 'next';
import { Boxes, ExternalLink, RefreshCw, ShieldCheck, Terminal } from 'lucide-react';
import AppShell from '@/components/AppShell';
import T from '@/components/T';
import { getGithubSnapshot } from '@/lib/github';

// Statik murni tanpa ISR: regenerasi ISR di Vercel pernah mencampur generasi
// render (DOM segar vs payload flight RSC basi) sehingga hydration gagal
// (React #418) di semua halaman. Data diperbarui per deploy — cron mingguan
// refresh-data push data baru -> auto-redeploy. Lihat CHANGELOG [Stack 2026.1].

export const metadata: Metadata = {
  title: 'API Publik',
  description:
    'API publik v1 Niumination — repositori, event, uptime, dan studi kasus sebagai JSON ala GitOps. Gratis, tanpa kunci API, CORS terbuka.',
  alternates: { canonical: '/developers' },
};

const ENDPOINTS: Array<{ path: string; key: string }> = [
  { path: '/api/v1/index.json', key: 'dev.ep.index' },
  { path: '/api/v1/user.json', key: 'dev.ep.user' },
  { path: '/api/v1/repos.json', key: 'dev.ep.repos' },
  { path: '/api/v1/repos/{name}.json', key: 'dev.ep.repo' },
  { path: '/api/v1/events.json', key: 'dev.ep.events' },
  { path: '/api/v1/summary.json', key: 'dev.ep.summary' },
  { path: '/api/v1/uptime.json', key: 'dev.ep.uptime' },
  { path: '/api/v1/studies.json', key: 'dev.ep.studies' },
  { path: '/api/v1/studies/{slug}.json', key: 'dev.ep.study' },
];

/**
 * /developers — dokumentasi API publik v1 (bilingual via <T/>).
 * Endpoint dijelaskan dengan padanan kamus; contoh permintaan fetch nyata.
 */
export default async function DevelopersPage() {
  const snap = await getGithubSnapshot();

  return (
    <AppShell snapshot={snap}>
      <div className="mx-auto max-w-[900px] px-4 pb-20 pt-8 md:px-6">
        <header>
          <div className="micro flex items-center gap-2 text-cream/45">
            <span className="size-1.5 rounded-full bg-ember" />
            <T k="dev.micro" />
          </div>
          <h1 className="mt-3 font-display text-[40px] leading-[1.0] tracking-tight md:text-[54px]">
            <T k="dev.title" />
          </h1>
          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-cream/60">
            <T k="dev.desc" />
          </p>
        </header>

        {/* Prinsip */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
            <Boxes className="size-5 text-ember" />
            <h2 className="mt-3 text-[13.5px] font-semibold text-cream">
              <T k="dev.h.gitops" />
            </h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-cream/55">
              <T k="dev.gitops" />
            </p>
          </div>
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
            <ShieldCheck className="size-5 text-ember" />
            <h2 className="mt-3 text-[13.5px] font-semibold text-cream">
              <T k="dev.h.cors" />
            </h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-cream/55">
              <T k="dev.cors" />
            </p>
          </div>
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
            <RefreshCw className="size-5 text-ember" />
            <h2 className="mt-3 text-[13.5px] font-semibold text-cream">
              <T k="dev.h.refresh" />
            </h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-cream/55">
              <T k="dev.refresh" />
            </p>
          </div>
        </div>

        {/* Endpoint */}
        <section className="mt-12">
          <div className="micro text-cream/45">
            <T k="dev.endpoints" />
          </div>
          <div className="mt-4 overflow-hidden rounded-3xl border border-white/[0.08]">
            {ENDPOINTS.map((ep, i) => (
              <a
                key={ep.path}
                href={ep.path.replace('{name}', 'sapa-ai').replace('{slug}', 'flame-ade')}
                className={`group flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-white/[0.03] ${
                  i % 2 === 0 ? 'bg-white/[0.015]' : ''
                }`}
              >
                <code className="min-w-0 break-all font-mono text-[12px] text-cream/85 group-hover:text-ember-soft">
                  GET {ep.path}
                </code>
                <span className="flex-1 text-[12px] text-cream/50">
                  <T k={ep.key} />
                </span>
                <span className="flex shrink-0 items-center gap-1 font-mono text-[9.5px] uppercase tracking-wider text-cream/40 transition-colors group-hover:text-ember">
                  <T k="dev.try" />
                  <ExternalLink className="size-3" />
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Contoh */}
        <section className="mt-12">
          <div className="micro text-cream/45">
            <T k="dev.example" />
          </div>
          <div className="mt-4 overflow-hidden rounded-3xl border border-white/[0.08] bg-ink/70">
            <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-5 py-3.5">
              <Terminal className="size-4 text-ember" />
              <span className="font-mono text-[10.5px] text-cream/50">fetch — summary.json</span>
            </div>
            <pre className="overflow-x-auto px-5 py-4 font-mono text-[11.5px] leading-relaxed text-cream/75">
{`const res = await fetch('https://niumination.web.id/api/v1/summary.json');
const data = await res.json();

data.totals.repos   // ${String(snap.repos.length)} — jumlah repositori
data.topLanguages   // [{ name, count }] — bahasa teratas
data.generatedAt    // stempel waktu data (ISO)`}
            </pre>
          </div>
          <p className="mt-4 font-mono text-[10px] leading-relaxed text-cream/35">
            <T k="dev.foot" />
          </p>
        </section>
      </div>
    </AppShell>
  );
}
