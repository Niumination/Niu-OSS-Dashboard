import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import AppShell from '@/components/AppShell';
import TitleSync from '@/components/TitleSync';
import T from '@/components/T';
import { getGithubSnapshot } from '@/lib/github';
import { getChangelog } from '@/lib/changelog';
import { shortDay } from '@/lib/now';

// Statik murni: CHANGELOG.md dibaca saat BUILD (konteks Node) dan diparse
// ke struktur React — tanpa dangerouslySetInnerHTML, tanpa ISR (#418).
// Halaman ikut segar di tiap deploy karena berkasnya ikut ter-commit.

export const metadata: Metadata = {
  title: 'Catatan Rilis',
  description:
    'Semua yang berubah di situs ini — satu entri per pengerjaan, ditulis apa adanya dan di-render langsung dari CHANGELOG.md repo.',
  alternates: { canonical: '/changelog' },
};

/** Format inline ringan: **tebal** dan `kode` -> React node. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-cream/90">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[11.5px] text-ember/90">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default async function ChangelogPage() {
  const snap = await getGithubSnapshot();
  const entries = getChangelog();

  return (
    <AppShell snapshot={snap}>
      <TitleSync k="title.changelog" />
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <header>
          <div className="micro flex items-center gap-2 text-cream/45">
            <span className="size-1.5 rounded-full bg-ember" />
            <T k="changelog.micro" />
          </div>
          <h1 className="mt-3 font-display text-[40px] leading-[1.0] tracking-tight md:text-[54px]">
            <T k="changelog.title" />
          </h1>
          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-cream/60">
            <T k="changelog.desc" />
          </p>
        </header>

        {entries.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 text-[13px] text-cream/50">
            <T k="changelog.empty" />
          </p>
        ) : (
          <ol className="mt-12 space-y-6">
            {entries.map((e) => (
              <li
                key={`${e.version}-${e.date}`}
                className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-7"
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="rounded-full border border-ember/30 bg-ember/10 px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider text-ember">
                    {e.version}
                  </span>
                  {e.date && (
                    <span className="font-mono text-[10.5px] text-cream/40">{shortDay(e.date)}</span>
                  )}
                  {e.title && (
                    <h2 className="w-full basis-full pt-1 text-[19px] font-semibold leading-snug text-cream/90 md:text-[21px]">
                      {e.title}
                    </h2>
                  )}
                </div>

                {e.sections.map((sec, si) => (
                  <section key={si} className="mt-5 first:mt-4">
                    {sec.title && (
                      <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/45">
                        {sec.title}
                      </h3>
                    )}
                    {sec.bullets.length > 0 && (
                      <ul className={sec.title ? 'mt-2.5 space-y-1.5' : 'space-y-1.5'}>
                        {sec.bullets.map((b, bi) => (
                          <li
                            key={bi}
                            className="flex gap-2.5 text-[13px] leading-relaxed text-cream/65"
                          >
                            <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-ember/60" />
                            <span>{inline(b)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </li>
            ))}
          </ol>
        )}

        <p className="mt-10 flex flex-wrap items-center gap-2 font-mono text-[10px] text-cream/35">
          <ExternalLink className="size-3" />
          <T k="changelog.source" />
        </p>
      </div>
    </AppShell>
  );
}
